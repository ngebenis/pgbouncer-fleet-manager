# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[இந்தோனேசிய உணவு & கலாச்சார கேலரியை ஆராயுங்கள் →](CULTURE.md)**

PgBouncer-ஐ கண்காணிக்கவும் கட்டுப்படுத்தவும் ஒரு இலகுவான வெப் GUI: pools/clients/servers/stats
நிலையைக் காண்பது, சேவையை start/stop/restart செய்வது, கட்டமைப்பை reload செய்வது, pause/resume
செய்வது, மற்றும் ஒவ்வொரு தரவுத்தளத்திற்கும் pool_mode-ஐ மாற்றுவது.

## ஸ்கிரீன்ஷாட்கள்

| உள்நுழைய | Dashboard | Pools |
|---|---|---|
| ![உள்நுழைய](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| கிளையண்ட்கள் | சேவையகங்கள் | புள்ளிவிவரங்கள் |
|---|---|---|
| ![கிளையண்ட்கள்](docs/screenshots/03-clients.png) | ![சேவையகங்கள்](docs/screenshots/04-servers.png) | ![புள்ளிவிவரங்கள்](docs/screenshots/05-stats.png) |

| தரவுத்தளங்கள் | கட்டமைப்பு | சேவையகங்களை நிர்வகிக்கவும் |
|---|---|---|
| ![தரவுத்தளங்கள்](docs/screenshots/06-databases.png) | ![கட்டமைப்பு](docs/screenshots/07-configuration.png) | ![சேவையகங்களை நிர்வகிக்கவும்](docs/screenshots/08-manage-servers.png) |

| பயனர்கள் | தணிக்கை பதிவு | காப்பு & மீட்டமைப்பு |
|---|---|---|
| ![பயனர்கள்](docs/screenshots/09-users.png) | ![தணிக்கை பதிவு](docs/screenshots/10-audit-log.png) | ![காப்பு & மீட்டமைப்பு](docs/screenshots/11-backup-restore.png) |

| அடையாளம் |
|---|
| ![அடையாளம்](docs/screenshots/12-identity.png) |

## தொழில்நுட்ப அடுக்கு
- Backend: Go + Gin + pgx (Postgres நெறிமுறை வழியாக நேரடியாக PgBouncer நிர்வாக கன்சோலுடன் இணைகிறது)
- Frontend: Vue 3 + TypeScript + Vite (`web/` கோப்புறையில் ஏற்கனவே உள்ளது)

## Frontend-ஐ இயக்குதல் (மேம்பாட்டு சூழல்)

```bash
cd web
npm install
npm run dev
```

Vite dev server `/api/*`-ஐ `http://localhost:8088`-க்கு proxy செய்யும் (`web/vite.config.ts`
பார்க்கவும்), எனவே முதலில் Go backend-ஐ அந்த port-இல் இயக்கவும்.

## Production-க்காக Frontend-ஐ build செய்தல்

```bash
cd web
npm run build
```

build முடிவு `web/dist/`-இல் சேமிக்கப்படும், மேலும் Go backend (`cmd/server/main.go`) ஏற்கனவே
இந்த கோப்புறையை static file ஆக தானாகவே வழங்க கட்டமைக்கப்பட்டுள்ளது — எனவே build செய்தபின்,
Go binary-ஐ மட்டும் இயக்கினால் போதும், production சேவையகத்தில் Node.js தேவையில்லை.

## Frontend அமைப்பு

```
web/src/
  App.vue                    # dashboard தளவமைப்பு + tab navigation
  main.ts                    # நுழைவு புள்ளி
  style.css                  # வடிவமைப்பு tokens (இருண்ட தீம்)
  types/api.ts                # API பதில் வகைகள்
  composables/api.ts          # எல்லா backend endpoint-களுக்கான axios client
  composables/usePolling.ts   # ஒவ்வொரு சில வினாடிகளுக்கும் தரவை தானாக புதுப்பிக்கும் (tab மறைந்தால் நிறுத்தும்)
  components/
    ServiceStatusCard.vue     # நிலை + start/stop/restart/reload பொத்தான்கள்
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # clients/servers/stats/databases tabs (மறுபயன்பாடு செய்யக்கூடியது)
    ConfigEditorCard.vue       # ஒவ்வொரு தரவுத்தளத்திற்கும் pool_mode மாற்றம் + உலகளாவிய அமைப்புகள்
    DataTable.vue              # SHOW கட்டளை முடிவுகளுக்கான பொதுவான அட்டவணை
```

## PgBouncer முன்னுதவைகள்

1. `pgbouncer.ini`-இல் ஒரு admin பயனர் அமைக்கப்பட்டுள்ளதை உறுதிப்படுத்தவும்:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. அந்த admin பயனரின் அடையாளச் சான்றுகளை `userlist.txt`-இல் சேர்க்கவும்.
3. admin port (பொதுவாக pgbouncer port-ஐப் போலவே, இயல்புநிலை 6432) இந்த Go சேவை இயங்கும்
   host-இலிருந்து அணுகக்கூடியதாக இருப்பதை உறுதிப்படுத்தவும்.

## sudoers அமைப்பு (சேவையை start/stop/restart செய்ய)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # தொடரியலை சரிபார்க்கவும்
```

இந்த கோப்பில் உள்ள `appuser`-ஐ இந்த Go binary-ஐ இயக்கும் பயனருக்கு ஏற்றவாறு திருத்தவும். இந்த
4 கட்டளை வரிகளை விட அதிக sudo அணுகலை **வழங்க வேண்டாம்**.

## சூழல் மாறிகள்

| மாறி | இயல்புநிலை | விளக்கம் |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer host |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer port |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | `admin_users`-இல் பதிவுசெய்யப்பட்ட பயனர் |
| `PGB_ADMIN_PASS` | - | admin பயனரின் கடவுச்சொல் |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | கட்டமைப்பு கோப்பின் பாதை |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | userlist கோப்பின் பாதை |
| `PGB_SERVICE_NAME` | `pgbouncer` | systemd unit பெயர் |
| `PGB_LISTEN_ADDR` | `:8088` | வெப் சேவையகம் கேட்கும் முகவரி |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | UI-க்கான அடிப்படை அங்கீகாரம் (localhost-க்கு வெளியே பயன்படுத்தும் முன் **கட்டாயம்**) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | பயன்பாடு/நிறுவனப் பெயரை சேமிக்கும் பாதை (Branding மெனு வழியாக அமைக்கப்படும்) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | Branding மெனு வழியாக பதிவேற்றப்பட்ட தனிப்பயன் லோகோவை சேமிக்கும் பாதை |

## இயக்குதல்

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## முக்கிய Endpoint-கள்

- `GET /api/status` — systemd சேவை நிலை (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — இயக்க நேர SET (வரம்புக்குட்பட்டது, `SHOW CONFIG`-ஐ பார்க்கவும்)
- `GET /api/config-edit/raw` — முழு ini கோப்பு உள்ளடக்கத்தையும் sections ஆக படிக்கிறது
- `POST /api/config-edit/database-field` `{"database","field","value"}` — ini-ஐ திருத்துகிறது + தானியங்கி RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — ini-ஐ திருத்துகிறது + தானியங்கி RELOAD
- `GET /api/branding` `/api/branding/logo` — பயன்பாட்டின் அடையாளம் மற்றும் லோகோ (பொது, login-க்கு முன்பும் படிக்கலாம்)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — admin மட்டும்
- `POST /api/branding/logo` (multipart `logo`, அதிகபட்சம் 2MB) `/ DELETE /api/branding/logo` — admin மட்டும்

## பயன்பாட்டின் அடையாளத்தை தனிப்பயனாக்குதல் (Branding)

**Branding** மெனு (admin மட்டும்) மூலம் பயன்பாட்டின் பெயர், துணைத் தலைப்பு, footer-இல் காட்டப்படும்
நிறுவனம்/அமைப்பு பெயர், மற்றும் லோகோவை (இயல்புநிலை ◈ ஐகானுக்கு பதிலாக) மாற்றலாம் — இவை sidebar,
login பக்கம், மற்றும் உலாவி tab-இல் காட்டப்படும். இந்த அமைப்புகள் அனைத்தும்
`PGB_BRANDING_FILE`/`PGB_LOGO_FILE`-இல் சேமிக்கப்படும், மேலும் `/app/data` கோப்புறை volume ஆக
mount செய்யப்பட்டிருக்கும் வரை container மறுதொடக்கத்தின் பிறகும் நீடிக்கும்.

## Docker மூலம் இயக்குதல் (PgBouncer தனி சேவையகத்தில்)

உங்கள் PgBouncer வேறொரு சேவையகத்தில் இயங்குவதால், start/stop/restart கட்டுப்பாடு container-க்குள்
உள்ள local `systemctl`-ஆக இல்லாமல் **SSH** வழியாக செய்யப்படுகிறது (container-க்கு மற்றொரு
host-இன் systemd-ஐ அணுக முடியாது). நிர்வாக கன்சோல் இணைப்புகள் (`SHOW POOLS` போன்றவை) இயல்பாக
தொடர்ந்து செயல்படும், ஏனெனில் இது PgBouncer port-க்கான ஒரு சாதாரண TCP இணைப்பு மட்டுமே —
container அல்லது சேவையக இருப்பிடத்தால் பாதிக்கப்படாது.

### 1. PgBouncer சேவையகத்தை தயார்படுத்துதல் (தொலைநிலை)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

பின்னர் நீங்கள் `docker compose build` இயக்கும் இயந்திரத்தில் ஒரு SSH key-ஐ உருவாக்கி, public
key-ஐ PgBouncer சேவையகத்தில் நிறுவவும்:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<pgbouncer-சேவையக-ip>
```

PgBouncer admin port (இயல்புநிலை `6432`) `pgbouncer-manager` container இயங்கும் நெட்வொர்க்கிலிருந்து
அணுகக்கூடியதாக இருப்பதையும் உறுதிப்படுத்தவும்.

### 2. கட்டமைப்பு

```bash
cp .env.example .env
# .env-ஐ திருத்தவும்: PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS போன்றவற்றை நிரப்பவும்
```

### 3. Build செய்து இயக்குதல்

```bash
docker compose up -d --build
```

பயன்பாடு `http://<இந்த-host>:8088`-இல் முழு dashboard-உடன் (status, pools, clients, stats,
SSH வழியாக start/stop/restart, கட்டமைப்பு reload) கிடைக்கும்.

### முக்கிய குறிப்புகள்

- **"Configuration" tab** (pool_mode மாற்றம்) `PGB_CONTROL_MODE=ssh` எனும்போது தானாகவே
  முடக்கப்படும், ஏனெனில் அந்த endpoint local கோப்பு அமைப்பில் `pgbouncer.ini`-ஐ திருத்துகிறது.
  SSH முறையில், `pgbouncer.ini`-ஐ நேரடியாக PgBouncer சேவையகத்தில் திருத்தவும் (கைமுறையாக அல்லது
  உங்கள் சொந்த Ansible/script மூலம்), பின்னர் Overview tab-இல் **Reload Config** பொத்தானை
  கிளிக் செய்யவும் — இது தொடர்ந்து செயல்படும், ஏனெனில் `RELOAD` கோப்பு அமைப்பு வழியாக அல்ல,
  PgBouncer நிர்வாக கன்சோல் வழியாக அனுப்பப்படுகிறது.
- `./secrets/pgb_ssh_key`-இல் உள்ள தனிப்பட்ட key ஒரு Docker secret ஆக mount செய்யப்படுகிறது
  (container-க்குள் படிக்க மட்டும், ஒருபோதும் image-இல் சேர்க்கப்படாது). `secrets/` கோப்புறையை
  ஒருபோதும் git-இல் commit செய்ய வேண்டாம்.
- production பாதுகாப்பிற்காக, `handlers.NewAPI`-இல் உள்ள `knownHostsPath`-ஐ (தற்போது `""` =
  host key சரிபார்ப்பை தவிர்க்கும்) PgBouncer சேவையகத்தின் fingerprint உள்ள `known_hosts` கோப்பு
  பாதையுடன் அமைக்கவும், இது MITM தாக்குதல்களிலிருந்து பாதுகாக்க உதவும்.
- எப்போதாவது PgBouncer, manager உள்ள அதே host-க்கு மாற்றப்பட்டால், `PGB_CONTROL_MODE=local`-ஐ
  அமைத்து, local systemd-ஐ அணுக binary-ஐ நேரடியாக அந்த host-இல் (container-இல் அல்ல) இயக்கவும்
  — மேலே உள்ள "sudoers அமைப்பு" பிரிவைப் பார்க்கவும்.

- இதை எப்போதும் TLS உடன் VPN/reverse proxy-க்குப் பின்னால் இயக்கவும், இணையத்தில் நேரடியாக
  வெளிப்படுத்த வேண்டாம்.
- `PGB_UI_USER`/`PGB_UI_PASS` பயன்பாட்டின் முன் ஒரு குறைந்தபட்ச பாதுகாப்பு அடுக்கு மட்டுமே.
  login தானே ஏற்கனவே பங்குகளுடன் (admin vs. viewer, **Users** மெனுவைப் பார்க்கவும்)
  session-அடிப்படையிலான அங்கீகாரத்தைப் பயன்படுத்துகிறது — முதல் deploy-க்குப் பிறகு உடனடியாக
  இயல்புநிலை `admin` கணக்கின் கடவுச்சொல்லை மாற்றுவதை உறுதிப்படுத்தவும்.
- `pgbouncer.ini`-இல் எழுதும் ஒவ்வொரு முறையும் முன்பு `.bak` கோப்பு தானாகவே உருவாக்கப்படும்.
