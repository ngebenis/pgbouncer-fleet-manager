# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[Explore the Indonesian Culinary & Culture Gallery →](CULTURE.md)**

A lightweight web GUI to monitor & control PgBouncer: pools/clients/servers/stats status,
start/stop/restart the service, reload config, pause/resume, and change pool_mode per database.

## Screenshots

| Login | Dashboard | Pools |
|---|---|---|
| ![Login](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Clients | Servers | Stats |
|---|---|---|
| ![Clients](docs/screenshots/03-clients.png) | ![Servers](docs/screenshots/04-servers.png) | ![Stats](docs/screenshots/05-stats.png) |

| Databases | Configuration | Manage Servers |
|---|---|---|
| ![Databases](docs/screenshots/06-databases.png) | ![Configuration](docs/screenshots/07-configuration.png) | ![Manage Servers](docs/screenshots/08-manage-servers.png) |

| Users | Audit Log | Backup & Restore |
|---|---|---|
| ![Users](docs/screenshots/09-users.png) | ![Audit Log](docs/screenshots/10-audit-log.png) | ![Backup & Restore](docs/screenshots/11-backup-restore.png) |

| Identity |
|---|
| ![Identity](docs/screenshots/12-identity.png) |

## Stack
- Backend: Go + Gin + pgx (connects directly to the PgBouncer admin console over the Postgres protocol)
- Frontend: Vue 3 + TypeScript + Vite (already in the `web/` folder)

## Running the frontend (development)

```bash
cd web
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:8088` (see `web/vite.config.ts`),
so run the Go backend on that port first.

## Building the frontend for production

```bash
cd web
npm run build
```

The build output goes to `web/dist/`, and the Go backend (`cmd/server/main.go`) is already
configured to serve this folder automatically as static files — so after building, you only
need to run the Go binary, no Node.js required in production.

## Frontend structure

```
web/src/
  App.vue                    # dashboard layout + tab navigation
  main.ts                    # entrypoint
  style.css                  # design tokens (dark theme)
  types/api.ts                # API response types
  composables/api.ts          # axios client for all backend endpoints
  composables/usePolling.ts   # auto-refresh data every few seconds (paused when tab hidden)
  components/
    ServiceStatusCard.vue     # status + start/stop/restart/reload buttons
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # clients/servers/stats/databases tabs (reusable)
    ConfigEditorCard.vue       # change pool_mode per database + global settings
    DataTable.vue              # generic table for SHOW command results
```

## PgBouncer prerequisites

1. Make sure an admin user is configured in `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Add that admin user's credentials to `userlist.txt`.
3. Make sure the admin port (usually the same as the pgbouncer port, default 6432) is reachable
   from the host where this Go service runs.

## Sudoers setup (for start/stop/restart service)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # validate syntax
```

Edit `appuser` in that file to match the user running this Go binary. DO NOT grant sudo access
broader than those 4 commands.

## Environment variables

| Var | Default | Description |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer host |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer port |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | user registered in `admin_users` |
| `PGB_ADMIN_PASS` | - | admin user password |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | config path |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | userlist path |
| `PGB_SERVICE_NAME` | `pgbouncer` | systemd unit name |
| `PGB_LISTEN_ADDR` | `:8088` | web server listen address |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | basic auth for the UI (REQUIRED before exposing it outside localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | storage path for the app/company name (set via the Branding menu) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | storage path for the custom logo uploaded via the Branding menu |

## Running

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Main endpoints

- `GET /api/status` — systemd service status (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — runtime SET (limited, check `SHOW CONFIG`)
- `GET /api/config-edit/raw` — read the entire ini file as sections
- `POST /api/config-edit/database-field` `{"database","field","value"}` — edit ini + auto RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — edit ini + auto RELOAD
- `GET /api/branding` `/api/branding/logo` — app identity & logo (public, read before login)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — admin only
- `POST /api/branding/logo` (multipart `logo`, max 2MB) `/ DELETE /api/branding/logo` — admin only

## Customizing App Identity (Branding)

The **Branding** menu (admin only) lets you change the app name, subtitle, company/organization
name shown in the footer, and the logo (replacing the default ◈ icon) — shown in the sidebar,
login page, and browser tab. All of these settings are stored in `PGB_BRANDING_FILE`/`PGB_LOGO_FILE`
and persist across container restarts as long as the `/app/data` folder is mounted as a volume.

## Running with Docker (PgBouncer on a separate server)

Since your PgBouncer runs on another server, start/stop/restart control is done via **SSH**,
not local `systemctl` inside the container (the container has no access to another host's systemd).
Admin console connections (`SHOW POOLS`, etc.) work normally regardless, since that's just a plain
TCP connection to the PgBouncer port — unaffected by the container or server location.

### 1. Prepare the PgBouncer server (remote)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Then generate an SSH key on the machine where you'll run `docker compose build`, and install the
public key on the PgBouncer server:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<pgbouncer-server-ip>
```

Also make sure the PgBouncer admin port (default `6432`) is reachable from the network where the
`pgbouncer-manager` container runs.

### 2. Configuration

```bash
cp .env.example .env
# edit .env: fill in PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS, etc.
```

### 3. Build & run

```bash
docker compose up -d --build
```

The app will be available at `http://<this-host>:8088`, with the full dashboard (status, pools,
clients, stats, start/stop/restart via SSH, reload config).

### Important notes

- The **"Configuration" tab** (change pool_mode) is automatically disabled when
  `PGB_CONTROL_MODE=ssh`, because that endpoint edits `pgbouncer.ini` on the local filesystem.
  In SSH mode, edit `pgbouncer.ini` directly on the PgBouncer server (manually or via your own
  Ansible/script), then click **Reload Config** on the Overview tab — that still works because
  `RELOAD` is sent through the PgBouncer admin console, not through the filesystem.
- The private key at `./secrets/pgb_ssh_key` is mounted as a Docker secret (read-only inside the
  container, never baked into the image). Do not commit the `secrets/` folder to git.
- For production security, set `knownHostsPath` in `handlers.NewAPI` (currently `""` = skip host
  key verification) to a `known_hosts` file path containing the PgBouncer server's fingerprint,
  to protect against MITM attacks.
- If PgBouncer is ever moved to the same host as the manager, simply set `PGB_CONTROL_MODE=local`
  and run the binary directly on that host (not in a container) so it can access the local systemd
  — see the "Sudoers setup" section above.

- Always run this behind a VPN/reverse proxy with TLS; never expose it directly to the internet.
- `PGB_UI_USER`/`PGB_UI_PASS` is only a minimal layer of protection in front of the app itself.
  Login already uses session-based auth with roles (admin vs. viewer, see the **Users** menu) —
  make sure to change the default `admin` account's password immediately after first deploy.
- A `.bak` file is automatically created before every write to `pgbouncer.ini`.
