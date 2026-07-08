package pgbouncer

import (
	"fmt"
	"os"

	"gopkg.in/ini.v1"
)

// IniManager reads and edits pgbouncer.ini directly. Some settings (notably
// per-database pool_mode) aren't safely changeable via the admin SET command
// and require an ini edit followed by RELOAD.
//
// IMPORTANT: back up the file before writing, and always validate with
// `pgbouncer -d -v pgbouncer.ini --test` style checks if available, or at
// minimum re-parse after writing before calling Reload().
type IniManager struct {
	path string
}

func NewIniManager(path string) *IniManager {
	return &IniManager{path: path}
}

// Section represents key/value pairs under one [section] header.
type Section struct {
	Name   string
	Values map[string]string
}

// ReadAll returns every section in the file (pgbouncer, databases, users).
func (m *IniManager) ReadAll() ([]Section, error) {
	cfg, err := ini.LoadSources(ini.LoadOptions{
		AllowShadows:            true,
		IgnoreInlineComment:     true,
		SkipUnrecognizableLines: true,
	}, m.path)
	if err != nil {
		return nil, fmt.Errorf("load ini %s: %w", m.path, err)
	}

	var out []Section
	for _, s := range cfg.Sections() {
		vals := map[string]string{}
		for _, k := range s.Keys() {
			vals[k.Name()] = k.Value()
		}
		out = append(out, Section{Name: s.Name(), Values: vals})
	}
	return out, nil
}

// SetDatabaseField updates one field (e.g. "pool_mode", "pool_size") for a
// database entry under [databases]. PgBouncer stores each database as a key
// in that section whose value is a connstring-like list of params
// (host=... port=... pool_mode=... etc), so this does a small parse/patch.
func (m *IniManager) SetDatabaseField(dbName, field, value string) error {
	cfg, err := ini.LoadSources(ini.LoadOptions{
		AllowShadows:        true,
		IgnoreInlineComment: true,
	}, m.path)
	if err != nil {
		return fmt.Errorf("load ini: %w", err)
	}

	sec := cfg.Section("databases")
	key := sec.Key(dbName)
	if key.Value() == "" {
		return fmt.Errorf("database %q not found in [databases] section", dbName)
	}

	params := parseConnParams(key.Value())
	params[field] = value
	key.SetValue(buildConnParams(params))

	if err := backupFile(m.path); err != nil {
		return fmt.Errorf("backup before write: %w", err)
	}

	if err := cfg.SaveTo(m.path); err != nil {
		return fmt.Errorf("save ini: %w", err)
	}
	return nil
}

// SetGlobalField updates a key under [pgbouncer], e.g. "default_pool_size",
// "max_client_conn", or the global default "pool_mode".
func (m *IniManager) SetGlobalField(field, value string) error {
	cfg, err := ini.LoadSources(ini.LoadOptions{
		AllowShadows:        true,
		IgnoreInlineComment: true,
	}, m.path)
	if err != nil {
		return fmt.Errorf("load ini: %w", err)
	}

	cfg.Section("pgbouncer").Key(field).SetValue(value)

	if err := backupFile(m.path); err != nil {
		return fmt.Errorf("backup before write: %w", err)
	}
	if err := cfg.SaveTo(m.path); err != nil {
		return fmt.Errorf("save ini: %w", err)
	}
	return nil
}

func backupFile(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return os.WriteFile(path+".bak", data, 0640)
}

// parseConnParams turns "host=127.0.0.1 port=5432 pool_mode=session"
// into a map. Naive whitespace split — adequate since pgbouncer database
// lines don't normally contain quoted values with spaces.
func parseConnParams(s string) map[string]string {
	out := map[string]string{}
	key := ""
	val := ""
	inKey := true
	for _, r := range s {
		switch {
		case r == '=' && inKey:
			inKey = false
		case r == ' ' && !inKey:
			if key != "" {
				out[key] = val
			}
			key, val, inKey = "", "", true
		case inKey:
			key += string(r)
		default:
			val += string(r)
		}
	}
	if key != "" {
		out[key] = val
	}
	return out
}

func buildConnParams(params map[string]string) string {
	out := ""
	for k, v := range params {
		if out != "" {
			out += " "
		}
		out += k + "=" + v
	}
	return out
}
