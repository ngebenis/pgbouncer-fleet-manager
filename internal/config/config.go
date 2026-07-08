package config
import "os"
type Config struct {
	AdminHost, AdminPort, AdminUser, AdminPass string
	IniPath, UserlistPath, ServiceName string
	ControlMode, SSHHost, SSHPort, SSHUser, SSHPrivateKey string
	SSHUseSudo bool
	ListenAddr, ServersFile, UsersFile, AuditFile, AlertsFile, SessionsFile string
}
func Load() *Config {
	return &Config{
		AdminHost:     getenv("PGB_ADMIN_HOST", "127.0.0.1"),
		AdminPort:     getenv("PGB_ADMIN_PORT", "6432"),
		AdminUser:     getenv("PGB_ADMIN_USER", "pgbouncer_admin"),
		AdminPass:     getenv("PGB_ADMIN_PASS", ""),
		IniPath:       getenv("PGB_INI_PATH", "/etc/pgbouncer/pgbouncer.ini"),
		UserlistPath:  getenv("PGB_USERLIST_PATH", "/etc/pgbouncer/userlist.txt"),
		ServiceName:   getenv("PGB_SERVICE_NAME", "pgbouncer"),
		ControlMode:   getenv("PGB_CONTROL_MODE", "ssh"),
		SSHHost:       getenv("PGB_SSH_HOST", ""),
		SSHPort:       getenv("PGB_SSH_PORT", "22"),
		SSHUser:       getenv("PGB_SSH_USER", ""),
		SSHPrivateKey: getenv("PGB_SSH_PRIVATE_KEY", "/run/secrets/pgb_ssh_key"),
		SSHUseSudo:    getenv("PGB_SSH_USE_SUDO", "true") == "true",
		ListenAddr:    getenv("PGB_LISTEN_ADDR", ":8088"),
		ServersFile:   getenv("PGB_SERVERS_FILE", "servers.json"),
		UsersFile:     getenv("PGB_USERS_FILE", "/app/data/users.json"),
		AuditFile:     getenv("PGB_AUDIT_FILE", "/app/data/audit.json"),
		AlertsFile:    getenv("PGB_ALERTS_FILE", "/app/data/alerts.json"),
		SessionsFile:  getenv("PGB_SESSIONS_FILE", "/app/data/sessions.json"),
	}
}
func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" { return v }
	return fallback
}
