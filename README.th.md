# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[สำรวจแกลเลอรีอาหารและวัฒนธรรมอินโดนีเซีย →](CULTURE.md)**

เว็บ GUI น้ำหนักเบาสำหรับตรวจสอบและควบคุม PgBouncer: ดูสถานะ pools/clients/servers/stats,
start/stop/restart เซอร์วิส, reload การตั้งค่า, pause/resume, และเปลี่ยน pool_mode ต่อฐานข้อมูล

## ภาพหน้าจอ

| เข้าสู่ระบบ | แดชบอร์ด | Pools |
|---|---|---|
| ![เข้าสู่ระบบ](docs/screenshots/00-login.png) | ![แดชบอร์ด](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| ไคลเอนต์ | เซิร์ฟเวอร์ | สถิติ |
|---|---|---|
| ![ไคลเอนต์](docs/screenshots/03-clients.png) | ![เซิร์ฟเวอร์](docs/screenshots/04-servers.png) | ![สถิติ](docs/screenshots/05-stats.png) |

| ฐานข้อมูล | การตั้งค่า | จัดการเซิร์ฟเวอร์ |
|---|---|---|
| ![ฐานข้อมูล](docs/screenshots/06-databases.png) | ![การตั้งค่า](docs/screenshots/07-configuration.png) | ![จัดการเซิร์ฟเวอร์](docs/screenshots/08-manage-servers.png) |

| ผู้ใช้งาน | บันทึกตรวจสอบ | สำรองข้อมูล & กู้คืน |
|---|---|---|
| ![ผู้ใช้งาน](docs/screenshots/09-users.png) | ![บันทึกตรวจสอบ](docs/screenshots/10-audit-log.png) | ![สำรองข้อมูล & กู้คืน](docs/screenshots/11-backup-restore.png) |

| ข้อมูลแบรนด์ |
|---|
| ![ข้อมูลแบรนด์](docs/screenshots/12-identity.png) |

## สแตกเทคโนโลยี
- Backend: Go + Gin + pgx (เชื่อมต่อโดยตรงกับ admin console ของ PgBouncer ผ่านโปรโตคอล Postgres)
- Frontend: Vue 3 + TypeScript + Vite (มีอยู่แล้วในโฟลเดอร์ `web/`)

## รัน frontend (โหมดพัฒนา)

```bash
cd web
npm install
npm run dev
```

Vite dev server จะ proxy `/api/*` ไปที่ `http://localhost:8088` (ดู `web/vite.config.ts`)
ดังนั้นให้รัน backend Go ที่พอร์ตนั้นก่อน

## Build frontend สำหรับ production

```bash
cd web
npm run build
```

ผลลัพธ์การ build จะไปอยู่ที่ `web/dist/` และ backend Go (`cmd/server/main.go`) ถูกตั้งค่าไว้แล้ว
ให้ serve โฟลเดอร์นี้เป็น static file โดยอัตโนมัติ — ดังนั้นหลัง build แล้วเพียงรันไบนารี Go
ไม่จำเป็นต้องมี Node.js บนเซิร์ฟเวอร์ production

## โครงสร้าง frontend

```
web/src/
  App.vue                    # เลย์เอาต์ dashboard + การนำทางแบบแท็บ
  main.ts                    # จุดเริ่มต้นของแอป
  style.css                  # design token (ธีมมืด)
  types/api.ts                # ชนิดข้อมูล response ของ API
  composables/api.ts          # axios client สำหรับ endpoint ทั้งหมดของ backend
  composables/usePolling.ts   # รีเฟรชข้อมูลอัตโนมัติทุกไม่กี่วินาที (หยุดเมื่อแท็บถูกซ่อน)
  components/
    ServiceStatusCard.vue     # สถานะ + ปุ่ม start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # แท็บ clients/servers/stats/databases (ใช้ซ้ำได้)
    ConfigEditorCard.vue       # เปลี่ยน pool_mode ต่อฐานข้อมูล + การตั้งค่าส่วนกลาง
    DataTable.vue              # ตารางทั่วไปสำหรับผลลัพธ์คำสั่ง SHOW
```

## สิ่งที่ต้องเตรียมสำหรับ PgBouncer

1. ตรวจสอบว่ามี admin user ใน `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. เพิ่มข้อมูลรับรองของ admin user นั้นใน `userlist.txt`
3. ตรวจสอบว่าพอร์ต admin (ปกติเหมือนกับพอร์ต pgbouncer ค่าเริ่มต้นคือ 6432) สามารถเข้าถึงได้
   จากโฮสต์ที่รันเซอร์วิส Go นี้

## ตั้งค่า sudoers (สำหรับ start/stop/restart เซอร์วิส)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # ตรวจสอบไวยากรณ์
```

แก้ไข `appuser` ในไฟล์นั้นให้ตรงกับผู้ใช้ที่รันไบนารี Go นี้ **ห้าม** ให้สิทธิ์ sudo กว้างกว่า
คำสั่งทั้ง 4 บรรทัดนี้

## ตัวแปรสภาพแวดล้อม

| ตัวแปร | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | โฮสต์ของ PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | พอร์ตของ PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | ผู้ใช้ที่ลงทะเบียนใน `admin_users` |
| `PGB_ADMIN_PASS` | - | รหัสผ่านของ admin user |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | พาธของไฟล์ config |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | พาธของไฟล์ userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | ชื่อ systemd unit |
| `PGB_LISTEN_ADDR` | `:8088` | ที่อยู่ที่เว็บเซิร์ฟเวอร์ listen |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | basic auth สำหรับ UI (**จำเป็นต้องตั้งค่า** ก่อนใช้งานนอก localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | พาธเก็บชื่อแอป/บริษัท (ตั้งค่าผ่านเมนู Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | พาธเก็บโลโก้ที่อัปโหลดผ่านเมนู Branding |

## การรัน

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Endpoint หลัก

- `GET /api/status` — สถานะเซอร์วิส systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — runtime SET (มีข้อจำกัด ดู `SHOW CONFIG`)
- `GET /api/config-edit/raw` — อ่านเนื้อหาไฟล์ ini ทั้งหมดในรูปแบบ sections
- `POST /api/config-edit/database-field` `{"database","field","value"}` — แก้ไข ini + RELOAD อัตโนมัติ
- `POST /api/config-edit/global-field` `{"field","value"}` — แก้ไข ini + RELOAD อัตโนมัติ
- `GET /api/branding` `/api/branding/logo` — ข้อมูลแบรนด์แอปและโลโก้ (public อ่านได้ก่อน login)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — admin เท่านั้น
- `POST /api/branding/logo` (multipart `logo` สูงสุด 2MB) `/ DELETE /api/branding/logo` — admin เท่านั้น

## ปรับแต่งข้อมูลแบรนด์แอป (Branding)

เมนู **Branding** (admin เท่านั้น) ให้คุณเปลี่ยนชื่อแอป, คำบรรยายรอง, ชื่อบริษัท/องค์กรที่แสดงใน
footer, และโลโก้ (แทนที่ไอคอน ◈ ค่าเริ่มต้น) — จะแสดงที่ sidebar, หน้า login, และแท็บเบราว์เซอร์
การตั้งค่าทั้งหมดนี้ถูกบันทึกไว้ที่ `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` และคงอยู่แม้ container
รีสตาร์ท ตราบใดที่โฟลเดอร์ `/app/data` ถูก mount เป็น volume

## รันด้วย Docker (PgBouncer อยู่คนละเซิร์ฟเวอร์)

เนื่องจาก PgBouncer ของคุณรันอยู่บนเซิร์ฟเวอร์อื่น การควบคุม start/stop/restart จะทำผ่าน **SSH**
ไม่ใช่ `systemctl` ภายใน container (container ไม่มีสิทธิ์เข้าถึง systemd ของโฮสต์อื่น) การเชื่อมต่อ
admin console (`SHOW POOLS` เป็นต้น) ยังคงทำงานได้ตามปกติ เพราะเป็นเพียงการเชื่อมต่อ TCP ธรรมดา
ไปยังพอร์ตของ PgBouncer — ไม่ได้รับผลกระทบจาก container หรือตำแหน่งของเซิร์ฟเวอร์

### 1. เตรียมเซิร์ฟเวอร์ PgBouncer (รีโมต)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

จากนั้นสร้าง SSH key บนเครื่องที่คุณจะรัน `docker compose build` และติดตั้ง public key ไปยัง
เซิร์ฟเวอร์ PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-เซิร์ฟเวอร์-pgbouncer>
```

ตรวจสอบด้วยว่าพอร์ต admin ของ PgBouncer (ค่าเริ่มต้น `6432`) สามารถเข้าถึงได้จากเครือข่ายที่
container `pgbouncer-manager` รันอยู่

### 2. การตั้งค่า

```bash
cp .env.example .env
# แก้ไข .env: กรอก PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS เป็นต้น
```

### 3. Build และรัน

```bash
docker compose up -d --build
```

แอปจะพร้อมใช้งานที่ `http://<โฮสต์นี้>:8088` พร้อม dashboard ครบถ้วน (status, pools, clients,
stats, start/stop/restart ผ่าน SSH, reload การตั้งค่า)

### หมายเหตุสำคัญ

- **แท็บ "Configuration"** (เปลี่ยน pool_mode) จะปิดการใช้งานอัตโนมัติเมื่อ `PGB_CONTROL_MODE=ssh`
  เพราะ endpoint นี้แก้ไข `pgbouncer.ini` บนไฟล์ระบบในเครื่อง ในโหมด SSH ให้แก้ไข
  `pgbouncer.ini` โดยตรงบนเซิร์ฟเวอร์ PgBouncer (ด้วยมือหรือผ่าน Ansible/สคริปต์ของคุณเอง)
  จากนั้นคลิกปุ่ม **Reload Config** ที่แท็บ Overview — ยังคงใช้งานได้เพราะ `RELOAD` ถูกส่งผ่าน
  admin console ของ PgBouncer ไม่ใช่ผ่านไฟล์ระบบ
- private key ที่ `./secrets/pgb_ssh_key` จะถูก mount เป็น Docker secret (อ่านอย่างเดียวภายใน
  container ไม่ถูกฝังลงใน image) ห้าม commit โฟลเดอร์ `secrets/` ลง git
- เพื่อความปลอดภัยใน production ให้ตั้งค่า `knownHostsPath` ใน `handlers.NewAPI` (ปัจจุบันเป็น
  `""` = ข้ามการตรวจสอบ host key) ด้วยพาธไฟล์ `known_hosts` ที่มี fingerprint ของเซิร์ฟเวอร์
  PgBouncer เพื่อป้องกันการโจมตีแบบ MITM
- หากในอนาคต PgBouncer ถูกย้ายไปอยู่โฮสต์เดียวกับ manager เพียงตั้งค่า `PGB_CONTROL_MODE=local`
  และรันไบนารีโดยตรงบนโฮสต์นั้น (ไม่ใช่ใน container) เพื่อเข้าถึง systemd ในเครื่องได้ — ดูหัวข้อ
  "ตั้งค่า sudoers" ด้านบน

- รันบริการนี้อยู่หลัง VPN/reverse proxy ที่มี TLS เสมอ อย่าเปิดสู่อินเทอร์เน็ตโดยตรง
- `PGB_UI_USER`/`PGB_UI_PASS` เป็นเพียงชั้นป้องกันขั้นต่ำหน้าตัวแอป ระบบ login เองใช้
  session-based auth พร้อมบทบาท (admin กับ viewer ดูเมนู **Users**) อยู่แล้ว — ควรเปลี่ยนรหัสผ่าน
  บัญชี `admin` เริ่มต้นทันทีหลัง deploy ครั้งแรก
- ไฟล์ `.bak` จะถูกสร้างขึ้นอัตโนมัติก่อนการเขียนลง `pgbouncer.ini` ทุกครั้ง

## บริจาค

☕ *เลี้ยงกาแฟฉันสักแก้ว*

PayPal: **b3n1_id@yahoo.com** (benisantoso72@gmail.com)
