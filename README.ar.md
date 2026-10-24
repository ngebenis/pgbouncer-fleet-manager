# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md)*

واجهة ويب خفيفة لمراقبة والتحكم في PgBouncer: عرض حالة pools/clients/servers/stats، تشغيل/إيقاف/
إعادة تشغيل الخدمة، إعادة تحميل الإعدادات، الإيقاف المؤقت/الاستئناف، وتغيير pool_mode لكل قاعدة بيانات.

## التقنيات المستخدمة
- الخلفية (Backend): Go + Gin + pgx (يتصل مباشرة بوحدة تحكم إدارة PgBouncer عبر بروتوكول Postgres)
- الواجهة الأمامية (Frontend): Vue 3 + TypeScript + Vite (موجودة بالفعل في مجلد `web/`)

## تشغيل الواجهة الأمامية (بيئة التطوير)

```bash
cd web
npm install
npm run dev
```

يقوم خادم Vite للتطوير بتوجيه `/api/*` إلى `http://localhost:8088` (راجع `web/vite.config.ts`)،
لذا شغّل خلفية Go أولاً على هذا المنفذ.

## بناء الواجهة الأمامية للإنتاج

```bash
cd web
npm run build
```

تُحفظ نتيجة البناء في `web/dist/`، وخلفية Go (`cmd/server/main.go`) مُهيأة بالفعل لتقديم هذا
المجلد تلقائيًا كملفات ثابتة — لذا بعد البناء، يكفي تشغيل ملف Go التنفيذي فقط، دون الحاجة إلى
Node.js في بيئة الإنتاج.

## هيكل الواجهة الأمامية

```
web/src/
  App.vue                    # تخطيط لوحة التحكم + التنقل بين التبويبات
  main.ts                    # نقطة الدخول
  style.css                  # رموز التصميم (الوضع الداكن)
  types/api.ts                # أنواع استجابات الـ API
  composables/api.ts          # عميل axios لجميع نقاط نهاية الخلفية
  composables/usePolling.ts   # تحديث البيانات تلقائيًا كل بضع ثوانٍ (يتوقف عند إخفاء التبويب)
  components/
    ServiceStatusCard.vue     # الحالة + أزرار start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + إيقاف مؤقت/استئناف
    ReadOnlyCard.vue           # تبويبات clients/servers/stats/databases (قابلة لإعادة الاستخدام)
    ConfigEditorCard.vue       # تغيير pool_mode لكل قاعدة بيانات + الإعدادات العامة
    DataTable.vue              # جدول عام لعرض نتائج أوامر SHOW
```

## متطلبات PgBouncer الأساسية

1. تأكد من وجود مستخدم admin في `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. أضف بيانات اعتماد مستخدم admin هذا إلى `userlist.txt`.
3. تأكد من إمكانية الوصول إلى منفذ admin (عادةً نفس منفذ pgbouncer، والافتراضي هو 6432) من
   المضيف الذي تعمل عليه خدمة Go هذه.

## إعداد sudoers (لتشغيل/إيقاف/إعادة تشغيل الخدمة)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # التحقق من صحة الصياغة
```

عدّل `appuser` في هذا الملف ليطابق المستخدم الذي يشغّل ملف Go التنفيذي هذا. لا تمنح صلاحيات
sudo أوسع من هذه الأسطر الأربعة فقط.

## متغيرات البيئة

| المتغير | القيمة الافتراضية | الوصف |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | مضيف PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | منفذ PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | المستخدم المسجل في `admin_users` |
| `PGB_ADMIN_PASS` | - | كلمة مرور مستخدم admin |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | مسار ملف الإعدادات |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | مسار ملف userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | اسم وحدة systemd |
| `PGB_LISTEN_ADDR` | `:8088` | عنوان استماع خادم الويب |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | المصادقة الأساسية للواجهة (**إلزامية** قبل استخدامها خارج localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | مسار تخزين اسم التطبيق/الشركة (يُضبط عبر قائمة Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | مسار تخزين الشعار المخصص الذي يُرفع عبر قائمة Branding |

## التشغيل

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## نقاط النهاية الرئيسية

- `GET /api/status` — حالة خدمة systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — SET وقت التشغيل (محدود، راجع `SHOW CONFIG`)
- `GET /api/config-edit/raw` — قراءة محتوى ملف ini بالكامل كأقسام
- `POST /api/config-edit/database-field` `{"database","field","value"}` — تعديل ملف ini + RELOAD تلقائي
- `POST /api/config-edit/global-field` `{"field","value"}` — تعديل ملف ini + RELOAD تلقائي
- `GET /api/branding` `/api/branding/logo` — هوية التطبيق والشعار (عام، يُقرأ قبل تسجيل الدخول)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — للمسؤول (admin) فقط
- `POST /api/branding/logo` (multipart باسم `logo`، بحد أقصى 2MB) `/ DELETE /api/branding/logo` — للمسؤول فقط

## تخصيص هوية التطبيق (Branding)

تتيح قائمة **Branding** (للمسؤول فقط) تغيير اسم التطبيق، العنوان الفرعي، اسم الشركة/المؤسسة
الظاهر في التذييل، والشعار (ليحل محل أيقونة ◈ الافتراضية) — وتظهر هذه في الشريط الجانبي، صفحة
تسجيل الدخول، وعلامة تبويب المتصفح. تُحفظ كل هذه الإعدادات في `PGB_BRANDING_FILE`/`PGB_LOGO_FILE`
وتبقى محفوظة بعد إعادة تشغيل الحاوية طالما أن مجلد `/app/data` مُركّب كوحدة تخزين (volume).

## التشغيل باستخدام Docker (PgBouncer على خادم منفصل)

بما أن PgBouncer الخاص بك يعمل على خادم آخر، يتم التحكم في start/stop/restart عبر **SSH**، وليس
عبر `systemctl` المحلي داخل الحاوية (لا تملك الحاوية صلاحية الوصول إلى systemd الخاص بمضيف آخر).
تستمر اتصالات وحدة التحكم الإدارية (`SHOW POOLS` وما إلى ذلك) في العمل بشكل طبيعي لأنها مجرد
اتصال TCP عادي بمنفذ PgBouncer — ولا تتأثر بموقع الحاوية أو الخادم.

### 1. تجهيز خادم PgBouncer (عن بُعد)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

ثم أنشئ مفتاح SSH على الجهاز الذي ستُشغّل عليه `docker compose build`، وثبّت المفتاح العام على
خادم PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<عنوان-IP-خادم-PgBouncer>
```

تأكد أيضًا من إمكانية الوصول إلى منفذ admin الخاص بـ PgBouncer (الافتراضي `6432`) من الشبكة
التي تعمل عليها حاوية `pgbouncer-manager`.

### 2. الإعدادات

```bash
cp .env.example .env
# عدّل .env: املأ PGB_ADMIN_HOST و PGB_SSH_HOST و PGB_UI_USER/PASS وغيرها
```

### 3. البناء والتشغيل

```bash
docker compose up -d --build
```

سيكون التطبيق متاحًا على `http://<عنوان-هذا-المضيف>:8088`، مع لوحة تحكم كاملة (الحالة، pools،
clients، stats، تشغيل/إيقاف/إعادة تشغيل عبر SSH، إعادة تحميل الإعدادات).

### ملاحظات مهمة

- يتم تعطيل **تبويب "Configuration"** (تغيير pool_mode) تلقائيًا عند ضبط `PGB_CONTROL_MODE=ssh`،
  لأن نقطة النهاية هذه تعدّل `pgbouncer.ini` على نظام الملفات المحلي. في وضع SSH، عدّل
  `pgbouncer.ini` مباشرة على خادم PgBouncer (يدويًا أو عبر سكريبت/Ansible خاص بك)، ثم اضغط زر
  **Reload Config** في تبويب Overview — يستمر هذا في العمل لأن `RELOAD` يُرسل عبر وحدة التحكم
  الإدارية الخاصة بـ PgBouncer، وليس عبر نظام الملفات.
- يُركَّب المفتاح الخاص في `./secrets/pgb_ssh_key` كسر Docker (للقراءة فقط داخل الحاوية، ولا
  يُضمّن أبدًا في الصورة/image). لا تقم أبدًا برفع مجلد `secrets/` إلى git.
- لأمان أفضل في بيئة الإنتاج، اضبط `knownHostsPath` في `handlers.NewAPI` (حاليًا `""` = تخطي
  التحقق من مفتاح المضيف) بمسار ملف `known_hosts` يحتوي على بصمة خادم PgBouncer، للحماية من
  هجمات الوسيط (MITM).
- إذا تم نقل PgBouncer يومًا ما إلى نفس مضيف الـ manager، فقط اضبط `PGB_CONTROL_MODE=local` وشغّل
  الملف التنفيذي مباشرة على ذلك المضيف (وليس داخل حاوية) للوصول إلى systemd المحلي — راجع قسم
  "إعداد sudoers" أعلاه.

- شغّل هذا دائمًا خلف VPN/reverse proxy مع TLS، ولا تعرّضه مباشرة للإنترنت أبدًا.
- يُعدّ `PGB_UI_USER`/`PGB_UI_PASS` مجرد طبقة حماية بسيطة أمام التطبيق. يستخدم تسجيل الدخول نفسه
  بالفعل مصادقة قائمة على الجلسات مع الأدوار (admin مقابل viewer، راجع قائمة **Users**) — تأكد
  من تغيير كلمة مرور حساب `admin` الافتراضي فور النشر الأول.
- يتم إنشاء ملف `.bak` تلقائيًا قبل كل عملية كتابة في `pgbouncer.ini`.
