package main
import (
	"log"
	"os"
	"github.com/gin-gonic/gin"
	"pgbouncer-manager/internal/auth"
	"pgbouncer-manager/internal/config"
	"pgbouncer-manager/internal/handlers"
	"pgbouncer-manager/internal/registry"
	"pgbouncer-manager/internal/store"
)
func main() {
	cfg := config.Load()
	// Init persistent session store
	os.MkdirAll("/app/data", 0755)
	auth.InitSessions(cfg.SessionsFile)
	serversFile := os.Getenv("PGB_SERVERS_FILE"); if serversFile=="" { serversFile="servers.json" }
	reg, err := registry.Load(serversFile, cfg); if err != nil { log.Fatalf("registry: %v", err) }
	users, err := store.NewUserStore(cfg.UsersFile); if err != nil { log.Fatalf("users: %v", err) }
	audit, err := store.NewAuditStore(cfg.AuditFile); if err != nil { log.Fatalf("audit: %v", err) }
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin","*")
		c.Header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers","Content-Type,Authorization")
		if c.Request.Method=="OPTIONS" { c.AbortWithStatus(204); return }
		c.Next()
	})
	api := handlers.NewAPI(cfg, reg, users, audit)
	api.RegisterRoutes(r)
	r.Static("/assets","./web/dist/assets")
	r.StaticFile("/favicon.ico","./web/dist/favicon.ico")
	r.StaticFile("/favicon.png","./web/dist/favicon.png")
	r.StaticFile("/","./web/dist/index.html")
	r.NoRoute(func(c *gin.Context) { c.File("./web/dist/index.html") })
	log.Printf("pgbouncer-manager listening on %s", cfg.ListenAddr)
	if err := r.Run(cfg.ListenAddr); err != nil { log.Fatal(err) }
}
