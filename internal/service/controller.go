package service

import "context"

// Controller is implemented by both SystemdController (local) and
// SSHController (remote), so handlers can stay agnostic of where
// PgBouncer actually runs.
type Controller interface {
	Start(ctx context.Context) (string, error)
	Stop(ctx context.Context) (string, error)
	Restart(ctx context.Context) (string, error)
	Status(ctx context.Context) (string, error)
}
