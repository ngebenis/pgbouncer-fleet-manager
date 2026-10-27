# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[Tuklasin ang Galerya ng Lutuin at Kultura ng Indonesia →](CULTURE.md)**

Isang magaan na web GUI para sa pag-monitor at pag-control ng PgBouncer: status ng
pools/clients/servers/stats, pag-start/stop/restart ng serbisyo, pag-reload ng configuration,
pag-pause/resume, at pagbabago ng pool_mode kada database.

## Mga Screenshot

| Mag-login | Dashboard | Pools |
|---|---|---|
| ![Mag-login](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Clients | Servers | Stats |
|---|---|---|
| ![Clients](docs/screenshots/03-clients.png) | ![Servers](docs/screenshots/04-servers.png) | ![Stats](docs/screenshots/05-stats.png) |

| Mga Database | Configuration | Pamahalaan ang mga Server |
|---|---|---|
| ![Mga Database](docs/screenshots/06-databases.png) | ![Configuration](docs/screenshots/07-configuration.png) | ![Pamahalaan ang mga Server](docs/screenshots/08-manage-servers.png) |

| Mga User | Audit Log | Backup & Restore |
|---|---|---|
| ![Mga User](docs/screenshots/09-users.png) | ![Audit Log](docs/screenshots/10-audit-log.png) | ![Backup & Restore](docs/screenshots/11-backup-restore.png) |

| Identity |
|---|
| ![Identity](docs/screenshots/12-identity.png) |

## Stack
- Backend: Go + Gin + pgx (direktang kumokonekta sa admin console ng PgBouncer gamit ang Postgres protocol)
- Frontend: Vue 3 + TypeScript + Vite (nasa `web/` folder na)

## Pagpapatakbo ng frontend (development)

```bash
cd web
npm install
npm run dev
```

Ang Vite dev server ay nagpo-proxy ng `/api/*` papunta sa `http://localhost:8088` (tingnan ang
`web/vite.config.ts`), kaya patakbuhin muna ang Go backend sa port na iyon.

## Pag-build ng frontend para sa production

```bash
cd web
npm run build
```

Ang resulta ng build ay napupunta sa `web/dist/`, at ang Go backend (`cmd/server/main.go`) ay
naka-configure na para automatikong i-serve ang folder na ito bilang static files — kaya pagkatapos
mag-build, sapat nang patakbuhin ang Go binary, hindi na kailangan ng Node.js sa production server.

## Istraktura ng frontend

```
web/src/
  App.vue                    # dashboard layout + tab navigation
  main.ts                    # entry point
  style.css                  # design tokens (dark theme)
  types/api.ts                # mga uri ng API response
  composables/api.ts          # axios client para sa lahat ng backend endpoint
  composables/usePolling.ts   # awtomatikong nagre-refresh ng data tuwing ilang segundo (nagpapahinga kapag nakatago ang tab)
  components/
    ServiceStatusCard.vue     # status + start/stop/restart/reload buttons
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # clients/servers/stats/databases tabs (magagamit muli)
    ConfigEditorCard.vue       # pagbabago ng pool_mode kada database + global settings
    DataTable.vue              # generic na table para sa resulta ng SHOW commands
```

## Mga kailangan bago gamitin ang PgBouncer

1. Siguraduhing may admin user sa `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Idagdag ang credentials ng admin user na iyon sa `userlist.txt`.
3. Siguraduhing ang admin port (karaniwang kapareho ng port ng pgbouncer, default 6432) ay
   naa-access mula sa host na pinagpapatakbo ng Go service na ito.

## Pag-set up ng sudoers (para sa start/stop/restart ng serbisyo)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # i-validate ang syntax
```

I-edit ang `appuser` sa file na iyon para tugmaan ang user na nagpapatakbo ng Go binary na ito.
HUWAG magbigay ng mas malawak na sudo access kaysa sa 4 na linyang ito ng command.

## Mga environment variable

| Variable | Default | Paglalarawan |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | host ng PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | port ng PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | user na nakarehistro sa `admin_users` |
| `PGB_ADMIN_PASS` | - | password ng admin user |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | path ng configuration file |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | path ng userlist file |
| `PGB_SERVICE_NAME` | `pgbouncer` | pangalan ng systemd unit |
| `PGB_LISTEN_ADDR` | `:8088` | listen address ng web server |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | basic auth para sa UI (**KAILANGAN** itakda bago gamitin sa labas ng localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | path ng pag-store ng pangalan ng app/kumpanya (itinatakda sa Branding menu) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | path ng pag-store ng custom logo na in-upload sa Branding menu |

## Pagpapatakbo

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Mga pangunahing endpoint

- `GET /api/status` — status ng systemd service (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — runtime SET (limitado, tingnan ang `SHOW CONFIG`)
- `GET /api/config-edit/raw` — binabasa ang buong nilalaman ng ini file bilang mga section
- `POST /api/config-edit/database-field` `{"database","field","value"}` — ine-edit ang ini + awtomatikong RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — ine-edit ang ini + awtomatikong RELOAD
- `GET /api/branding` `/api/branding/logo` — identity ng app at logo (public, mababasa bago mag-login)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — admin lang
- `POST /api/branding/logo` (multipart `logo`, max 2MB) `/ DELETE /api/branding/logo` — admin lang

## Pag-customize ng Identity ng App (Branding)

Ang **Branding** menu (admin lang) ay nagbibigay-daan sa pagpapalit ng pangalan ng app, subtitle,
pangalan ng kumpanya/organisasyon na nakikita sa footer, at logo (papalitan ang default na ◈
icon) — ipinapakita ang mga ito sa sidebar, login page, at browser tab. Lahat ng setting na ito ay
naka-save sa `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` at nananatili kahit ma-restart ang container,
hangga't naka-mount ang `/app/data` folder bilang volume.

## Pagpapatakbo gamit ang Docker (PgBouncer sa hiwalay na server)

Dahil ang PgBouncer mo ay tumatakbo sa ibang server, ang start/stop/restart control ay ginagawa
sa pamamagitan ng **SSH**, hindi sa pamamagitan ng local na `systemctl` sa loob ng container
(walang access ang container sa systemd ng ibang host). Patuloy na gagana nang normal ang
koneksyon sa admin console (`SHOW POOLS`, atbp.) dahil ito ay isa lamang normal na koneksyon ng
TCP papunta sa port ng PgBouncer — hindi apektado ng container o lokasyon ng server.

### 1. Paghahanda ng PgBouncer server (remote)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Pagkatapos ay gumawa ng SSH key sa machine kung saan mo gagawin ang `docker compose build`, at
i-install ang public key sa PgBouncer server:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-ng-pgbouncer-server>
```

Siguraduhin din na ang admin port ng PgBouncer (default `6432`) ay naa-access mula sa network
kung saan tumatakbo ang `pgbouncer-manager` container.

### 2. Configuration

```bash
cp .env.example .env
# i-edit ang .env: punan ang PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS, atbp.
```

### 3. Pag-build at pagpapatakbo

```bash
docker compose up -d --build
```

Magiging available ang app sa `http://<host-na-ito>:8088`, kasama ang kumpletong dashboard
(status, pools, clients, stats, start/stop/restart sa pamamagitan ng SSH, pag-reload ng
configuration).

### Mahahalagang paalala

- **Awtomatikong nade-disable ang "Configuration" tab** (pagbabago ng pool_mode) kapag
  `PGB_CONTROL_MODE=ssh`, dahil ine-edit ng endpoint na iyon ang `pgbouncer.ini` sa local na
  filesystem. Sa SSH mode, direktang i-edit ang `pgbouncer.ini` sa PgBouncer server (manual o
  gamit ang sarili mong Ansible/script), pagkatapos ay i-click ang **Reload Config** button sa
  Overview tab — patuloy itong gagana dahil ipinapadala ang `RELOAD` sa pamamagitan ng admin
  console ng PgBouncer, hindi sa pamamagitan ng filesystem.
- Ang private key sa `./secrets/pgb_ssh_key` ay naka-mount bilang Docker secret (read-only sa
  loob ng container, hindi kailanman isinasama sa image). Huwag kailanman i-commit ang `secrets/`
  folder sa git.
- Para sa seguridad ng production, itakda ang `knownHostsPath` sa `handlers.NewAPI` (kasalukuyang
  `""` = linaktawan ang pag-verify ng host key) gamit ang path ng `known_hosts` file na may
  fingerprint ng PgBouncer server, para maprotektahan mula sa MITM attacks.
- Kung sakaling mailipat ang PgBouncer sa parehong host ng manager, itakda na lamang ang
  `PGB_CONTROL_MODE=local` at patakbuhin ang binary nang direkta sa host na iyon (hindi sa
  container) para ma-access ang local systemd — tingnan ang seksyong "Pag-set up ng sudoers" sa
  itaas.

- Palaging patakbuhin ito sa likod ng VPN/reverse proxy na may TLS, huwag kailanman direktang
  i-expose sa internet.
- Ang `PGB_UI_USER`/`PGB_UI_PASS` ay minimal na proteksyon lang sa harap ng app. Ang login mismo
  ay gumagamit na ng session-based authentication na may roles (admin vs. viewer, tingnan ang
  **Users** menu) — siguraduhing palitan agad ang password ng default na `admin` account
  pagkatapos ng unang deployment.
- Awtomatikong gagawa ng `.bak` file bago ang bawat pagsulat sa `pgbouncer.ini`.
