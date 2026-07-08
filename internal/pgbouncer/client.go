package pgbouncer

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

// Client wraps a connection to PgBouncer's special "pgbouncer" admin database.
// All SHOW/RELOAD/PAUSE/RESUME/SET commands are issued through this single
// connection — PgBouncer treats this database name specially regardless of
// what's in pgbouncer.ini.
type Client struct {
	connString string
}

func NewClient(host, port, user, pass string) *Client {
	cs := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=pgbouncer sslmode=disable",
		host, port, user, pass,
	)
	return &Client{connString: cs}
}

func (c *Client) connect(ctx context.Context) (*pgx.Conn, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	cfg, err := pgx.ParseConfig(c.connString)
	if err != nil {
		return nil, fmt.Errorf("parse connection string: %w", err)
	}
	// PgBouncer admin console only supports simple query protocol,
	// not the extended protocol that pgx uses by default.
	cfg.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	conn, err := pgx.ConnectConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("connect to pgbouncer admin console: %w", err)
	}
	return conn, nil
}

// rows generically executes a SHOW-style command and returns column names + row data.
// Works for SHOW POOLS, SHOW CLIENTS, SHOW SERVERS, SHOW STATS, SHOW DATABASES,
// SHOW CONFIG, SHOW LISTS, SHOW VERSION, etc.
func (c *Client) rows(ctx context.Context, query string) ([]string, []map[string]any, error) {
	conn, err := c.connect(ctx)
	if err != nil {
		return nil, nil, err
	}
	defer conn.Close(ctx)

	rows, err := conn.Query(ctx, query)
	if err != nil {
		return nil, nil, fmt.Errorf("query %q: %w", query, err)
	}
	defer rows.Close()

	fields := rows.FieldDescriptions()
	colNames := make([]string, len(fields))
	for i, f := range fields {
		colNames[i] = string(f.Name)
	}

	var result []map[string]any
	for rows.Next() {
		vals, err := rows.Values()
		if err != nil {
			return nil, nil, err
		}
		rowMap := make(map[string]any, len(colNames))
		for i, name := range colNames {
			rowMap[name] = vals[i]
		}
		result = append(result, rowMap)
	}
	if err := rows.Err(); err != nil {
		return nil, nil, err
	}
	return colNames, result, nil
}

// exec runs an admin command that returns no rows (RELOAD, PAUSE, RESUME, KILL, SUSPEND).
func (c *Client) exec(ctx context.Context, command string) error {
	conn, err := c.connect(ctx)
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	if _, err := conn.Exec(ctx, command); err != nil {
		return fmt.Errorf("exec %q: %w", command, err)
	}
	return nil
}

// --- Read-only status methods ---

func (c *Client) ShowPools(ctx context.Context) ([]map[string]any, error) {
	_, rows, err := c.rows(ctx, "SHOW POOLS")
	return rows, err
}

func (c *Client) ShowClients(ctx context.Context) ([]map[string]any, error) {
	_, rows, err := c.rows(ctx, "SHOW CLIENTS")
	return rows, err
}

func (c *Client) ShowServers(ctx context.Context) ([]map[string]any, error) {
	_, rows, err := c.rows(ctx, "SHOW SERVERS")
	return rows, err
}

func (c *Client) ShowStats(ctx context.Context) ([]map[string]any, error) {
	_, rows, err := c.rows(ctx, "SHOW STATS")
	return rows, err
}

func (c *Client) ShowDatabases(ctx context.Context) ([]map[string]any, error) {
	_, rows, err := c.rows(ctx, "SHOW DATABASES")
	return rows, err
}

func (c *Client) ShowConfig(ctx context.Context) ([]map[string]any, error) {
	_, rows, err := c.rows(ctx, "SHOW CONFIG")
	return rows, err
}

func (c *Client) ShowLists(ctx context.Context) ([]map[string]any, error) {
	_, rows, err := c.rows(ctx, "SHOW LISTS")
	return rows, err
}

func (c *Client) ShowVersion(ctx context.Context) (string, error) {
	_, rows, err := c.rows(ctx, "SHOW VERSION")
	if err != nil {
		return "", err
	}
	if len(rows) == 0 {
		return "", fmt.Errorf("no version returned")
	}
	for _, v := range rows[0] {
		return fmt.Sprintf("%v", v), nil
	}
	return "", fmt.Errorf("unexpected SHOW VERSION format")
}

// --- Control methods ---

// Reload re-reads pgbouncer.ini without dropping client connections.
// Use this after editing the ini file (e.g. changing pool_mode).
func (c *Client) Reload(ctx context.Context) error {
	return c.exec(ctx, "RELOAD")
}

// Pause stops new queries on a database (or all, if dbname is "") and waits
// for in-flight ones to finish; existing client connections are kept open.
func (c *Client) Pause(ctx context.Context, dbname string) error {
	if dbname == "" {
		return c.exec(ctx, "PAUSE")
	}
	return c.exec(ctx, fmt.Sprintf("PAUSE %s", quoteIdent(dbname)))
}

// Resume undoes Pause/Suspend.
func (c *Client) Resume(ctx context.Context, dbname string) error {
	if dbname == "" {
		return c.exec(ctx, "RESUME")
	}
	return c.exec(ctx, fmt.Sprintf("RESUME %s", quoteIdent(dbname)))
}

// KillDatabase immediately drops all connections to a specific database.
func (c *Client) KillDatabase(ctx context.Context, dbname string) error {
	return c.exec(ctx, fmt.Sprintf("KILL %s", quoteIdent(dbname)))
}

// SetParameter changes a runtime-settable parameter (e.g. "default_pool_size").
// Note: not all pgbouncer.ini settings are settable at runtime — pool_mode at
// the database level usually requires an ini edit + RELOAD instead. Check
// `SHOW CONFIG` "changeable" column for what's safe to SET live.
func (c *Client) SetParameter(ctx context.Context, key, value string) error {
	return c.exec(ctx, fmt.Sprintf("SET %s = %s", quoteIdent(key), value))
}

func quoteIdent(s string) string {
	// PgBouncer admin console identifiers don't need heavy quoting in practice,
	// but guard against accidental whitespace/command injection from user input.
	return pgx.Identifier{s}.Sanitize()
}
