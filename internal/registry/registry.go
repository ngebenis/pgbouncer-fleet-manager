package registry

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"

	"pgbouncer-manager/internal/config"
	"pgbouncer-manager/internal/pgbouncer"
	"pgbouncer-manager/internal/service"
)

// ServerDef is one PgBouncer server entry stored in servers.json.
// When managed via GUI, values are stored as plain strings (no ${VAR} expansion).
type ServerDef struct {
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

type Instance struct {
	Def *ServerDef
	Pgb *pgbouncer.Client
	Svc service.Controller
	Ini *pgbouncer.IniManager
}

type Registry struct {
	mu        sync.RWMutex
	instances map[string]*Instance
	order     []string
	filePath  string // path to servers.json for persistence
}

// Load reads servers.json. Values support ${ENV_VAR} expansion for
// deployment-time config; the GUI writes literal values directly.
func Load(serversFile string, fallback *config.Config) (*Registry, error) {
	r := &Registry{
		instances: map[string]*Instance{},
		filePath:  serversFile,
	}

	var defs []ServerDef

	if data, err := os.ReadFile(serversFile); err == nil {
		expanded := os.Expand(string(data), os.Getenv)
		var wrapper struct {
			Servers []ServerDef `json:"servers"`
		}
		if err := json.Unmarshal([]byte(expanded), &wrapper); err != nil {
			return nil, fmt.Errorf("parse %s: %w", serversFile, err)
		}
		defs = wrapper.Servers
	} else {
		// No file yet — seed from env-based fallback config
		defs = []ServerDef{{
			ID:          "default",
			Label:       fallback.AdminHost,
			AdminHost:   fallback.AdminHost,
			AdminPort:   fallback.AdminPort,
			AdminUser:   fallback.AdminUser,
			AdminPass:   fallback.AdminPass,
			IniPath:     fallback.IniPath,
			ServiceName: fallback.ServiceName,
			ControlMode: fallback.ControlMode,
			SSHHost:     fallback.SSHHost,
			SSHPort:     fallback.SSHPort,
			SSHUser:     fallback.SSHUser,
			SSHKeyPath:  fallback.SSHPrivateKey,
			SSHUseSudo:  fallback.SSHUseSudo,
		}}
	}

	for i := range defs {
		if err := r.register(&defs[i]); err != nil {
			return nil, fmt.Errorf("init server %q: %w", defs[i].ID, err)
		}
	}
	return r, nil
}

func (r *Registry) register(d *ServerDef) error {
	inst, err := buildInstance(d)
	if err != nil {
		return err
	}
	r.instances[d.ID] = inst
	// only append to order if not already present
	for _, id := range r.order {
		if id == d.ID {
			return nil
		}
	}
	r.order = append(r.order, d.ID)
	return nil
}

func buildInstance(d *ServerDef) (*Instance, error) {
	pgbClient := pgbouncer.NewClient(d.AdminHost, d.AdminPort, d.AdminUser, d.AdminPass)
	var ini *pgbouncer.IniManager
	if d.IniPath != "" {
		ini = pgbouncer.NewIniManager(d.IniPath)
	}

	var ctrl service.Controller
	switch d.ControlMode {
	case "ssh":
		keyPath := d.SSHKeyPath
		if keyPath == "" {
			keyPath = "/run/secrets/pgb_ssh_key"
		}
		port := d.SSHPort
		if port == "" {
			port = "22"
		}
		c, err := service.NewSSHController(d.SSHHost, port, d.SSHUser, keyPath, d.ServiceName, d.SSHUseSudo, "")
		if err != nil {
			return nil, err
		}
		ctrl = c
	default:
		ctrl = service.NewSystemdController(d.ServiceName, true)
	}

	return &Instance{Def: d, Pgb: pgbClient, Svc: ctrl, Ini: ini}, nil
}

// --- Read ---

func (r *Registry) Get(id string) (*Instance, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	inst, ok := r.instances[id]
	return inst, ok
}

func (r *Registry) List() []*Instance {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]*Instance, 0, len(r.order))
	for _, id := range r.order {
		if inst, ok := r.instances[id]; ok {
			out = append(out, inst)
		}
	}
	return out
}

// --- Write (CRUD) ---

// Add registers a new server and persists to servers.json.
func (r *Registry) Add(def *ServerDef) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, exists := r.instances[def.ID]; exists {
		return fmt.Errorf("server id %q already exists", def.ID)
	}
	if err := r.register(def); err != nil {
		return err
	}
	return r.save()
}

// Update replaces an existing server definition and rebuilds its client.
// Fields that are empty string in def are preserved from the existing definition.
func (r *Registry) Update(id string, def *ServerDef) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	existing, exists := r.instances[id]
	if !exists {
		return fmt.Errorf("server %q not found", id)
	}
	// Merge: keep existing value for any field left blank in the update
	merged := *existing.Def
	merged.ID = id
	if def.Label       != "" { merged.Label       = def.Label }
	if def.AdminHost   != "" { merged.AdminHost   = def.AdminHost }
	if def.AdminPort   != "" { merged.AdminPort   = def.AdminPort }
	if def.AdminUser   != "" { merged.AdminUser   = def.AdminUser }
	if def.AdminPass   != "" { merged.AdminPass   = def.AdminPass }
	if def.IniPath     != "" { merged.IniPath     = def.IniPath }
	if def.ServiceName != "" { merged.ServiceName = def.ServiceName }
	if def.ControlMode != "" { merged.ControlMode = def.ControlMode }
	if def.SSHHost     != "" { merged.SSHHost     = def.SSHHost }
	if def.SSHPort     != "" { merged.SSHPort     = def.SSHPort }
	if def.SSHUser     != "" { merged.SSHUser     = def.SSHUser }
	if def.SSHKeyPath  != "" { merged.SSHKeyPath  = def.SSHKeyPath }
	merged.SSHUseSudo = def.SSHUseSudo
	inst, err := buildInstance(&merged)
	if err != nil {
		return err
	}
	r.instances[id] = inst
	return r.save()
}

// Delete removes a server. Returns error if it's the last one.
func (r *Registry) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, exists := r.instances[id]; !exists {
		return fmt.Errorf("server %q not found", id)
	}
	if len(r.order) <= 1 {
		return fmt.Errorf("tidak bisa menghapus server terakhir")
	}
	delete(r.instances, id)
	newOrder := make([]string, 0, len(r.order)-1)
	for _, oid := range r.order {
		if oid != id {
			newOrder = append(newOrder, oid)
		}
	}
	r.order = newOrder
	return r.save()
}

// save writes current state to servers.json (call with lock held).
func (r *Registry) save() error {
	if r.filePath == "" {
		return nil
	}
	defs := make([]ServerDef, 0, len(r.order))
	for _, id := range r.order {
		if inst, ok := r.instances[id]; ok {
			defs = append(defs, *inst.Def)
		}
	}
	wrapper := struct {
		Servers []ServerDef `json:"servers"`
	}{Servers: defs}
	data, err := json.MarshalIndent(wrapper, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal servers: %w", err)
	}
	return os.WriteFile(r.filePath, data, 0640)
}
