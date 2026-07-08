package auth
import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
	"github.com/gin-gonic/gin"
	"pgbouncer-manager/internal/store"
)
type Session struct {
	Username  string     `json:"username"`
	Role      store.Role `json:"role"`
	ExpiresAt time.Time  `json:"expires_at"`
}
type SessionStore struct {
	mu       sync.RWMutex
	sessions map[string]*Session
	filePath string
}
var Sessions = &SessionStore{sessions: map[string]*Session{}}
func InitSessions(filePath string) {
	Sessions.filePath = filePath
	Sessions.load()
	go func() {
		for range time.Tick(10 * time.Minute) {
			Sessions.cleanup()
			Sessions.persist()
		}
	}()
}
func (s *SessionStore) load() {
	data, err := os.ReadFile(s.filePath)
	if err != nil { return }
	var wrapper struct{ Sessions map[string]*Session `json:"sessions"` }
	if err := json.Unmarshal(data, &wrapper); err != nil { return }
	s.mu.Lock(); defer s.mu.Unlock()
	now := time.Now()
	for token, sess := range wrapper.Sessions {
		if now.Before(sess.ExpiresAt) { s.sessions[token] = sess }
	}
}
func (s *SessionStore) persist() {
	s.mu.RLock()
	cp := make(map[string]*Session, len(s.sessions))
	for k, v := range s.sessions { cp[k] = v }
	s.mu.RUnlock()
	wrapper := struct{ Sessions map[string]*Session `json:"sessions"` }{Sessions: cp}
	data, err := json.MarshalIndent(wrapper, "", "  ")
	if err != nil { return }
	os.WriteFile(s.filePath, data, 0600)
}
func (s *SessionStore) Create(username string, role store.Role) (string, error) {
	b := make([]byte, 32); rand.Read(b)
	token := hex.EncodeToString(b)
	s.mu.Lock()
	s.sessions[token] = &Session{Username: username, Role: role, ExpiresAt: time.Now().Add(7 * 24 * time.Hour)}
	s.mu.Unlock()
	s.persist()
	return token, nil
}
func (s *SessionStore) Get(token string) (*Session, bool) {
	s.mu.RLock(); sess, ok := s.sessions[token]; s.mu.RUnlock()
	if !ok || time.Now().After(sess.ExpiresAt) { return nil, false }
	return sess, true
}
func (s *SessionStore) Delete(token string) {
	s.mu.Lock(); delete(s.sessions, token); s.mu.Unlock()
	s.persist()
}
func (s *SessionStore) cleanup() {
	s.mu.Lock(); defer s.mu.Unlock()
	for t, sess := range s.sessions { if time.Now().After(sess.ExpiresAt) { delete(s.sessions, t) } }
}
func ExtractToken(c *gin.Context) string {
	bearer := c.GetHeader("Authorization")
	if strings.HasPrefix(bearer, "Bearer ") { return strings.TrimPrefix(bearer, "Bearer ") }
	return ""
}
func Required(c *gin.Context) {
	token := ExtractToken(c)
	sess, ok := Sessions.Get(token)
	if !ok { c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"}); c.Abort(); return }
	c.Set("username", sess.Username); c.Set("role", string(sess.Role)); c.Set("token", token)
	c.Next()
}
func AdminOnly(c *gin.Context) {
	role, _ := c.Get("role")
	if role != string(store.RoleAdmin) { c.JSON(http.StatusForbidden, gin.H{"error": "admin only"}); c.Abort(); return }
	c.Next()
}
func GetUser(c *gin.Context) string {
	u, _ := c.Get("username"); if s, ok := u.(string); ok { return s }; return "unknown"
}
func GetIP(c *gin.Context) string {
	for _, h := range []string{"X-Real-IP", "X-Forwarded-For"} { if v := c.GetHeader(h); v != "" { return v } }
	return c.ClientIP()
}
