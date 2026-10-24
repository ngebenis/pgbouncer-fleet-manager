package handlers
import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"github.com/gin-gonic/gin"
	"pgbouncer-manager/internal/auth"
	"pgbouncer-manager/internal/config"
	"pgbouncer-manager/internal/registry"
	"pgbouncer-manager/internal/store"
)
type AlertConfig struct {
	ClWaitingThreshold int  `json:"cl_waiting_threshold"`
	MaxwaitMsThreshold int  `json:"maxwait_ms_threshold"`
	Enabled            bool `json:"enabled"`
}
type BrandingConfig struct {
	CompanyName string `json:"company_name"`
	AppName     string `json:"app_name"`
	AppSub      string `json:"app_sub"`
	LogoMime    string `json:"logo_mime"`
	HasLogo     bool   `json:"has_logo"`
}
type API struct {
	cfg      *config.Config
	reg      *registry.Registry
	users    *store.UserStore
	audit    *store.AuditStore
	alerts   AlertConfig
	branding BrandingConfig
}
func NewAPI(cfg *config.Config, reg *registry.Registry, users *store.UserStore, audit *store.AuditStore) *API {
	a := &API{cfg:cfg, reg:reg, users:users, audit:audit,
		alerts:AlertConfig{ClWaitingThreshold:1, MaxwaitMsThreshold:5000, Enabled:true},
		branding:BrandingConfig{AppName:"PgBouncer", AppSub:"Manager"}}
	if data, err := os.ReadFile(cfg.AlertsFile); err == nil { json.Unmarshal(data, &a.alerts) }
	if data, err := os.ReadFile(cfg.BrandingFile); err == nil { json.Unmarshal(data, &a.branding) }
	return a
}
func (a *API) resolve(c *gin.Context) (*registry.Instance, bool) {
	id := c.Query("server")
	if id == "" {
		list := a.reg.List()
		if len(list) == 0 { c.JSON(http.StatusServiceUnavailable, gin.H{"error":"no servers configured"}); return nil, false }
		return list[0], true
	}
	inst, ok := a.reg.Get(id)
	if !ok { c.JSON(http.StatusNotFound, gin.H{"error":fmt.Sprintf("server %q not found", id)}); return nil, false }
	return inst, true
}
func (a *API) RegisterRoutes(r *gin.Engine) {
	r.POST("/api/auth/login", a.loginHandler)
	r.GET("/api/branding", a.getBranding)
	r.GET("/api/branding/logo", a.getBrandingLogo)
	api := r.Group("/api"); api.Use(auth.Required)
	{
		api.POST("/auth/logout", a.logoutHandler)
		api.GET("/auth/me", a.meHandler)
		api.POST("/auth/change-password", a.changeOwnPassword)
		api.GET("/servers-list", a.listServers)
		api.POST("/servers", auth.AdminOnly, a.addServer)
		api.PUT("/servers/:id", auth.AdminOnly, a.updateServer)
		api.DELETE("/servers/:id", auth.AdminOnly, a.deleteServer)
		api.POST("/servers/:id/test", a.testServer)
		api.GET("/ssh-pubkey", a.getSSHPubKey)
		api.GET("/users", auth.AdminOnly, a.listUsers)
		api.POST("/users", auth.AdminOnly, a.createUser)
		api.PUT("/users/:username", auth.AdminOnly, a.updateUser)
		api.DELETE("/users/:username", auth.AdminOnly, a.deleteUser)
		api.GET("/audit", auth.AdminOnly, a.listAudit)
		api.GET("/backup", auth.AdminOnly, a.backup)
		api.POST("/restore", auth.AdminOnly, a.restore)
		api.GET("/alerts", a.getAlerts)
		api.PUT("/alerts", auth.AdminOnly, a.setAlerts)
		api.PUT("/branding", auth.AdminOnly, a.setBranding)
		api.POST("/branding/logo", auth.AdminOnly, a.uploadBrandingLogo)
		api.DELETE("/branding/logo", auth.AdminOnly, a.deleteBrandingLogo)
		api.GET("/status", a.getServiceStatus)
		api.GET("/pools", a.getPools)
		api.GET("/clients", a.getClients)
		api.GET("/servers", a.getServerConns)
		api.GET("/stats", a.getStats)
		api.GET("/databases", a.getDatabases)
		api.GET("/config", a.getConfig)
		api.GET("/lists", a.getLists)
		api.GET("/version", a.getVersion)
		svc := api.Group("/service"); svc.Use(auth.AdminOnly)
		svc.POST("/start", a.startService); svc.POST("/stop", a.stopService); svc.POST("/restart", a.restartService)
		adm := api.Group("/admin"); adm.Use(auth.AdminOnly)
		adm.POST("/reload", a.reload); adm.POST("/pause", a.pause); adm.POST("/resume", a.resume)
		adm.POST("/kill", a.kill); adm.POST("/set", a.setParam)
		ce := api.Group("/config-edit"); ce.Use(auth.AdminOnly)
		ce.GET("/raw", a.getRawConfig); ce.POST("/database-field", a.setDatabaseField); ce.POST("/global-field", a.setGlobalField)
	}
}
// Auth
func (a *API) loginHandler(c *gin.Context) {
	var b struct{ Username, Password string }
	if err := c.ShouldBindJSON(&b); err != nil { c.JSON(400, gin.H{"error":"invalid request"}); return }
	user, err := a.users.Authenticate(b.Username, b.Password)
	if err != nil {
		a.audit.Log(b.Username, "login", "", auth.GetIP(c), false, "invalid credentials")
		c.JSON(401, gin.H{"error":"invalid credentials"}); return
	}
	token, _ := auth.Sessions.Create(user.Username, user.Role)
	a.audit.Log(user.Username, "login", "", auth.GetIP(c), true, "")
	c.JSON(200, gin.H{"token":token, "username":user.Username, "role":user.Role})
}
func (a *API) logoutHandler(c *gin.Context) {
	auth.Sessions.Delete(auth.ExtractToken(c))
	a.audit.Log(auth.GetUser(c), "logout", "", auth.GetIP(c), true, "")
	c.JSON(200, gin.H{"ok":true})
}
func (a *API) meHandler(c *gin.Context) {
	role, _ := c.Get("role"); c.JSON(200, gin.H{"username":auth.GetUser(c), "role":role})
}
func (a *API) changeOwnPassword(c *gin.Context) {
	var b struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&b); err != nil {
		c.JSON(400, gin.H{"error": "invalid request: " + err.Error()}); return
	}
	if b.OldPassword == "" || b.NewPassword == "" {
		c.JSON(400, gin.H{"error": "old and new password required"}); return
	}
	username := auth.GetUser(c)
	if _, err := a.users.Authenticate(username, b.OldPassword); err != nil {
		c.JSON(401, gin.H{"error": "password lama salah"}); return
	}
	if err := a.users.UpdatePassword(username, b.NewPassword); err != nil {
		c.JSON(500, gin.H{"error": err.Error()}); return
	}
	a.audit.Log(username, "user.change_password", username, auth.GetIP(c), true, "self")
	c.JSON(200, gin.H{"ok": true})
}
// Users
func (a *API) listUsers(c *gin.Context) { c.JSON(200, gin.H{"users":a.users.List()}) }
func (a *API) createUser(c *gin.Context) {
	var b struct{ Username, Password string; Role store.Role }
	if err := c.ShouldBindJSON(&b); err != nil || b.Username == "" || b.Password == "" { c.JSON(400, gin.H{"error":"username password role required"}); return }
	if b.Role != store.RoleAdmin && b.Role != store.RoleViewer { b.Role = store.RoleViewer }
	if err := a.users.Create(b.Username, b.Password, b.Role, auth.GetUser(c)); err != nil { c.JSON(409, gin.H{"error":err.Error()}); return }
	a.audit.Log(auth.GetUser(c), "user.create", b.Username, auth.GetIP(c), true, string(b.Role))
	c.JSON(200, gin.H{"ok":true})
}
func (a *API) updateUser(c *gin.Context) {
	username := c.Param("username")
	var b struct{ Role store.Role; Password string }
	c.ShouldBindJSON(&b)
	if b.Role != "" { a.users.UpdateRole(username, b.Role); a.audit.Log(auth.GetUser(c), "user.update_role", username, auth.GetIP(c), true, string(b.Role)) }
	if b.Password != "" { a.users.UpdatePassword(username, b.Password); a.audit.Log(auth.GetUser(c), "user.change_password", username, auth.GetIP(c), true, "by admin") }
	c.JSON(200, gin.H{"ok":true})
}
func (a *API) deleteUser(c *gin.Context) {
	username := c.Param("username")
	if username == auth.GetUser(c) { c.JSON(400, gin.H{"error":"cannot delete yourself"}); return }
	if err := a.users.Delete(username); err != nil { c.JSON(400, gin.H{"error":err.Error()}); return }
	a.audit.Log(auth.GetUser(c), "user.delete", username, auth.GetIP(c), true, "")
	c.JSON(200, gin.H{"ok":true})
}
// Audit
func (a *API) listAudit(c *gin.Context) {
	limit := 200
	if l := c.Query("limit"); l != "" { if n, err := strconv.Atoi(l); err == nil { limit = n } }
	c.JSON(200, gin.H{"entries":a.audit.List(limit)})
}
// Backup
func (a *API) backup(c *gin.Context) {
	buf := new(bytes.Buffer); w := zip.NewWriter(buf)
	for name, path := range map[string]string{"servers.json":a.cfg.ServersFile,"users.json":a.cfg.UsersFile} {
		if data, err := os.ReadFile(path); err == nil { f,_ := w.Create(name); f.Write(data) }
	}
	w.Close()
	a.audit.Log(auth.GetUser(c), "backup.download", "", auth.GetIP(c), true, "")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=pgbm-backup-%s.zip", time.Now().Format("20060102-150405")))
	c.Data(200, "application/zip", buf.Bytes())
}
func (a *API) restore(c *gin.Context) {
	file, err := c.FormFile("backup")
	if err != nil { c.JSON(400, gin.H{"error":"backup file required"}); return }
	src, _ := file.Open(); defer src.Close()
	data, _ := io.ReadAll(src)
	r, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil { c.JSON(400, gin.H{"error":"invalid zip"}); return }
	restored := []string{}
	targets := map[string]string{"servers.json":a.cfg.ServersFile,"users.json":a.cfg.UsersFile}
	for _, f := range r.File {
		dest, ok := targets[f.Name]; if !ok { continue }
		rc, _ := f.Open(); content, _ := io.ReadAll(rc); rc.Close()
		var js json.RawMessage
		if err := json.Unmarshal(content, &js); err != nil { c.JSON(400, gin.H{"error":f.Name+" invalid JSON"}); return }
		os.WriteFile(dest, content, 0640); restored = append(restored, f.Name)
	}
	a.audit.Log(auth.GetUser(c), "backup.restore", "", auth.GetIP(c), true, strings.Join(restored,","))
	c.JSON(200, gin.H{"ok":true,"restored":restored,"note":"restart container to apply servers.json changes"})
}
// Alerts
func (a *API) getAlerts(c *gin.Context) { c.JSON(200, a.alerts) }
func (a *API) setAlerts(c *gin.Context) {
	var b AlertConfig
	if err := c.ShouldBindJSON(&b); err != nil { c.JSON(400, gin.H{"error":"invalid"}); return }
	a.alerts = b; data, _ := json.MarshalIndent(b, "", "  "); os.WriteFile(a.cfg.AlertsFile, data, 0640)
	a.audit.Log(auth.GetUser(c), "alerts.update", "", auth.GetIP(c), true, "")
	c.JSON(200, gin.H{"ok":true})
}
// Branding
func (a *API) getBranding(c *gin.Context) { c.JSON(200, a.branding) }
func (a *API) saveBranding() {
	data, _ := json.MarshalIndent(a.branding, "", "  ")
	os.WriteFile(a.cfg.BrandingFile, data, 0640)
}
func (a *API) setBranding(c *gin.Context) {
	var body struct {
		CompanyName string `json:"company_name"`
		AppName     string `json:"app_name"`
		AppSub      string `json:"app_sub"`
	}
	if err := c.ShouldBindJSON(&body); err != nil { c.JSON(400, gin.H{"error":"invalid request"}); return }
	a.branding.CompanyName = strings.TrimSpace(body.CompanyName)
	a.branding.AppName = strings.TrimSpace(body.AppName); if a.branding.AppName == "" { a.branding.AppName = "PgBouncer" }
	a.branding.AppSub = strings.TrimSpace(body.AppSub); if a.branding.AppSub == "" { a.branding.AppSub = "Manager" }
	a.saveBranding()
	a.audit.Log(auth.GetUser(c), "branding.update", "", auth.GetIP(c), true, a.branding.CompanyName)
	c.JSON(200, gin.H{"ok":true})
}
const maxLogoSize = 2 << 20 // 2MB
var allowedLogoMime = map[string]bool{"image/png":true,"image/jpeg":true,"image/svg+xml":true,"image/webp":true,"image/x-icon":true}
func (a *API) uploadBrandingLogo(c *gin.Context) {
	file, err := c.FormFile("logo")
	if err != nil { c.JSON(400, gin.H{"error":"logo file required"}); return }
	if file.Size > maxLogoSize { c.JSON(400, gin.H{"error":"ukuran logo maksimal 2MB"}); return }
	mime := file.Header.Get("Content-Type")
	if !allowedLogoMime[mime] { c.JSON(400, gin.H{"error":"format harus PNG, JPEG, WEBP, atau SVG"}); return }
	if err := c.SaveUploadedFile(file, a.cfg.LogoFile); err != nil { c.JSON(500, gin.H{"error":err.Error()}); return }
	a.branding.LogoMime = mime
	a.branding.HasLogo = true
	a.saveBranding()
	a.audit.Log(auth.GetUser(c), "branding.logo_upload", "", auth.GetIP(c), true, mime)
	c.JSON(200, gin.H{"ok":true})
}
func (a *API) deleteBrandingLogo(c *gin.Context) {
	os.Remove(a.cfg.LogoFile)
	a.branding.LogoMime = ""
	a.branding.HasLogo = false
	a.saveBranding()
	a.audit.Log(auth.GetUser(c), "branding.logo_reset", "", auth.GetIP(c), true, "")
	c.JSON(200, gin.H{"ok":true})
}
func (a *API) getBrandingLogo(c *gin.Context) {
	if !a.branding.HasLogo { c.Status(http.StatusNotFound); return }
	data, err := os.ReadFile(a.cfg.LogoFile)
	if err != nil { c.Status(http.StatusNotFound); return }
	mime := a.branding.LogoMime; if mime == "" { mime = "image/png" }
	c.Header("Cache-Control", "no-cache, max-age=0")
	c.Data(http.StatusOK, mime, data)
}
// Server CRUD
type serverInfo struct {
	ID          string `json:"id"`
	Label       string `json:"label"`
	Host        string `json:"host"`
	Port        string `json:"port"`
	ControlMode string `json:"control_mode"`
	SSHHost     string `json:"ssh_host"`
	SSHUser     string `json:"ssh_user"`
}
func (a *API) listServers(c *gin.Context) {
	list := a.reg.List(); out := make([]serverInfo, len(list))
	for i, inst := range list { out[i] = serverInfo{ID:inst.Def.ID,Label:inst.Def.Label,Host:inst.Def.AdminHost,Port:inst.Def.AdminPort,ControlMode:inst.Def.ControlMode,SSHHost:inst.Def.SSHHost,SSHUser:inst.Def.SSHUser} }
	c.JSON(200, gin.H{"servers":out})
}
type srvForm struct {
	ID          string `json:"id"`
	Label       string `json:"label"`
	AdminHost   string `json:"admin_host"`
	AdminPort   string `json:"admin_port"`
	AdminUser   string `json:"admin_user"`
	AdminPass   string `json:"admin_pass"`
	IniPath     string `json:"ini_path"`
	ServiceName string `json:"service_name"`
	ControlMode string `json:"control_mode"`
	SSHHost     string `json:"ssh_host"`
	SSHPort     string `json:"ssh_port"`
	SSHUser     string `json:"ssh_user"`
	SSHKeyPath  string `json:"ssh_key_path"`
	SSHUseSudo  bool   `json:"ssh_use_sudo"`
}
func (b *srvForm) toDef() *registry.ServerDef {
	p := b.AdminPort; if p=="" { p="6432" }
	sp := b.SSHPort; if sp=="" { sp="22" }
	kp := b.SSHKeyPath; if kp=="" { kp="/run/secrets/pgb_ssh_key" }
	sn := b.ServiceName; if sn=="" { sn="pgbouncer" }
	return &registry.ServerDef{ID:strings.TrimSpace(b.ID),Label:b.Label,AdminHost:b.AdminHost,AdminPort:p,AdminUser:b.AdminUser,AdminPass:b.AdminPass,IniPath:b.IniPath,ServiceName:sn,ControlMode:b.ControlMode,SSHHost:b.SSHHost,SSHPort:sp,SSHUser:b.SSHUser,SSHKeyPath:kp,SSHUseSudo:b.SSHUseSudo}
}
func (a *API) addServer(c *gin.Context) {
	var b srvForm; c.ShouldBindJSON(&b)
	if b.ID=="" || b.AdminHost=="" { c.JSON(400, gin.H{"error":"id and admin_host required"}); return }
	if err := a.reg.Add(b.toDef()); err != nil { c.JSON(409, gin.H{"error":err.Error()}); return }
	a.audit.Log(auth.GetUser(c), "server.add", b.ID, auth.GetIP(c), true, b.Label); c.JSON(200, gin.H{"ok":true})
}
func (a *API) updateServer(c *gin.Context) {
	id := c.Param("id"); var b srvForm; c.ShouldBindJSON(&b)
	def := b.toDef(); def.ID = id
	if def.AdminPass == "" { if ex, ok := a.reg.Get(id); ok { def.AdminPass = ex.Def.AdminPass } }
	if err := a.reg.Update(id, def); err != nil { c.JSON(404, gin.H{"error":err.Error()}); return }
	a.audit.Log(auth.GetUser(c), "server.update", id, auth.GetIP(c), true, b.Label); c.JSON(200, gin.H{"ok":true})
}
func (a *API) deleteServer(c *gin.Context) {
	id := c.Param("id")
	if err := a.reg.Delete(id); err != nil { c.JSON(400, gin.H{"error":err.Error()}); return }
	a.audit.Log(auth.GetUser(c), "server.delete", id, auth.GetIP(c), true, ""); c.JSON(200, gin.H{"ok":true})
}
func (a *API) testServer(c *gin.Context) {
	id := c.Param("id"); inst, ok := a.reg.Get(id)
	if !ok { c.JSON(404, gin.H{"error":"not found"}); return }
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second); defer cancel()
	ver, err := inst.Pgb.ShowVersion(ctx)
	if err != nil { c.JSON(502, gin.H{"ok":false,"error":err.Error()}); return }
	c.JSON(200, gin.H{"ok":true,"version":ver})
}
// Monitoring
func (a *API) getServiceStatus(c *gin.Context) {
	inst,ok := a.resolve(c); if !ok { return }
	s, err := inst.Svc.Status(c.Request.Context())
	if err != nil && s=="unknown" { c.JSON(500,gin.H{"error":err.Error()}); return }
	c.JSON(200, gin.H{"status":s})
}
func (a *API) getPools(c *gin.Context)      { inst,ok:=a.resolve(c); if !ok{return}; rows,err:=inst.Pgb.ShowPools(c.Request.Context()); respondRows(c,rows,err) }
func (a *API) getClients(c *gin.Context)    { inst,ok:=a.resolve(c); if !ok{return}; rows,err:=inst.Pgb.ShowClients(c.Request.Context()); respondRows(c,rows,err) }
func (a *API) getServerConns(c *gin.Context){ inst,ok:=a.resolve(c); if !ok{return}; rows,err:=inst.Pgb.ShowServers(c.Request.Context()); respondRows(c,rows,err) }
func (a *API) getStats(c *gin.Context)      { inst,ok:=a.resolve(c); if !ok{return}; rows,err:=inst.Pgb.ShowStats(c.Request.Context()); respondRows(c,rows,err) }
func (a *API) getDatabases(c *gin.Context)  { inst,ok:=a.resolve(c); if !ok{return}; rows,err:=inst.Pgb.ShowDatabases(c.Request.Context()); respondRows(c,rows,err) }
func (a *API) getConfig(c *gin.Context)     { inst,ok:=a.resolve(c); if !ok{return}; rows,err:=inst.Pgb.ShowConfig(c.Request.Context()); respondRows(c,rows,err) }
func (a *API) getLists(c *gin.Context)      { inst,ok:=a.resolve(c); if !ok{return}; rows,err:=inst.Pgb.ShowLists(c.Request.Context()); respondRows(c,rows,err) }
func (a *API) getVersion(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}
	v,err:=inst.Pgb.ShowVersion(c.Request.Context())
	if err!=nil{c.JSON(500,gin.H{"error":err.Error()}); return}; c.JSON(200,gin.H{"version":v})
}
func respondRows(c *gin.Context, rows []map[string]any, err error) {
	if err!=nil{c.JSON(500,gin.H{"error":err.Error()}); return}; c.JSON(200,gin.H{"rows":rows})
}
func respondAction(c *gin.Context, output string, err error) {
	if err!=nil{c.JSON(500,gin.H{"error":err.Error(),"output":output}); return}; c.JSON(200,gin.H{"ok":true,"output":output})
}
// Service
func (a *API) startService(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}; out,err:=inst.Svc.Start(c.Request.Context())
	a.audit.Log(auth.GetUser(c),"service.start",c.Query("server"),auth.GetIP(c),err==nil,out); respondAction(c,out,err)
}
func (a *API) stopService(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}; out,err:=inst.Svc.Stop(c.Request.Context())
	a.audit.Log(auth.GetUser(c),"service.stop",c.Query("server"),auth.GetIP(c),err==nil,out); respondAction(c,out,err)
}
func (a *API) restartService(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}; out,err:=inst.Svc.Restart(c.Request.Context())
	a.audit.Log(auth.GetUser(c),"service.restart",c.Query("server"),auth.GetIP(c),err==nil,out); respondAction(c,out,err)
}
// Admin
type dbBody struct{ Database string }
type setBody struct{ Key, Value string }
func (a *API) reload(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}; err:=inst.Pgb.Reload(c.Request.Context())
	a.audit.Log(auth.GetUser(c),"admin.reload",c.Query("server"),auth.GetIP(c),err==nil,""); respondAction(c,"",err)
}
func (a *API) pause(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}; var b dbBody; c.ShouldBindJSON(&b)
	err:=inst.Pgb.Pause(c.Request.Context(),b.Database)
	a.audit.Log(auth.GetUser(c),"admin.pause",b.Database,auth.GetIP(c),err==nil,""); respondAction(c,"",err)
}
func (a *API) resume(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}; var b dbBody; c.ShouldBindJSON(&b)
	err:=inst.Pgb.Resume(c.Request.Context(),b.Database)
	a.audit.Log(auth.GetUser(c),"admin.resume",b.Database,auth.GetIP(c),err==nil,""); respondAction(c,"",err)
}
func (a *API) kill(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}; var b dbBody
	if err:=c.ShouldBindJSON(&b); err!=nil||b.Database=="" { c.JSON(400,gin.H{"error":"database required"}); return }
	err:=inst.Pgb.KillDatabase(c.Request.Context(),b.Database)
	a.audit.Log(auth.GetUser(c),"admin.kill",b.Database,auth.GetIP(c),err==nil,""); respondAction(c,"",err)
}
func (a *API) setParam(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}; var b setBody
	if err:=c.ShouldBindJSON(&b); err!=nil||b.Key=="" { c.JSON(400,gin.H{"error":"key value required"}); return }
	err:=inst.Pgb.SetParameter(c.Request.Context(),b.Key,b.Value)
	a.audit.Log(auth.GetUser(c),"admin.set",fmt.Sprintf("%s=%s",b.Key,b.Value),auth.GetIP(c),err==nil,""); respondAction(c,"",err)
}
// Config
func (a *API) getRawConfig(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}
	if inst.Ini==nil{c.JSON(404,gin.H{"error":"ini_path not configured"}); return}
	sections,err:=inst.Ini.ReadAll()
	if err!=nil{c.JSON(500,gin.H{"error":err.Error()}); return}; c.JSON(200,gin.H{"sections":sections})
}
type dbFieldBody struct{ Database,Field,Value string }
type globalFieldBody struct{ Field,Value string }
func (a *API) setDatabaseField(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}
	if inst.Ini==nil{c.JSON(404,gin.H{"error":"ini_path not configured"}); return}
	var b dbFieldBody
	if err:=c.ShouldBindJSON(&b); err!=nil||b.Database==""||b.Field==""{ c.JSON(400,gin.H{"error":"database field value required"}); return }
	if err:=inst.Ini.SetDatabaseField(b.Database,b.Field,b.Value); err!=nil{c.JSON(500,gin.H{"error":err.Error()}); return}
	err:=inst.Pgb.Reload(c.Request.Context())
	a.audit.Log(auth.GetUser(c),"config.db_field",fmt.Sprintf("%s.%s=%s",b.Database,b.Field,b.Value),auth.GetIP(c),err==nil,""); respondAction(c,"",err)
}
func (a *API) setGlobalField(c *gin.Context) {
	inst,ok:=a.resolve(c); if !ok{return}
	if inst.Ini==nil{c.JSON(404,gin.H{"error":"ini_path not configured"}); return}
	var b globalFieldBody
	if err:=c.ShouldBindJSON(&b); err!=nil||b.Field==""{ c.JSON(400,gin.H{"error":"field value required"}); return }
	if err:=inst.Ini.SetGlobalField(b.Field,b.Value); err!=nil{c.JSON(500,gin.H{"error":err.Error()}); return}
	err:=inst.Pgb.Reload(c.Request.Context())
	a.audit.Log(auth.GetUser(c),"config.global_field",fmt.Sprintf("%s=%s",b.Field,b.Value),auth.GetIP(c),err==nil,""); respondAction(c,"",err)
}

// getSSHPubKey returns the public key content so admin can deploy it to remote servers
func (a *API) getSSHPubKey(c *gin.Context) {
	// Try <key_path>.pub first, fallback to configured path
	keyPath := a.cfg.SSHPrivateKey + ".pub"
	data, err := os.ReadFile(keyPath)
	if err != nil {
		// Some setups name it differently, try without extension swap
		c.JSON(http.StatusNotFound, gin.H{"error": "Public key tidak ditemukan di " + keyPath + ". Pastikan file .pub ada di samping private key."})
		return
	}
	pubKey := strings.TrimSpace(string(data))
	a.audit.Log(auth.GetUser(c), "ssh.view_pubkey", "", auth.GetIP(c), true, "")
	c.JSON(http.StatusOK, gin.H{
		"public_key": pubKey,
		"key_path":   keyPath,
	})
}
