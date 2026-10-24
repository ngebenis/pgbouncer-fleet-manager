# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

Giao diện web nhẹ để giám sát & điều khiển PgBouncer: trạng thái pools/clients/servers/stats,
start/stop/restart service, reload cấu hình, pause/resume, và thay đổi pool_mode theo từng
cơ sở dữ liệu.

## Công nghệ sử dụng
- Backend: Go + Gin + pgx (kết nối trực tiếp đến admin console của PgBouncer qua giao thức Postgres)
- Frontend: Vue 3 + TypeScript + Vite (đã có sẵn trong thư mục `web/`)

## Chạy frontend (môi trường phát triển)

```bash
cd web
npm install
npm run dev
```

Vite dev server sẽ proxy `/api/*` đến `http://localhost:8088` (xem `web/vite.config.ts`),
vì vậy hãy chạy backend Go trên cổng đó trước.

## Build frontend cho production

```bash
cd web
npm run build
```

Kết quả build sẽ nằm ở `web/dist/`, và backend Go (`cmd/server/main.go`) đã được cấu hình sẵn
để tự động phục vụ thư mục này như static file — vì vậy sau khi build, chỉ cần chạy binary Go,
không cần Node.js trên server production.

## Cấu trúc frontend

```
web/src/
  App.vue                    # bố cục dashboard + điều hướng theo tab
  main.ts                    # điểm khởi đầu ứng dụng
  style.css                  # design token (giao diện tối)
  types/api.ts                # kiểu dữ liệu response của API
  composables/api.ts          # axios client cho tất cả endpoint của backend
  composables/usePolling.ts   # tự động làm mới dữ liệu mỗi vài giây (tạm dừng khi tab bị ẩn)
  components/
    ServiceStatusCard.vue     # trạng thái + nút start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # các tab clients/servers/stats/databases (có thể tái sử dụng)
    ConfigEditorCard.vue       # thay đổi pool_mode theo từng database + cài đặt chung
    DataTable.vue              # bảng dùng chung cho kết quả lệnh SHOW
```

## Chuẩn bị cho PgBouncer

1. Đảm bảo đã có admin user trong `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Thêm thông tin đăng nhập của admin user đó vào `userlist.txt`.
3. Đảm bảo cổng admin (thường trùng với cổng pgbouncer, mặc định 6432) có thể truy cập được từ
   host đang chạy service Go này.

## Thiết lập sudoers (để start/stop/restart service)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # kiểm tra cú pháp
```

Chỉnh sửa `appuser` trong file đó cho khớp với user chạy binary Go này. KHÔNG cấp quyền sudo
rộng hơn 4 dòng lệnh đó.

## Biến môi trường

| Biến | Mặc định | Mô tả |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | host của PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | cổng của PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | user đã đăng ký trong `admin_users` |
| `PGB_ADMIN_PASS` | - | mật khẩu của admin user |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | đường dẫn file cấu hình |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | đường dẫn file userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | tên systemd unit |
| `PGB_LISTEN_ADDR` | `:8088` | địa chỉ lắng nghe của web server |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | xác thực cơ bản cho UI (**BẮT BUỘC** phải thiết lập trước khi dùng ngoài localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | đường dẫn lưu tên ứng dụng/công ty (thiết lập qua menu Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | đường dẫn lưu logo tùy chỉnh tải lên qua menu Branding |

## Chạy ứng dụng

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Các endpoint chính

- `GET /api/status` — trạng thái service systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — SET thời gian chạy (có giới hạn, xem `SHOW CONFIG`)
- `GET /api/config-edit/raw` — đọc toàn bộ nội dung file ini dưới dạng các section
- `POST /api/config-edit/database-field` `{"database","field","value"}` — chỉnh sửa ini + tự động RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — chỉnh sửa ini + tự động RELOAD
- `GET /api/branding` `/api/branding/logo` — thông tin nhận diện ứng dụng & logo (công khai, đọc được trước khi đăng nhập)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — chỉ admin
- `POST /api/branding/logo` (multipart `logo`, tối đa 2MB) `/ DELETE /api/branding/logo` — chỉ admin

## Tùy chỉnh nhận diện ứng dụng (Branding)

Menu **Branding** (chỉ admin) cho phép thay đổi tên ứng dụng, phụ đề, tên công ty/tổ chức hiển
thị ở footer, và logo (thay thế icon ◈ mặc định) — hiển thị ở sidebar, trang đăng nhập, và tab
trình duyệt. Tất cả các thiết lập này được lưu tại `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` và vẫn
tồn tại sau khi container khởi động lại, miễn là thư mục `/app/data` được mount như một volume.

## Chạy bằng Docker (PgBouncer trên server riêng)

Vì PgBouncer của bạn chạy trên một server khác, việc điều khiển start/stop/restart được thực hiện
qua **SSH**, chứ không phải `systemctl` cục bộ bên trong container (container không có quyền truy
cập systemd của host khác). Kết nối admin console (`SHOW POOLS`, v.v.) vẫn hoạt động bình thường
vì đó chỉ là một kết nối TCP thông thường đến cổng của PgBouncer — không bị ảnh hưởng bởi
container hay vị trí server.

### 1. Chuẩn bị server PgBouncer (từ xa)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Sau đó tạo SSH key trên máy bạn sẽ chạy `docker compose build`, và cài đặt public key lên server
PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-server-pgbouncer>
```

Đồng thời đảm bảo cổng admin của PgBouncer (mặc định `6432`) có thể truy cập được từ mạng mà
container `pgbouncer-manager` đang chạy.

### 2. Cấu hình

```bash
cp .env.example .env
# chỉnh sửa .env: điền PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS, v.v.
```

### 3. Build và chạy

```bash
docker compose up -d --build
```

Ứng dụng sẽ khả dụng tại `http://<host-này>:8088`, với dashboard đầy đủ (status, pools, clients,
stats, start/stop/restart qua SSH, reload cấu hình).

### Lưu ý quan trọng

- **Tab "Configuration"** (thay đổi pool_mode) sẽ tự động bị vô hiệu hóa khi
  `PGB_CONTROL_MODE=ssh`, vì endpoint đó chỉnh sửa `pgbouncer.ini` trên hệ thống file cục bộ.
  Ở chế độ SSH, hãy chỉnh sửa `pgbouncer.ini` trực tiếp trên server PgBouncer (thủ công hoặc
  qua Ansible/script riêng của bạn), sau đó nhấn nút **Reload Config** ở tab Overview — nút này
  vẫn hoạt động vì `RELOAD` được gửi qua admin console của PgBouncer, không phải qua hệ thống file.
- Private key tại `./secrets/pgb_ssh_key` được mount dưới dạng Docker secret (chỉ đọc bên trong
  container, không bao giờ được đóng gói vào image). Không bao giờ commit thư mục `secrets/` lên git.
- Để bảo mật trong môi trường production, hãy thiết lập `knownHostsPath` trong `handlers.NewAPI`
  (hiện tại là `""` = bỏ qua xác minh host key) với đường dẫn file `known_hosts` chứa fingerprint
  của server PgBouncer, để bảo vệ khỏi tấn công MITM.
- Nếu sau này PgBouncer được chuyển sang cùng host với manager, chỉ cần đặt
  `PGB_CONTROL_MODE=local` và chạy binary trực tiếp trên host đó (không phải trong container) để
  truy cập được systemd cục bộ — xem phần "Thiết lập sudoers" ở trên.

- Luôn chạy ứng dụng này sau VPN/reverse proxy có TLS, không bao giờ expose trực tiếp ra internet.
- `PGB_UI_USER`/`PGB_UI_PASS` chỉ là một lớp bảo vệ tối thiểu phía trước ứng dụng. Bản thân việc
  đăng nhập đã sử dụng xác thực dựa trên session với vai trò (admin và viewer, xem menu **Users**)
  — hãy đảm bảo đổi mật khẩu tài khoản `admin` mặc định ngay sau lần deploy đầu tiên.
- Một file `.bak` sẽ tự động được tạo trước mỗi lần ghi vào `pgbouncer.ini`.
