package store
import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)
type AuditEntry struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	User      string    `json:"user"`
	Action    string    `json:"action"`
	Target    string    `json:"target"`
	IP        string    `json:"ip"`
	Success   bool      `json:"success"`
	Details   string    `json:"details"`
}
type AuditStore struct {
	mu       sync.Mutex
	filePath string
	entries  []*AuditEntry
	maxSize  int
}
func NewAuditStore(filePath string) (*AuditStore, error) {
	if err := os.MkdirAll(filepath.Dir(filePath), 0755); err != nil { return nil, err }
	s := &AuditStore{filePath: filePath, maxSize: 5000}
	s.load()
	return s, nil
}
func (s *AuditStore) load() {
	data, err := os.ReadFile(s.filePath)
	if err != nil { return }
	var w struct{ Entries []*AuditEntry `json:"entries"` }
	if err := json.Unmarshal(data, &w); err != nil { return }
	s.entries = w.Entries
}
func (s *AuditStore) save() {
	if len(s.entries) > s.maxSize { s.entries = s.entries[len(s.entries)-s.maxSize:] }
	w := struct{ Entries []*AuditEntry `json:"entries"` }{Entries: s.entries}
	data, err := json.MarshalIndent(w, "", "  ")
	if err != nil { return }
	os.WriteFile(s.filePath, data, 0640)
}
func (s *AuditStore) Log(user, action, target, ip string, success bool, details string) {
	s.mu.Lock(); defer s.mu.Unlock()
	entry := &AuditEntry{
		ID:        fmt.Sprintf("%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		User:      user, Action: action, Target: target,
		IP: ip, Success: success, Details: details,
	}
	s.entries = append(s.entries, entry)
	s.save()
}
func (s *AuditStore) List(limit int) []*AuditEntry {
	s.mu.Lock(); defer s.mu.Unlock()
	n := len(s.entries)
	out := make([]*AuditEntry, n)
	copy(out, s.entries)
	// reverse: newest first
	for i, j := 0, len(out)-1; i < j; i, j = i+1, j-1 { out[i], out[j] = out[j], out[i] }
	if limit > 0 && limit < len(out) { return out[:limit] }
	return out
}
