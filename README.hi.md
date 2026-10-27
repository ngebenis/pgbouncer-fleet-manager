# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[इंडोनेशियाई पाक-कला और संस्कृति गैलरी देखें →](CULTURE.md)**

PgBouncer की निगरानी और नियंत्रण के लिए एक हल्का वेब GUI: pools/clients/servers/stats की
स्थिति देखना, सर्विस को start/stop/restart करना, config reload करना, पॉज़/रिज़्यूम करना, और
हर डेटाबेस के लिए pool_mode बदलना।

## स्क्रीनशॉट

| लॉगिन | Dashboard | Pools |
|---|---|---|
| ![लॉगिन](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Clients | Servers | Stats |
|---|---|---|
| ![Clients](docs/screenshots/03-clients.png) | ![Servers](docs/screenshots/04-servers.png) | ![Stats](docs/screenshots/05-stats.png) |

| Databases | कॉन्फ़िगरेशन | सर्वर प्रबंधित करें |
|---|---|---|
| ![Databases](docs/screenshots/06-databases.png) | ![कॉन्फ़िगरेशन](docs/screenshots/07-configuration.png) | ![सर्वर प्रबंधित करें](docs/screenshots/08-manage-servers.png) |

| उपयोगकर्ता | Audit Log | बैकअप और रीस्टोर |
|---|---|---|
| ![उपयोगकर्ता](docs/screenshots/09-users.png) | ![Audit Log](docs/screenshots/10-audit-log.png) | ![बैकअप और रीस्टोर](docs/screenshots/11-backup-restore.png) |

| पहचान |
|---|
| ![पहचान](docs/screenshots/12-identity.png) |

## स्टैक
- बैकएंड: Go + Gin + pgx (Postgres प्रोटोकॉल के ज़रिए सीधे PgBouncer admin console से कनेक्ट होता है)
- फ्रंटएंड: Vue 3 + TypeScript + Vite (पहले से `web/` फ़ोल्डर में मौजूद है)

## फ्रंटएंड चलाना (डेवलपमेंट)

```bash
cd web
npm install
npm run dev
```

Vite dev server `/api/*` को `http://localhost:8088` पर proxy करेगा (देखें `web/vite.config.ts`),
इसलिए पहले Go बैकएंड को उसी पोर्ट पर चलाएं।

## प्रोडक्शन के लिए फ्रंटएंड बिल्ड करना

```bash
cd web
npm run build
```

बिल्ड आउटपुट `web/dist/` में जाता है, और Go बैकएंड (`cmd/server/main.go`) पहले से ही इस
फ़ोल्डर को static file के रूप में अपने आप serve करने के लिए कॉन्फ़िगर है — इसलिए बिल्ड के बाद,
बस Go बाइनरी चलाना काफी है, प्रोडक्शन सर्वर पर Node.js की ज़रूरत नहीं।

## फ्रंटएंड की संरचना

```
web/src/
  App.vue                    # डैशबोर्ड लेआउट + टैब नेविगेशन
  main.ts                    # एंट्रीपॉइंट
  style.css                  # डिज़ाइन टोकन (डार्क थीम)
  types/api.ts                # API रिस्पॉन्स के टाइप्स
  composables/api.ts          # सभी बैकएंड endpoints के लिए axios क्लाइंट
  composables/usePolling.ts   # हर कुछ सेकंड में डेटा ऑटो-रिफ्रेश (टैब hidden होने पर पॉज़)
  components/
    ServiceStatusCard.vue     # स्थिति + start/stop/restart/reload बटन
    PoolsCard.vue              # SHOW POOLS + पॉज़/रिज़्यूम
    ReadOnlyCard.vue           # clients/servers/stats/databases टैब (reusable)
    ConfigEditorCard.vue       # हर डेटाबेस का pool_mode बदलना + ग्लोबल सेटिंग
    DataTable.vue              # SHOW कमांड के नतीजों के लिए सामान्य टेबल
```

## PgBouncer की तैयारी

1. सुनिश्चित करें कि `pgbouncer.ini` में एक admin user मौजूद हो:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. उस admin user की credentials को `userlist.txt` में जोड़ें।
3. सुनिश्चित करें कि admin पोर्ट (आमतौर पर pgbouncer पोर्ट जैसा ही, डिफ़ॉल्ट 6432) उस host से
   पहुँचा जा सके जहाँ यह Go सर्विस चल रही है।

## sudoers सेटअप (सर्विस start/stop/restart करने के लिए)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # syntax वैलिडेट करें
```

उस फ़ाइल में `appuser` को उस यूज़र के नाम से बदलें जो यह Go बाइनरी चलाता है। उन 4 कमांड्स से
ज़्यादा **कोई भी** व्यापक sudo access न दें।

## Environment variables

| वेरिएबल | डिफ़ॉल्ट | विवरण |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer होस्ट |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer पोर्ट |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | `admin_users` में रजिस्टर्ड यूज़र |
| `PGB_ADMIN_PASS` | - | admin user का पासवर्ड |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | config की पाथ |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | userlist की पाथ |
| `PGB_SERVICE_NAME` | `pgbouncer` | systemd यूनिट का नाम |
| `PGB_LISTEN_ADDR` | `:8088` | वेब सर्वर का listen पता |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | UI के लिए basic auth (localhost के बाहर इस्तेमाल से पहले **ज़रूरी**) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | ऐप/कंपनी का नाम सेव करने की पाथ (Branding मेनू से सेट होता है) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | Branding मेनू से अपलोड किए गए कस्टम लोगो की पाथ |

## चलाना

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## मुख्य Endpoints

- `GET /api/status` — systemd सर्विस की स्थिति (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — runtime SET (सीमित, `SHOW CONFIG` देखें)
- `GET /api/config-edit/raw` — पूरी ini फ़ाइल को sections के रूप में पढ़ना
- `POST /api/config-edit/database-field` `{"database","field","value"}` — ini एडिट + ऑटो RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — ini एडिट + ऑटो RELOAD
- `GET /api/branding` `/api/branding/logo` — ऐप की पहचान और लोगो (पब्लिक, लॉगिन से पहले भी पढ़ा जा सकता है)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — केवल admin
- `POST /api/branding/logo` (multipart `logo`, अधिकतम 2MB) `/ DELETE /api/branding/logo` — केवल admin

## ऐप की पहचान कस्टमाइज़ करना (Branding)

**Branding** मेनू (केवल admin के लिए) से आप ऐप का नाम, सबटाइटल, फुटर में दिखने वाला
कंपनी/organization का नाम, और लोगो (डिफ़ॉल्ट ◈ आइकन की जगह) बदल सकते हैं — ये sidebar,
लॉगिन पेज, और ब्राउज़र टैब में दिखते हैं। ये सभी सेटिंग्स `PGB_BRANDING_FILE`/`PGB_LOGO_FILE`
में सेव होती हैं और जब तक `/app/data` फ़ोल्डर volume के रूप में माउंट है, तब तक container
रीस्टार्ट होने पर भी बनी रहती हैं।

## Docker के साथ चलाना (PgBouncer अलग सर्वर पर)

चूँकि आपका PgBouncer किसी दूसरे सर्वर पर चल रहा है, start/stop/restart कंट्रोल **SSH** के
ज़रिए होता है, container के अंदर लोकल `systemctl` से नहीं (container के पास दूसरे होस्ट के
systemd तक पहुँच नहीं होती)। admin console कनेक्शन (`SHOW POOLS` वगैरह) सामान्य रूप से काम
करते रहते हैं क्योंकि वह सिर्फ PgBouncer पोर्ट से एक सामान्य TCP कनेक्शन है — container या
सर्वर की लोकेशन से इसका कोई लेना-देना नहीं।

### 1. PgBouncer सर्वर तैयार करें (रिमोट)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

फिर उस मशीन पर SSH key जनरेट करें जहाँ आप `docker compose build` चलाएंगे, और public key को
PgBouncer सर्वर पर इंस्टॉल करें:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<pgbouncer-server-ip>
```

यह भी सुनिश्चित करें कि PgBouncer admin पोर्ट (डिफ़ॉल्ट `6432`) उस नेटवर्क से पहुँचा जा सके
जहाँ `pgbouncer-manager` container चल रहा है।

### 2. कॉन्फ़िगरेशन

```bash
cp .env.example .env
# .env एडिट करें: PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS वगैरह भरें
```

### 3. बिल्ड करें और चलाएं

```bash
docker compose up -d --build
```

ऐप `http://<this-host>:8088` पर उपलब्ध होगा, पूरे डैशबोर्ड के साथ (status, pools, clients,
stats, SSH के ज़रिए start/stop/restart, config reload)।

### ज़रूरी नोट्स

- **"Configuration" टैब** (pool_mode बदलना) `PGB_CONTROL_MODE=ssh` होने पर अपने आप disable
  हो जाता है, क्योंकि वह endpoint लोकल फ़ाइलसिस्टम पर `pgbouncer.ini` एडिट करता है। SSH मोड
  में, `pgbouncer.ini` को सीधे PgBouncer सर्वर पर एडिट करें (मैन्युअली या अपने Ansible/script
  से), फिर Overview टैब में **Reload Config** बटन पर क्लिक करें — यह अब भी काम करेगा क्योंकि
  `RELOAD` PgBouncer admin console के ज़रिए भेजा जाता है, फ़ाइलसिस्टम से नहीं।
- `./secrets/pgb_ssh_key` में मौजूद private key को Docker secret के रूप में माउंट किया जाता है
  (container के अंदर read-only, image में बेक नहीं होता)। `secrets/` फ़ोल्डर को git में कभी
  commit न करें।
- प्रोडक्शन सुरक्षा के लिए, `handlers.NewAPI` में `knownHostsPath` (अभी `""` = host key
  verification skip) को ऐसे `known_hosts` फ़ाइल पाथ से सेट करें जिसमें PgBouncer सर्वर की
  fingerprint हो, ताकि MITM हमलों से सुरक्षा मिल सके।
- अगर कभी PgBouncer को manager वाले ही host पर ले जाया जाए, तो बस `PGB_CONTROL_MODE=local`
  सेट करें और बाइनरी को सीधे उस host पर चलाएं (container में नहीं) ताकि लोकल systemd तक पहुँच
  मिल सके — ऊपर "sudoers सेटअप" सेक्शन देखें।

- हमेशा इसे VPN/TLS वाले reverse proxy के पीछे चलाएं, सीधे इंटरनेट पर expose न करें।
- `PGB_UI_USER`/`PGB_UI_PASS` ऐप के सामने सिर्फ एक न्यूनतम सुरक्षा परत है। लॉगिन खुद ही
  session-based auth और roles (admin बनाम viewer, देखें **Users** मेनू) इस्तेमाल करता है —
  सुनिश्चित करें कि पहली बार deploy करने के तुरंत बाद डिफ़ॉल्ट `admin` अकाउंट का पासवर्ड बदल दिया जाए।
- हर बार `pgbouncer.ini` में लिखने से पहले अपने आप एक `.bak` फ़ाइल बनाई जाती है।

## दान करें

☕ *मुझे एक कप कॉफ़ी पिलाएं*

PayPal: **b3n1_id@yahoo.com** (benisantoso72@gmail.com)
