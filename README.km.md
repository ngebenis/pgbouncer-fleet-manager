# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

Web GUI ស្រាលមួយសម្រាប់ត្រួតពិនិត្យ និងគ្រប់គ្រង PgBouncer៖ មើលស្ថានភាព pools/clients/servers/stats,
start/stop/restart សេវាកម្ម, reload ការកំណត់រចនាសម្ព័ន្ធ, pause/resume, និងផ្លាស់ប្តូរ pool_mode
សម្រាប់ទិន្នន័យនីមួយៗ។

## ជង់បច្ចេកវិទ្យា
- Backend: Go + Gin + pgx (ភ្ជាប់ដោយផ្ទាល់ទៅកាន់ console គ្រប់គ្រងរបស់ PgBouncer តាមរយៈ protocol Postgres)
- Frontend: Vue 3 + TypeScript + Vite (មានរួចហើយនៅក្នុងថតឯកសារ `web/`)

## ដំណើរការ Frontend (បរិស្ថានអភិវឌ្ឍន៍)

```bash
cd web
npm install
npm run dev
```

Vite dev server នឹង proxy `/api/*` ទៅកាន់ `http://localhost:8088` (សូមមើល `web/vite.config.ts`)
ដូច្នេះសូមដំណើរការ Go backend នៅលើ port នោះជាមុនសិន។

## Build Frontend សម្រាប់ Production

```bash
cd web
npm run build
```

លទ្ធផល build នឹងត្រូវបានដាក់ចូលក្នុង `web/dist/` ហើយ Go backend (`cmd/server/main.go`) ត្រូវបាន
កំណត់រចនាសម្ព័ន្ធរួចជាស្រេចដើម្បី serve ថតឯកសារនេះជា static file ដោយស្វ័យប្រវត្តិ — ដូច្នេះបន្ទាប់ពី
build រួច គ្រាន់តែដំណើរការ Go binary ប៉ុណ្ណោះ មិនចាំបាច់មាន Node.js នៅលើ production server ទេ។

## រចនាសម្ព័ន្ធ Frontend

```
web/src/
  App.vue                    # ប្លង់ dashboard + ការរុករកតាម tab
  main.ts                    # ចំណុចចូល
  style.css                  # design tokens (ស្បែកងងឹត)
  types/api.ts                # ប្រភេទនៃការឆ្លើយតប API
  composables/api.ts          # axios client សម្រាប់ endpoint ទាំងអស់របស់ backend
  composables/usePolling.ts   # ធ្វើឱ្យទិន្នន័យស្រស់ដោយស្វ័យប្រវត្តិរៀងរាល់វិនាទីមួយចំនួន (ផ្អាកនៅពេល tab ត្រូវបានលាក់)
  components/
    ServiceStatusCard.vue     # ស្ថានភាព + ប៊ូតុង start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # tab clients/servers/stats/databases (អាចប្រើឡើងវិញបាន)
    ConfigEditorCard.vue       # ផ្លាស់ប្តូរ pool_mode សម្រាប់ទិន្នន័យនីមួយៗ + ការកំណត់សកល
    DataTable.vue              # តារាងទូទៅសម្រាប់លទ្ធផលនៃពាក្យបញ្ជា SHOW
```

## លក្ខខណ្ឌមុនសម្រាប់ PgBouncer

1. សូមប្រាកដថាមានអ្នកប្រើប្រាស់ admin នៅក្នុង `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. បន្ថែមព័ត៌មានសម្គាល់របស់អ្នកប្រើប្រាស់ admin នោះទៅក្នុង `userlist.txt`។
3. សូមប្រាកដថា admin port (ជាទូទៅដូចគ្នានឹង port របស់ pgbouncer លំនាំដើម 6432) អាចចូលប្រើបានពី
   host ដែលដំណើរការសេវាកម្ម Go នេះ។

## ការកំណត់ sudoers (សម្រាប់ start/stop/restart សេវាកម្ម)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # ផ្ទៀងផ្ទាត់វាក្យសម្ព័ន្ធ
```

កែសម្រួល `appuser` នៅក្នុងឯកសារនោះឱ្យត្រូវនឹងអ្នកប្រើប្រាស់ដែលដំណើរការ Go binary នេះ។ សូម **កុំ**
ផ្តល់សិទ្ធិ sudo ធំជាងបន្ទាត់ពាក្យបញ្ជាទាំង 4 នេះ។

## អថេរបរិស្ថាន

| អថេរ | លំនាំដើម | ការពិពណ៌នា |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | host របស់ PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | port របស់ PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | អ្នកប្រើប្រាស់ដែលបានចុះឈ្មោះក្នុង `admin_users` |
| `PGB_ADMIN_PASS` | - | ពាក្យសម្ងាត់របស់អ្នកប្រើប្រាស់ admin |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | ផ្លូវឯកសារកំណត់រចនាសម្ព័ន្ធ |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | ផ្លូវឯកសារ userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | ឈ្មោះ systemd unit |
| `PGB_LISTEN_ADDR` | `:8088` | អាសយដ្ឋានស្តាប់របស់ web server |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | ការផ្ទៀងផ្ទាត់មូលដ្ឋានសម្រាប់ UI (**ត្រូវការចាំបាច់** មុនពេលប្រើប្រាស់ក្រៅ localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | ផ្លូវផ្ទុកឈ្មោះកម្មវិធី/ក្រុមហ៊ុន (កំណត់តាមរយៈម៉ឺនុយ Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | ផ្លូវផ្ទុក logo ផ្ទាល់ខ្លួនដែលបានបញ្ចូលតាមរយៈម៉ឺនុយ Branding |

## ការដំណើរការ

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Endpoint សំខាន់ៗ

- `GET /api/status` — ស្ថានភាពសេវាកម្ម systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — runtime SET (មានកម្រិត, សូមមើល `SHOW CONFIG`)
- `GET /api/config-edit/raw` — អានមាតិកាឯកសារ ini ទាំងមូលជា sections
- `POST /api/config-edit/database-field` `{"database","field","value"}` — កែសម្រួល ini + RELOAD ស្វ័យប្រវត្តិ
- `POST /api/config-edit/global-field` `{"field","value"}` — កែសម្រួល ini + RELOAD ស្វ័យប្រវត្តិ
- `GET /api/branding` `/api/branding/logo` — អត្តសញ្ញាណកម្មវិធី និង logo (សាធារណៈ, អាចអានបានមុនពេល login)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — admin តែប៉ុណ្ណោះ
- `POST /api/branding/logo` (multipart `logo`, អតិបរមា 2MB) `/ DELETE /api/branding/logo` — admin តែប៉ុណ្ណោះ

## ប្តូរអត្តសញ្ញាណកម្មវិធីតាមបំណង (Branding)

ម៉ឺនុយ **Branding** (admin តែប៉ុណ្ណោះ) អនុញ្ញាតឱ្យផ្លាស់ប្តូរឈ្មោះកម្មវិធី, ចំណងជើងរង, ឈ្មោះ
ក្រុមហ៊ុន/អង្គភាពដែលបង្ហាញនៅផ្នែកខាងក្រោម, និង logo (ជំនួសរូបតំណាង ◈ លំនាំដើម) — ទាំងនេះបង្ហាញនៅ
sidebar, ទំព័រ login, និង tab browser។ ការកំណត់ទាំងអស់នេះត្រូវបានរក្សាទុកនៅក្នុង
`PGB_BRANDING_FILE`/`PGB_LOGO_FILE` ហើយនៅតែមាននៅពេល container ចាប់ផ្តើមឡើងវិញ ដរាបណាថតឯកសារ
`/app/data` ត្រូវបាន mount ជា volume។

## ដំណើរការជាមួយ Docker (PgBouncer នៅលើ server ដាច់ដោយឡែក)

ដោយសារ PgBouncer របស់អ្នកដំណើរការនៅលើ server ផ្សេង ការគ្រប់គ្រង start/stop/restart ត្រូវបានធ្វើឡើង
តាមរយៈ **SSH** មិនមែនតាមរយៈ `systemctl` ក្នុងមូលដ្ឋាននៅខាងក្នុង container ទេ (container មិនមាន
សិទ្ធិចូលប្រើ systemd របស់ host ផ្សេងទៀតទេ)។ ការភ្ជាប់ console គ្រប់គ្រង (`SHOW POOLS` ។ល។) នៅតែ
ដំណើរការធម្មតា ព្រោះវាគ្រាន់តែជាការភ្ជាប់ TCP ធម្មតាទៅកាន់ port របស់ PgBouncer — មិនរងផលប៉ះពាល់ពី
container ឬទីតាំង server ទេ។

### ១. រៀបចំ server PgBouncer (ពីចម្ងាយ)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

បន្ទាប់មកបង្កើត SSH key នៅលើម៉ាស៊ីនដែលអ្នកនឹងដំណើរការ `docker compose build` ហើយដំឡើង public
key ទៅកាន់ server PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-server-pgbouncer>
```

សូមប្រាកដផងដែរថា admin port របស់ PgBouncer (លំនាំដើម `6432`) អាចចូលប្រើបានពី network ដែល
container `pgbouncer-manager` កំពុងដំណើរការ។

### ២. ការកំណត់រចនាសម្ព័ន្ធ

```bash
cp .env.example .env
# កែសម្រួល .env: បំពេញ PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS ។ល។
```

### ៣. Build និងដំណើរការ

```bash
docker compose up -d --build
```

កម្មវិធីនេះនឹងមានជាធរមាននៅ `http://<host-នេះ>:8088` ជាមួយ dashboard ពេញលេញ (status, pools,
clients, stats, start/stop/restart តាមរយៈ SSH, reload ការកំណត់រចនាសម្ព័ន្ធ)។

### កំណត់សម្គាល់សំខាន់ៗ

- **tab "Configuration"** (ផ្លាស់ប្តូរ pool_mode) នឹងត្រូវបានបិទដោយស្វ័យប្រវត្តិនៅពេល
  `PGB_CONTROL_MODE=ssh` ព្រោះ endpoint នោះកែសម្រួល `pgbouncer.ini` នៅលើ filesystem ក្នុងមូលដ្ឋាន។
  ក្នុងមុខងារ SSH សូមកែសម្រួល `pgbouncer.ini` ដោយផ្ទាល់នៅលើ server PgBouncer (ដោយដៃ ឬតាមរយៈ
  Ansible/script ផ្ទាល់ខ្លួនរបស់អ្នក) បន្ទាប់មកចុចប៊ូតុង **Reload Config** នៅ tab Overview — វានៅតែ
  ដំណើរការព្រោះ `RELOAD` ត្រូវបានផ្ញើតាមរយៈ console គ្រប់គ្រងរបស់ PgBouncer មិនមែនតាមរយៈ
  filesystem ទេ។
- private key នៅ `./secrets/pgb_ssh_key` ត្រូវបាន mount ជា Docker secret (អាចអានបានតែម្នាក់ឯង
  ខាងក្នុង container មិនដែលត្រូវបានបញ្ចូលទៅក្នុង image ទេ)។ សូមកុំ commit ថតឯកសារ `secrets/` ទៅ
  git ជាដាច់ខាត។
- សម្រាប់សុវត្ថិភាព production សូមកំណត់ `knownHostsPath` នៅក្នុង `handlers.NewAPI` (បច្ចុប្បន្ន
  ជា `""` = រំលងការផ្ទៀងផ្ទាត់ host key) ជាមួយផ្លូវឯកសារ `known_hosts` ដែលមាន fingerprint របស់
  server PgBouncer ដើម្បីការពារពីការវាយប្រហារ MITM។
- ប្រសិនបើថ្ងៃណាមួយ PgBouncer ត្រូវបានផ្លាស់ទីទៅកាន់ host ដូចគ្នានឹង manager គ្រាន់តែកំណត់
  `PGB_CONTROL_MODE=local` ហើយដំណើរការ binary ដោយផ្ទាល់នៅលើ host នោះ (មិនមែននៅក្នុង container
  ទេ) ដើម្បីចូលប្រើ systemd ក្នុងមូលដ្ឋានបាន — សូមមើលផ្នែក "ការកំណត់ sudoers" ខាងលើ។

- សូមដំណើរការវានៅពីក្រោយ VPN/reverse proxy ដែលមាន TLS ជានិច្ច សូមកុំបង្ហាញវាដោយផ្ទាល់ទៅអ៊ីនធឺណិត
  ជាដាច់ខាត។
- `PGB_UI_USER`/`PGB_UI_PASS` គ្រាន់តែជាស្រទាប់ការពារអប្បបរមាមួយនៅពីមុខកម្មវិធីប៉ុណ្ណោះ។ ការ
  login ខ្លួនឯងប្រើការផ្ទៀងផ្ទាត់ផ្អែកលើ session ដែលមាន role រួចហើយ (admin និង viewer សូមមើលម៉ឺនុយ
  **Users**) — សូមប្រាកដថាបានផ្លាស់ប្តូរពាក្យសម្ងាត់គណនី `admin` លំនាំដើមភ្លាមៗបន្ទាប់ពី deploy ជាលើកដំបូង។
- ឯកសារ `.bak` នឹងត្រូវបានបង្កើតដោយស្វ័យប្រវត្តិមុនពេលសរសេរទៅ `pgbouncer.ini` រាល់ពេល។
