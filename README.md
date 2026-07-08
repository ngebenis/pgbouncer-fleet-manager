# PgBouncer Manager

Web GUI ringan untuk monitor & kontrol PgBouncer: status pools/clients/servers/stats,
start/stop/restart service, reload config, pause/resume, dan ganti pool_mode per database.

## Stack
- Backend: Go + Gin + pgx (koneksi langsung ke admin console PgBouncer via protokol Postgres)
- Frontend: Vue 3 + TypeScript + Vite (sudah ada di folder `web/`)

## Menjalankan frontend (development)

```bash
cd web
npm install
npm run dev
```

Vite dev server akan proxy `/api/*` ke `http://localhost:8088` (lihat `web/vite.config.ts`),
jadi jalankan backend Go terlebih dahulu di port tersebut.

## Build frontend untuk production

```bash
cd web
npm run build
```

Hasil build masuk ke `web/dist/`, dan backend Go (`cmd/server/main.go`) sudah dikonfigurasi
untuk serve folder ini secara otomatis sebagai static file — jadi setelah build, cukup jalankan
binary Go saja, tidak perlu Node.js di server production.

## Struktur frontend

```
web/src/
  App.vue                    # layout dashboard + tab navigation
  main.ts                    # entrypoint
  style.css                  # design tokens (dark theme)
  types/api.ts                # tipe response API
  composables/api.ts          # axios client untuk semua endpoint backend
  composables/usePolling.ts   # auto-refresh data tiap beberapa detik (pause saat tab hidden)
  components/
    ServiceStatusCard.vue     # status + tombol start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # tab clients/servers/stats/databases (reusable)
    ConfigEditorCard.vue       # ganti pool_mode per database + setting global
    DataTable.vue              # tabel generik dari hasil SHOW command
```

## Persiapan PgBouncer

1. Pastikan ada admin user di `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Tambahkan kredensial admin user tersebut di `userlist.txt`.
3. Pastikan port admin (biasanya sama dengan port pgbouncer, default 6432) bisa diakses dari host
   tempat Go service ini berjalan.

## Setup sudoers (untuk start/stop/restart service)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # validasi syntax
```

Edit `appuser` di file tersebut sesuai user yang menjalankan binary Go ini. JANGAN beri akses
sudo yang lebih luas dari 4 baris command tersebut.

## Environment variables

| Var | Default | Keterangan |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | host PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | port PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | user yang terdaftar di `admin_users` |
| `PGB_ADMIN_PASS` | - | password admin user |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | path config |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | path userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | nama systemd unit |
| `PGB_LISTEN_ADDR` | `:8088` | alamat listen web server |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | basic auth untuk UI (WAJIB diisi sebelum dipakai di luar localhost) |

## Menjalankan

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Endpoint utama

- `GET /api/status` — status systemd service (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — runtime SET (terbatas, cek `SHOW CONFIG`)
- `GET /api/config-edit/raw` — baca seluruh isi ini sebagai sections
- `POST /api/config-edit/database-field` `{"database","field","value"}` — edit ini + auto RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — edit ini + auto RELOAD

## Menjalankan dengan Docker (PgBouncer di server terpisah)

Karena PgBouncer Anda berjalan di server lain, kontrol start/stop/restart dilakukan lewat **SSH**,
bukan `systemctl` lokal di dalam container (container tidak punya akses ke systemd host lain).
Koneksi admin console (`SHOW POOLS` dll) tetap jalan normal karena itu cuma koneksi TCP biasa ke
port PgBouncer — tidak terpengaruh container atau lokasi server.

### 1. Siapkan server PgBouncer (remote)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Lalu generate SSH key di mesin tempat Anda akan `docker compose build`, dan pasang public key-nya
ke server PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-server-pgbouncer>
```

Pastikan juga port admin PgBouncer (default `6432`) bisa diakses dari network tempat container
`pgbouncer-manager` berjalan.

### 2. Konfigurasi

```bash
cp .env.example .env
# edit .env: isi PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS, dll
```

### 3. Build & jalankan

```bash
docker compose up -d --build
```

App akan tersedia di `http://<host-ini>:8088`, dengan dashboard lengkap (status, pools, clients,
stats, start/stop/restart via SSH, reload config).

### Catatan penting

- **Tab "Konfigurasi" (ganti pool_mode)** otomatis nonaktif saat `PGB_CONTROL_MODE=ssh`, karena
  endpoint itu mengedit `pgbouncer.ini` di filesystem lokal. Untuk mode SSH, edit `pgbouncer.ini`
  langsung di server PgBouncer (manual atau via Ansible/script Anda sendiri), lalu klik tombol
  **Reload Config** di tab Overview — itu tetap jalan karena `RELOAD` dikirim lewat admin console
  PgBouncer, bukan lewat filesystem.
- Private key di `./secrets/pgb_ssh_key` dipasang sebagai Docker secret (read-only di dalam
  container, tidak ikut ter-bake ke image). Jangan commit folder `secrets/` ke git.
- Untuk keamanan produksi, isi `knownHostsPath` di `handlers.NewAPI` (saat ini `""` = skip host
  key verification) dengan path file `known_hosts` yang sudah berisi fingerprint server PgBouncer,
  supaya terlindungi dari MITM.
- Jika suatu saat PgBouncer dipindah ke host yang sama dengan manager, cukup set
  `PGB_CONTROL_MODE=local` dan jalankan binary langsung di host tersebut (bukan di container) agar
  bisa akses systemd lokal — lihat bagian "Setup sudoers" di atas.

- Selalu jalankan di belakang VPN/reverse proxy dengan TLS, jangan ekspos langsung ke internet.
- `PGB_UI_USER`/`PGB_UI_PASS` adalah proteksi minimal — untuk produksi pertimbangkan ganti
  dengan session-based auth + role (read-only vs admin) seperti yang sudah dipakai di
  PGHBA Manager Anda.
- File `.bak` otomatis dibuat sebelum setiap penulisan `pgbouncer.ini`.
