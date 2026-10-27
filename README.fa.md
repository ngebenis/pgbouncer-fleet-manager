# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[گالری آشپزی و فرهنگ اندونزی را کاوش کنید ←](CULTURE.md)**

یک رابط وب سبک برای نظارت و کنترل PgBouncer: مشاهده وضعیت pools/clients/servers/stats، start/stop/
restart کردن سرویس، reload کردن تنظیمات، pause/resume کردن، و تغییر pool_mode به ازای هر پایگاه
داده.

## تصاویر صفحه

| ورود | داشبورد | Pools |
|---|---|---|
| ![ورود](docs/screenshots/00-login.png) | ![داشبورد](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| کلاینت‌ها | سرورها | آمار |
|---|---|---|
| ![کلاینت‌ها](docs/screenshots/03-clients.png) | ![سرورها](docs/screenshots/04-servers.png) | ![آمار](docs/screenshots/05-stats.png) |

| پایگاه‌های داده | پیکربندی | مدیریت سرورها |
|---|---|---|
| ![پایگاه‌های داده](docs/screenshots/06-databases.png) | ![پیکربندی](docs/screenshots/07-configuration.png) | ![مدیریت سرورها](docs/screenshots/08-manage-servers.png) |

| کاربران | گزارش ممیزی | پشتیبان‌گیری و بازیابی |
|---|---|---|
| ![کاربران](docs/screenshots/09-users.png) | ![گزارش ممیزی](docs/screenshots/10-audit-log.png) | ![پشتیبان‌گیری و بازیابی](docs/screenshots/11-backup-restore.png) |

| هویت |
|---|
| ![هویت](docs/screenshots/12-identity.png) |

## پشته فناوری
- بک‌اند: Go + Gin + pgx (اتصال مستقیم به کنسول مدیریتی PgBouncer از طریق پروتکل Postgres)
- فرانت‌اند: Vue 3 + TypeScript + Vite (از قبل در پوشه `web/` موجود است)

## اجرای فرانت‌اند (محیط توسعه)

```bash
cd web
npm install
npm run dev
```

سرور توسعه Vite درخواست‌های `/api/*` را به `http://localhost:8088` پراکسی می‌کند (به
`web/vite.config.ts` مراجعه کنید)، بنابراین ابتدا بک‌اند Go را روی همان پورت اجرا کنید.

## ساخت فرانت‌اند برای محیط تولید

```bash
cd web
npm run build
```

نتیجه build در `web/dist/` قرار می‌گیرد و بک‌اند Go (`cmd/server/main.go`) از قبل برای serve
کردن خودکار این پوشه به‌عنوان فایل‌های استاتیک پیکربندی شده است — بنابراین پس از build، فقط کافی
است باینری Go را اجرا کنید، نیازی به Node.js در سرور تولید نیست.

## ساختار فرانت‌اند

```
web/src/
  App.vue                    # چیدمان داشبورد + ناوبری تب‌ها
  main.ts                    # نقطه ورود
  style.css                  # توکن‌های طراحی (تم تیره)
  types/api.ts                # نوع‌های پاسخ API
  composables/api.ts          # کلاینت axios برای تمام endpoint های بک‌اند
  composables/usePolling.ts   # بروزرسانی خودکار داده‌ها هر چند ثانیه (متوقف هنگام پنهان بودن تب)
  components/
    ServiceStatusCard.vue     # وضعیت + دکمه‌های start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # تب‌های clients/servers/stats/databases (قابل استفاده مجدد)
    ConfigEditorCard.vue       # تغییر pool_mode به ازای هر پایگاه داده + تنظیمات سراسری
    DataTable.vue              # جدول عمومی برای نتایج دستورات SHOW
```

## پیش‌نیازهای PgBouncer

1. مطمئن شوید که یک کاربر admin در `pgbouncer.ini` تنظیم شده است:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. اطلاعات ورود این کاربر admin را به `userlist.txt` اضافه کنید.
3. مطمئن شوید که پورت admin (معمولاً همان پورت pgbouncer، پیش‌فرض 6432) از میزبانی که این سرویس
   Go روی آن اجرا می‌شود قابل دسترسی است.

## تنظیم sudoers (برای start/stop/restart سرویس)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # بررسی صحت نحو
```

`appuser` را در آن فایل متناسب با کاربری که این باینری Go را اجرا می‌کند ویرایش کنید. دسترسی
sudo را فراتر از این ۴ خط دستور **ندهید**.

## متغیرهای محیطی

| متغیر | پیش‌فرض | توضیح |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | میزبان PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | پورت PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | کاربر ثبت‌شده در `admin_users` |
| `PGB_ADMIN_PASS` | - | رمز عبور کاربر admin |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | مسیر فایل تنظیمات |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | مسیر فایل userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | نام واحد systemd |
| `PGB_LISTEN_ADDR` | `:8088` | آدرس گوش‌دادن سرور وب |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | احراز هویت پایه برای رابط کاربری (**الزامی** پیش از استفاده خارج از localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | مسیر ذخیره‌سازی نام برنامه/شرکت (از طریق منوی Branding تنظیم می‌شود) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | مسیر ذخیره‌سازی لوگوی سفارشی آپلودشده از طریق منوی Branding |

## اجرا

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## endpoint های اصلی

- `GET /api/status` — وضعیت سرویس systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — SET زمان اجرا (محدود، به `SHOW CONFIG` مراجعه کنید)
- `GET /api/config-edit/raw` — خواندن کل محتوای فایل ini به‌صورت بخش‌بندی‌شده
- `POST /api/config-edit/database-field` `{"database","field","value"}` — ویرایش ini + RELOAD خودکار
- `POST /api/config-edit/global-field` `{"field","value"}` — ویرایش ini + RELOAD خودکار
- `GET /api/branding` `/api/branding/logo` — هویت برنامه و لوگو (عمومی، قابل خواندن پیش از ورود)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — فقط admin
- `POST /api/branding/logo` (multipart با فیلد `logo`، حداکثر 2MB) `/ DELETE /api/branding/logo` — فقط admin

## سفارشی‌سازی هویت برنامه (Branding)

منوی **Branding** (فقط admin) امکان تغییر نام برنامه، زیرعنوان، نام شرکت/سازمان نمایش داده‌شده
در فوتر، و لوگو (جایگزین آیکون پیش‌فرض ◈) را فراهم می‌کند — این‌ها در نوار کناری، صفحه ورود و تب
مرورگر نمایش داده می‌شوند. تمام این تنظیمات در `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` ذخیره می‌شوند
و تا زمانی که پوشه `/app/data` به‌عنوان volume مانت شده باشد، پس از راه‌اندازی مجدد کانتینر باقی
می‌مانند.

## اجرا با Docker (PgBouncer روی سروری جداگانه)

از آنجا که PgBouncer شما روی سروری دیگر اجرا می‌شود، کنترل start/stop/restart از طریق **SSH**
انجام می‌شود، نه `systemctl` محلی درون کانتینر (کانتینر به systemd میزبان دیگر دسترسی ندارد).
اتصالات کنسول مدیریتی (`SHOW POOLS` و غیره) به‌طور طبیعی کار می‌کنند، زیرا این فقط یک اتصال TCP
معمولی به پورت PgBouncer است — تحت تأثیر کانتینر یا موقعیت سرور قرار نمی‌گیرد.

### ۱. آماده‌سازی سرور PgBouncer (راه دور)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

سپس روی ماشینی که در آن `docker compose build` را اجرا می‌کنید، یک کلید SSH بسازید و کلید عمومی
را روی سرور PgBouncer نصب کنید:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<آی‌پی-سرور-pgbouncer>
```

همچنین مطمئن شوید که پورت admin مربوط به PgBouncer (پیش‌فرض `6432`) از شبکه‌ای که کانتینر
`pgbouncer-manager` در آن اجرا می‌شود قابل دسترسی است.

### ۲. پیکربندی

```bash
cp .env.example .env
# فایل .env را ویرایش کنید: PGB_ADMIN_HOST، PGB_SSH_HOST، PGB_UI_USER/PASS و غیره را پر کنید
```

### ۳. build و اجرا

```bash
docker compose up -d --build
```

برنامه در آدرس `http://<این-میزبان>:8088` با داشبورد کامل (status، pools، clients، stats،
start/stop/restart از طریق SSH، reload تنظیمات) در دسترس خواهد بود.

### نکات مهم

- **تب "Configuration"** (تغییر pool_mode) هنگامی که `PGB_CONTROL_MODE=ssh` باشد به‌طور خودکار
  غیرفعال می‌شود، زیرا آن endpoint فایل `pgbouncer.ini` را روی سیستم فایل محلی ویرایش می‌کند.
  در حالت SSH، `pgbouncer.ini` را مستقیماً روی سرور PgBouncer ویرایش کنید (به‌صورت دستی یا با
  Ansible/اسکریپت خودتان)، سپس روی دکمه **Reload Config** در تب Overview کلیک کنید — این همچنان
  کار می‌کند زیرا `RELOAD` از طریق کنسول مدیریتی PgBouncer ارسال می‌شود، نه از طریق سیستم فایل.
- کلید خصوصی در `./secrets/pgb_ssh_key` به‌عنوان یک Docker secret مانت می‌شود (فقط خواندنی درون
  کانتینر، هرگز در image جای‌گذاری نمی‌شود). هرگز پوشه `secrets/` را در git commit نکنید.
- برای امنیت در محیط تولید، `knownHostsPath` را در `handlers.NewAPI` (در حال حاضر `""` = صرف‌نظر
  از بررسی host key) به مسیر یک فایل `known_hosts` حاوی اثر انگشت سرور PgBouncer تنظیم کنید تا در
  برابر حملات MITM محافظت شوید.
- اگر روزی PgBouncer به همان میزبان manager منتقل شود، کافی است `PGB_CONTROL_MODE=local` را
  تنظیم کنید و باینری را مستقیماً روی آن میزبان (نه در کانتینر) اجرا کنید تا به systemd محلی
  دسترسی داشته باشید — به بخش «تنظیم sudoers» در بالا مراجعه کنید.

- همیشه این سرویس را پشت یک VPN/reverse proxy دارای TLS اجرا کنید، هرگز آن را مستقیماً روی
  اینترنت در معرض دید قرار ندهید.
- `PGB_UI_USER`/`PGB_UI_PASS` فقط یک لایه حفاظتی حداقلی جلوی برنامه است. خود ورود به سیستم از
  قبل از احراز هویت مبتنی بر session با نقش‌ها (admin در برابر viewer، منوی **Users** را ببینید)
  استفاده می‌کند — مطمئن شوید بلافاصله پس از اولین deploy، رمز عبور حساب پیش‌فرض `admin` را تغییر
  می‌دهید.
- پیش از هر بار نوشتن در `pgbouncer.ini`، یک فایل `.bak` به‌طور خودکار ایجاد می‌شود.

## اهدا

☕ *یک فنجان قهوه به من مهمان کنید*

PayPal: **b3n1_id@yahoo.com** (benisantoso72@gmail.com)
