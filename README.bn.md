# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [Русский](README.ru.md)*

PgBouncer মনিটর ও নিয়ন্ত্রণের জন্য একটি হালকা ওজনের ওয়েব GUI: pools/clients/servers/stats-এর
অবস্থা দেখা, সার্ভিস start/stop/restart করা, কনফিগ reload করা, pause/resume করা, এবং প্রতিটি
ডেটাবেসের জন্য pool_mode পরিবর্তন করা।

## স্ট্যাক
- Backend: Go + Gin + pgx (Postgres প্রোটোকলের মাধ্যমে সরাসরি PgBouncer admin console-এর সাথে সংযুক্ত হয়)
- Frontend: Vue 3 + TypeScript + Vite (ইতিমধ্যে `web/` ফোল্ডারে আছে)

## Frontend চালানো (ডেভেলপমেন্ট)

```bash
cd web
npm install
npm run dev
```

Vite dev server `/api/*`-কে `http://localhost:8088`-এ proxy করবে (দেখুন `web/vite.config.ts`),
তাই প্রথমে সেই পোর্টে Go backend চালান।

## প্রোডাকশনের জন্য Frontend বিল্ড করা

```bash
cd web
npm run build
```

বিল্ডের ফলাফল `web/dist/`-এ যায়, এবং Go backend (`cmd/server/main.go`) ইতিমধ্যে এই ফোল্ডারটিকে
static file হিসেবে স্বয়ংক্রিয়ভাবে সার্ভ করার জন্য কনফিগার করা আছে — তাই বিল্ডের পরে, শুধু Go
বাইনারি চালালেই হবে, প্রোডাকশন সার্ভারে Node.js প্রয়োজন নেই।

## Frontend-এর গঠন

```
web/src/
  App.vue                    # ড্যাশবোর্ড লেআউট + ট্যাব নেভিগেশন
  main.ts                    # এন্ট্রিপয়েন্ট
  style.css                  # ডিজাইন টোকেন (ডার্ক থিম)
  types/api.ts                # API রেসপন্সের টাইপ
  composables/api.ts          # সমস্ত backend endpoint-এর জন্য axios ক্লায়েন্ট
  composables/usePolling.ts   # প্রতি কয়েক সেকেন্ডে স্বয়ংক্রিয়ভাবে ডেটা রিফ্রেশ (ট্যাব hidden হলে বিরতি)
  components/
    ServiceStatusCard.vue     # অবস্থা + start/stop/restart/reload বাটন
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # clients/servers/stats/databases ট্যাব (পুনঃব্যবহারযোগ্য)
    ConfigEditorCard.vue       # প্রতিটি ডেটাবেসের pool_mode পরিবর্তন + গ্লোবাল সেটিং
    DataTable.vue              # SHOW কমান্ডের ফলাফলের জন্য সাধারণ টেবিল
```

## PgBouncer প্রস্তুতি

1. নিশ্চিত করুন `pgbouncer.ini`-এ একটি admin ইউজার আছে:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. সেই admin ইউজারের credentials `userlist.txt`-এ যোগ করুন।
3. নিশ্চিত করুন admin পোর্ট (সাধারণত pgbouncer পোর্টের মতোই, ডিফল্ট 6432) এই Go সার্ভিস যে হোস্টে
   চলছে সেখান থেকে অ্যাক্সেসযোগ্য।

## sudoers সেটআপ (সার্ভিস start/stop/restart করার জন্য)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # সিনট্যাক্স যাচাই করুন
```

এই ফাইলে `appuser`-কে সেই ইউজারের নামে পরিবর্তন করুন যে এই Go বাইনারি চালায়। এই ৪টি কমান্ডের
চেয়ে বেশি ব্যাপক sudo অ্যাক্সেস **দেবেন না**।

## Environment variables

| ভেরিয়েবল | ডিফল্ট | বিবরণ |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer হোস্ট |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer পোর্ট |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | `admin_users`-এ নিবন্ধিত ইউজার |
| `PGB_ADMIN_PASS` | - | admin ইউজারের পাসওয়ার্ড |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | কনফিগ ফাইলের পাথ |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | userlist ফাইলের পাথ |
| `PGB_SERVICE_NAME` | `pgbouncer` | systemd ইউনিটের নাম |
| `PGB_LISTEN_ADDR` | `:8088` | ওয়েব সার্ভারের listen ঠিকানা |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | UI-এর জন্য basic auth (localhost-এর বাইরে ব্যবহারের আগে **অবশ্যই** পূরণ করতে হবে) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | অ্যাপ/কোম্পানির নাম সংরক্ষণের পাথ (Branding মেনু থেকে সেট করা হয়) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | Branding মেনু থেকে আপলোড করা কাস্টম লোগো সংরক্ষণের পাথ |

## চালানো

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## প্রধান Endpoint

- `GET /api/status` — systemd সার্ভিসের অবস্থা (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — runtime SET (সীমিত, `SHOW CONFIG` দেখুন)
- `GET /api/config-edit/raw` — পুরো ini ফাইলের বিষয়বস্তু sections হিসেবে পড়া
- `POST /api/config-edit/database-field` `{"database","field","value"}` — ini এডিট + স্বয়ংক্রিয় RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — ini এডিট + স্বয়ংক্রিয় RELOAD
- `GET /api/branding` `/api/branding/logo` — অ্যাপের পরিচয় ও লোগো (পাবলিক, লগইনের আগেও পড়া যায়)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — শুধুমাত্র admin
- `POST /api/branding/logo` (multipart `logo`, সর্বোচ্চ 2MB) `/ DELETE /api/branding/logo` — শুধুমাত্র admin

## অ্যাপের পরিচয় কাস্টমাইজ করা (Branding)

**Branding** মেনু (শুধুমাত্র admin-এর জন্য) দিয়ে আপনি অ্যাপের নাম, সাবটাইটেল, ফুটারে প্রদর্শিত
কোম্পানি/organization-এর নাম, এবং লোগো (ডিফল্ট ◈ আইকনের পরিবর্তে) পরিবর্তন করতে পারেন — এগুলো
sidebar, লগইন পেজ, এবং ব্রাউজার ট্যাবে প্রদর্শিত হয়। এই সব সেটিং `PGB_BRANDING_FILE`/`PGB_LOGO_FILE`-এ
সংরক্ষিত হয় এবং `/app/data` ফোল্ডার volume হিসেবে মাউন্ট থাকা পর্যন্ত container রিস্টার্ট হলেও
টিকে থাকে।

## Docker দিয়ে চালানো (PgBouncer আলাদা সার্ভারে)

যেহেতু আপনার PgBouncer অন্য একটি সার্ভারে চলছে, start/stop/restart নিয়ন্ত্রণ **SSH**-এর মাধ্যমে
করা হয়, container-এর ভেতরে লোকাল `systemctl` দিয়ে নয় (container অন্য হোস্টের systemd-এ
অ্যাক্সেস পায় না)। admin console সংযোগ (`SHOW POOLS` ইত্যাদি) স্বাভাবিকভাবে কাজ করতে থাকে কারণ
এটি শুধু PgBouncer পোর্টে একটি সাধারণ TCP সংযোগ — container বা সার্ভারের অবস্থান দ্বারা প্রভাবিত
হয় না।

### ১. PgBouncer সার্ভার প্রস্তুত করুন (রিমোট)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

এরপর যে মেশিনে আপনি `docker compose build` চালাবেন সেখানে একটি SSH key তৈরি করুন, এবং public
key-টি PgBouncer সার্ভারে ইনস্টল করুন:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<pgbouncer-সার্ভারের-IP>
```

এছাড়াও নিশ্চিত করুন PgBouncer admin পোর্ট (ডিফল্ট `6432`) সেই নেটওয়ার্ক থেকে অ্যাক্সেসযোগ্য
যেখানে `pgbouncer-manager` container চলছে।

### ২. কনফিগারেশন

```bash
cp .env.example .env
# .env এডিট করুন: PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS ইত্যাদি পূরণ করুন
```

### ৩. বিল্ড ও চালানো

```bash
docker compose up -d --build
```

অ্যাপটি `http://<এই-হোস্ট>:8088`-এ উপলব্ধ হবে, সম্পূর্ণ ড্যাশবোর্ড সহ (status, pools, clients,
stats, SSH-এর মাধ্যমে start/stop/restart, কনফিগ reload)।

### গুরুত্বপূর্ণ নোট

- **"Configuration" ট্যাব** (pool_mode পরিবর্তন) `PGB_CONTROL_MODE=ssh` হলে স্বয়ংক্রিয়ভাবে
  disable হয়ে যায়, কারণ সেই endpoint লোকাল ফাইলসিস্টেমে `pgbouncer.ini` এডিট করে। SSH মোডে,
  সরাসরি PgBouncer সার্ভারে `pgbouncer.ini` এডিট করুন (ম্যানুয়ালি অথবা আপনার নিজস্ব Ansible/script
  দিয়ে), তারপর Overview ট্যাবে **Reload Config** বাটনে ক্লিক করুন — এটি তখনও কাজ করবে কারণ
  `RELOAD` PgBouncer admin console-এর মাধ্যমে পাঠানো হয়, ফাইলসিস্টেমের মাধ্যমে নয়।
- `./secrets/pgb_ssh_key`-এর প্রাইভেট কী একটি Docker secret হিসেবে মাউন্ট করা হয় (container-এর
  ভেতরে read-only, image-এ কখনো বেক হয় না)। `secrets/` ফোল্ডার কখনো git-এ commit করবেন না।
- প্রোডাকশন নিরাপত্তার জন্য, `handlers.NewAPI`-তে `knownHostsPath` (বর্তমানে `""` = host key
  যাচাইকরণ এড়িয়ে যায়) একটি `known_hosts` ফাইল পাথ দিয়ে সেট করুন যাতে PgBouncer সার্ভারের
  fingerprint থাকে, যাতে MITM আক্রমণ থেকে সুরক্ষা পাওয়া যায়।
- যদি কখনো PgBouncer-কে manager-এর মতো একই হোস্টে সরানো হয়, তাহলে শুধু `PGB_CONTROL_MODE=local`
  সেট করুন এবং সরাসরি সেই হোস্টে বাইনারি চালান (container-এ নয়) যাতে লোকাল systemd অ্যাক্সেস করা
  যায় — উপরের "sudoers সেটআপ" সেকশন দেখুন।

- সবসময় এটি VPN/TLS সহ reverse proxy-এর পেছনে চালান, সরাসরি ইন্টারনেটে expose করবেন না।
- `PGB_UI_USER`/`PGB_UI_PASS` হলো অ্যাপের সামনে শুধুমাত্র একটি ন্যূনতম সুরক্ষা স্তর। লগইন নিজেই
  ইতিমধ্যে session-based auth এবং role (admin বনাম viewer, **Users** মেনু দেখুন) ব্যবহার করে —
  প্রথমবার deploy করার পরপরই ডিফল্ট `admin` অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করতে ভুলবেন না।
- প্রতিবার `pgbouncer.ini`-তে লেখার আগে স্বয়ংক্রিয়ভাবে একটি `.bak` ফাইল তৈরি হয়।
