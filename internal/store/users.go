package store
import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
	"golang.org/x/crypto/bcrypt"
)
type Role string
const (RoleAdmin Role = "admin"; RoleViewer Role = "viewer")
type User struct {
	ID, Username, PasswordHash string
	Role      Role
	CreatedAt time.Time
	CreatedBy string
}
type SafeUser struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	CreatedBy string    `json:"created_by"`
}
func (u *User) Safe() SafeUser {
	return SafeUser{ID:u.ID,Username:u.Username,Role:u.Role,CreatedAt:u.CreatedAt,CreatedBy:u.CreatedBy}
}
type UserStore struct {
	mu       sync.RWMutex
	filePath string
	users    map[string]*User
}
func NewUserStore(filePath string) (*UserStore, error) {
	os.MkdirAll(filepath.Dir(filePath), 0755)
	s := &UserStore{filePath:filePath, users:map[string]*User{}}
	if err := s.load(); err != nil { return nil, err }
	if len(s.users) == 0 { if err := s.seedAdmin(); err != nil { return nil, err } }
	return s, nil
}
func (s *UserStore) load() error {
	data, err := os.ReadFile(s.filePath)
	if os.IsNotExist(err) { return nil }
	if err != nil { return err }
	var w struct{ Users []*User `json:"users"` }
	if err := json.Unmarshal(data, &w); err != nil { return err }
	for _, u := range w.Users { s.users[u.Username] = u }
	return nil
}
func (s *UserStore) save() error {
	users := make([]*User, 0, len(s.users))
	for _, u := range s.users { users = append(users, u) }
	sort.Slice(users, func(i,j int) bool { return users[i].CreatedAt.Before(users[j].CreatedAt) })
	w := struct{ Users []*User `json:"users"` }{Users:users}
	data, err := json.MarshalIndent(w, "", "  ")
	if err != nil { return err }
	return os.WriteFile(s.filePath, data, 0600)
}
func (s *UserStore) seedAdmin() error {
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil { return err }
	s.users["admin"] = &User{ID:"1",Username:"admin",PasswordHash:string(hash),Role:RoleAdmin,CreatedAt:time.Now(),CreatedBy:"system"}
	return s.save()
}
func (s *UserStore) Authenticate(username, password string) (*User, error) {
	s.mu.RLock(); u, ok := s.users[username]; s.mu.RUnlock()
	if !ok { return nil, fmt.Errorf("invalid credentials") }
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}
	return u, nil
}
func (s *UserStore) List() []SafeUser {
	s.mu.RLock(); defer s.mu.RUnlock()
	out := make([]SafeUser, 0, len(s.users))
	for _, u := range s.users { out = append(out, u.Safe()) }
	sort.Slice(out, func(i,j int) bool { return out[i].Username < out[j].Username })
	return out
}
func (s *UserStore) GetByUsername(username string) (*User, bool) {
	s.mu.RLock(); defer s.mu.RUnlock(); u, ok := s.users[username]; return u, ok
}
func (s *UserStore) Create(username, password string, role Role, createdBy string) error {
	s.mu.Lock(); defer s.mu.Unlock()
	if _, exists := s.users[username]; exists { return fmt.Errorf("username %q already exists", username) }
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil { return err }
	s.users[username] = &User{ID:fmt.Sprintf("%d",time.Now().UnixNano()),Username:username,PasswordHash:string(hash),Role:role,CreatedAt:time.Now(),CreatedBy:createdBy}
	return s.save()
}
func (s *UserStore) UpdatePassword(username, newPassword string) error {
	s.mu.Lock(); defer s.mu.Unlock()
	u, ok := s.users[username]
	if !ok { return fmt.Errorf("user not found") }
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil { return err }
	u.PasswordHash = string(hash); return s.save()
}
func (s *UserStore) UpdateRole(username string, role Role) error {
	s.mu.Lock(); defer s.mu.Unlock()
	u, ok := s.users[username]
	if !ok { return fmt.Errorf("user not found") }
	u.Role = role; return s.save()
}
func (s *UserStore) Delete(username string) error {
	s.mu.Lock(); defer s.mu.Unlock()
	u, ok := s.users[username]
	if !ok { return fmt.Errorf("user not found") }
	if u.Role == RoleAdmin {
		cnt := 0
		for _, usr := range s.users { if usr.Role == RoleAdmin { cnt++ } }
		if cnt <= 1 { return fmt.Errorf("cannot delete last admin") }
	}
	delete(s.users, username); return s.save()
}
