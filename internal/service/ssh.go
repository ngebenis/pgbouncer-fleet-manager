package service

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"golang.org/x/crypto/ssh"
)

// SSHController runs `systemctl <action> <unit>` on a remote host over SSH.
// It opens a fresh SSH connection per command — fine for a low-frequency
// admin dashboard; switch to a pooled/persistent client if you need tighter
// latency on status polling.
//
// On the remote host, restrict the SSH user the same way as the local
// sudoers approach: a dedicated user whose only sudo rights are the
// systemctl start/stop/restart/is-active commands for the pgbouncer unit.
// Prefer key-based auth only (disable password auth for this user).
type SSHController struct {
	host       string
	port       string
	user       string
	signer     ssh.Signer
	unit       string
	useSudo    bool
	hostKeyCB  ssh.HostKeyCallback
}

// NewSSHController loads a private key from privateKeyPath. knownHostsPath,
// if non-empty, is used for strict host key checking (recommended for
// production); if empty, it falls back to InsecureIgnoreHostKey, which is
// fine for a quick start but should be tightened before exposing this
// outside a trusted network.
func NewSSHController(host, port, user, privateKeyPath, unit string, useSudo bool, knownHostsPath string) (*SSHController, error) {
	keyData, err := os.ReadFile(privateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("read SSH private key %s: %w", privateKeyPath, err)
	}
	signer, err := ssh.ParsePrivateKey(keyData)
	if err != nil {
		return nil, fmt.Errorf("parse SSH private key: %w", err)
	}

	var hostKeyCB ssh.HostKeyCallback
	if knownHostsPath != "" {
		cb, err := knownHostsCallback(knownHostsPath)
		if err != nil {
			return nil, fmt.Errorf("load known_hosts %s: %w", knownHostsPath, err)
		}
		hostKeyCB = cb
	} else {
		hostKeyCB = ssh.InsecureIgnoreHostKey() // #nosec G106 — acceptable only behind a trusted network
	}

	return &SSHController{
		host:      host,
		port:      port,
		user:      user,
		signer:    signer,
		unit:      unit,
		useSudo:   useSudo,
		hostKeyCB: hostKeyCB,
	}, nil
}

func (s *SSHController) dial(ctx context.Context) (*ssh.Client, error) {
	cfg := &ssh.ClientConfig{
		User:            s.user,
		Auth:            []ssh.AuthMethod{ssh.PublicKeys(s.signer)},
		HostKeyCallback: s.hostKeyCB,
		Timeout:         8 * time.Second,
	}
	addr := fmt.Sprintf("%s:%s", s.host, s.port)

	type result struct {
		client *ssh.Client
		err    error
	}
	done := make(chan result, 1)
	go func() {
		c, err := ssh.Dial("tcp", addr, cfg)
		done <- result{c, err}
	}()

	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case r := <-done:
		if r.err != nil {
			return nil, fmt.Errorf("ssh dial %s: %w", addr, r.err)
		}
		return r.client, nil
	}
}

func (s *SSHController) runRemote(ctx context.Context, command string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 12*time.Second)
	defer cancel()

	client, err := s.dial(ctx)
	if err != nil {
		return "", err
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return "", fmt.Errorf("open ssh session: %w", err)
	}
	defer session.Close()

	out, err := session.CombinedOutput(command)
	output := strings.TrimSpace(string(out))
	if err != nil {
		return output, fmt.Errorf("remote command %q: %w (output: %s)", command, err, output)
	}
	return output, nil
}

func (s *SSHController) systemctlCmd(action string) string {
	if s.useSudo {
		return fmt.Sprintf("sudo /usr/bin/systemctl %s %s", action, s.unit)
	}
	return fmt.Sprintf("/usr/bin/systemctl %s %s", action, s.unit)
}

func (s *SSHController) Start(ctx context.Context) (string, error) {
	return s.runRemote(ctx, s.systemctlCmd("start"))
}

func (s *SSHController) Stop(ctx context.Context) (string, error) {
	return s.runRemote(ctx, s.systemctlCmd("stop"))
}

func (s *SSHController) Restart(ctx context.Context) (string, error) {
	return s.runRemote(ctx, s.systemctlCmd("restart"))
}

func (s *SSHController) Status(ctx context.Context) (string, error) {
	out, err := s.runRemote(ctx, s.systemctlCmd("is-active"))
	// is-active exits non-zero for inactive/failed, but stdout still has
	// the meaningful word — same handling as the local controller.
	if err != nil && out == "" {
		return "unknown", err
	}
	return out, nil
}
