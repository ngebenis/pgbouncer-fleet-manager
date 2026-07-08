package service

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
	"time"
)

// SystemdController implements Controller for local control via systemctl + sudo.
// IMPORTANT: this expects the running user to have a sudoers rule limited to
// exactly these three commands, e.g.:
//
//   appuser ALL=(root) NOPASSWD: /usr/bin/systemctl start pgbouncer, \
//                                /usr/bin/systemctl stop pgbouncer, \
//                                /usr/bin/systemctl restart pgbouncer, \
//                                /usr/bin/systemctl status pgbouncer
//
// Never grant broader sudo access for this app — no "ALL" commands, no other units.
type SystemdController struct {
	unit       string
	useSudo    bool
	sudoBinary string
}

func NewSystemdController(unit string, useSudo bool) *SystemdController {
	return &SystemdController{
		unit:       unit,
		useSudo:    useSudo,
		sudoBinary: "/usr/bin/sudo",
	}
}

func (s *SystemdController) run(ctx context.Context, action string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	var cmd *exec.Cmd
	if s.useSudo {
		cmd = exec.CommandContext(ctx, s.sudoBinary, "/usr/bin/systemctl", action, s.unit)
	} else {
		cmd = exec.CommandContext(ctx, "/usr/bin/systemctl", action, s.unit)
	}

	out, err := cmd.CombinedOutput()
	output := strings.TrimSpace(string(out))
	if err != nil {
		return output, fmt.Errorf("systemctl %s %s: %w (output: %s)", action, s.unit, err, output)
	}
	return output, nil
}

func (s *SystemdController) Start(ctx context.Context) (string, error) {
	return s.run(ctx, "start")
}

func (s *SystemdController) Stop(ctx context.Context) (string, error) {
	return s.run(ctx, "stop")
}

func (s *SystemdController) Restart(ctx context.Context) (string, error) {
	return s.run(ctx, "restart")
}

// Status returns "active", "inactive", "failed", etc. via `is-active`,
// which is safer/simpler to parse than full `status` output.
func (s *SystemdController) Status(ctx context.Context) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var cmd *exec.Cmd
	if s.useSudo {
		cmd = exec.CommandContext(ctx, s.sudoBinary, "/usr/bin/systemctl", "is-active", s.unit)
	} else {
		cmd = exec.CommandContext(ctx, "/usr/bin/systemctl", "is-active", s.unit)
	}

	out, err := cmd.CombinedOutput()
	status := strings.TrimSpace(string(out))
	// is-active returns non-zero exit code for inactive/failed states,
	// but the output text itself is still meaningful — don't treat that as a hard error.
	if err != nil && status == "" {
		return "unknown", fmt.Errorf("systemctl is-active %s: %w", s.unit, err)
	}
	return status, nil
}
