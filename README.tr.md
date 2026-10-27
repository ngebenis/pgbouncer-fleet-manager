# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[Endonezya Mutfak ve Kültür Galerisi'ni Keşfedin →](CULTURE.md)**

PgBouncer'ı izlemek ve kontrol etmek için hafif bir web arayüzü: pools/clients/servers/stats
durumu, servisi başlatma/durdurma/yeniden başlatma, yapılandırmayı yeniden yükleme, duraklat/
devam ettir ve veritabanı başına pool_mode değiştirme.

## Ekran Görüntüleri

| Giriş | Dashboard | Pools |
|---|---|---|
| ![Giriş](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| İstemciler | Sunucular | İstatistikler |
|---|---|---|
| ![İstemciler](docs/screenshots/03-clients.png) | ![Sunucular](docs/screenshots/04-servers.png) | ![İstatistikler](docs/screenshots/05-stats.png) |

| Veritabanları | Yapılandırma | Sunucuları Yönet |
|---|---|---|
| ![Veritabanları](docs/screenshots/06-databases.png) | ![Yapılandırma](docs/screenshots/07-configuration.png) | ![Sunucuları Yönet](docs/screenshots/08-manage-servers.png) |

| Kullanıcılar | Denetim Günlüğü | Yedekleme ve Geri Yükleme |
|---|---|---|
| ![Kullanıcılar](docs/screenshots/09-users.png) | ![Denetim Günlüğü](docs/screenshots/10-audit-log.png) | ![Yedekleme ve Geri Yükleme](docs/screenshots/11-backup-restore.png) |

| Kimlik |
|---|
| ![Kimlik](docs/screenshots/12-identity.png) |

## Teknoloji Yığını
- Backend: Go + Gin + pgx (Postgres protokolü üzerinden doğrudan PgBouncer yönetim konsoluna bağlanır)
- Frontend: Vue 3 + TypeScript + Vite (`web/` klasöründe zaten mevcut)

## Frontend'i çalıştırma (geliştirme)

```bash
cd web
npm install
npm run dev
```

Vite geliştirme sunucusu `/api/*` isteklerini `http://localhost:8088` adresine yönlendirir
(bkz. `web/vite.config.ts`), bu yüzden önce Go backend'ini o portta çalıştırın.

## Frontend'i production için derleme

```bash
cd web
npm run build
```

Derleme çıktısı `web/dist/` içine gider ve Go backend'i (`cmd/server/main.go`) bu klasörü otomatik
olarak statik dosya olarak sunacak şekilde zaten yapılandırılmıştır — bu yüzden derlemeden sonra
sadece Go binary'sini çalıştırmak yeterlidir, production sunucusunda Node.js'e gerek yoktur.

## Frontend yapısı

```
web/src/
  App.vue                    # dashboard düzeni + sekme navigasyonu
  main.ts                    # giriş noktası
  style.css                  # tasarım token'ları (koyu tema)
  types/api.ts                # API yanıt tipleri
  composables/api.ts          # tüm backend endpoint'leri için axios istemcisi
  composables/usePolling.ts   # verileri birkaç saniyede bir otomatik yeniler (sekme gizliyken duraklar)
  components/
    ServiceStatusCard.vue     # durum + start/stop/restart/reload butonları
    PoolsCard.vue              # SHOW POOLS + duraklat/devam ettir
    ReadOnlyCard.vue           # clients/servers/stats/databases sekmeleri (yeniden kullanılabilir)
    ConfigEditorCard.vue       # veritabanı başına pool_mode değiştirme + genel ayarlar
    DataTable.vue              # SHOW komut sonuçları için genel tablo
```

## PgBouncer ön koşulları

1. `pgbouncer.ini` içinde bir admin kullanıcısının yapılandırıldığından emin olun:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Bu admin kullanıcısının kimlik bilgilerini `userlist.txt` dosyasına ekleyin.
3. Admin portunun (genellikle pgbouncer portuyla aynı, varsayılan 6432) bu Go servisinin
   çalıştığı host'tan erişilebilir olduğundan emin olun.

## sudoers kurulumu (servisi start/stop/restart için)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # söz dizimini doğrula
```

Bu dosyadaki `appuser`'ı bu Go binary'sini çalıştıran kullanıcıyla eşleşecek şekilde düzenleyin.
Bu 4 komut satırından daha geniş sudo erişimi VERMEYİN.

## Ortam değişkenleri

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer host'u |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer portu |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | `admin_users`'da kayıtlı kullanıcı |
| `PGB_ADMIN_PASS` | - | admin kullanıcısının şifresi |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | yapılandırma dosyasının yolu |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | userlist dosyasının yolu |
| `PGB_SERVICE_NAME` | `pgbouncer` | systemd unit adı |
| `PGB_LISTEN_ADDR` | `:8088` | web sunucusunun dinleme adresi |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | arayüz için temel kimlik doğrulama (localhost dışında kullanmadan önce **ZORUNLU**) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | uygulama/şirket adının saklandığı yol (Branding menüsünden ayarlanır) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | Branding menüsünden yüklenen özel logonun saklandığı yol |

## Çalıştırma

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Ana endpoint'ler

- `GET /api/status` — systemd servis durumu (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — çalışma zamanı SET (sınırlı, `SHOW CONFIG`'e bakın)
- `GET /api/config-edit/raw` — tüm ini dosyası içeriğini bölümler halinde okur
- `POST /api/config-edit/database-field` `{"database","field","value"}` — ini'yi düzenler + otomatik RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — ini'yi düzenler + otomatik RELOAD
- `GET /api/branding` `/api/branding/logo` — uygulama kimliği ve logo (herkese açık, girişten önce okunabilir)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — yalnızca admin
- `POST /api/branding/logo` (multipart `logo`, maks. 2MB) `/ DELETE /api/branding/logo` — yalnızca admin

## Uygulama Kimliğini Özelleştirme (Branding)

**Branding** menüsü (yalnızca admin) uygulama adını, alt başlığı, footer'da görünen şirket/
kuruluş adını ve logoyu (varsayılan ◈ simgesinin yerine) değiştirmenize olanak tanır — bunlar
kenar çubuğunda, giriş sayfasında ve tarayıcı sekmesinde görünür. Tüm bu ayarlar
`PGB_BRANDING_FILE`/`PGB_LOGO_FILE` içinde saklanır ve `/app/data` klasörü bir volume olarak
bağlı olduğu sürece container yeniden başlatmalarında korunur.

## Docker ile Çalıştırma (PgBouncer ayrı bir sunucuda)

PgBouncer'ınız başka bir sunucuda çalıştığından, start/stop/restart kontrolü container içindeki
yerel `systemctl` yerine **SSH** üzerinden yapılır (container'ın başka bir host'un systemd'sine
erişimi yoktur). Yönetim konsolu bağlantıları (`SHOW POOLS` vb.) normal şekilde çalışmaya devam
eder, çünkü bu sadece PgBouncer portuna yapılan sıradan bir TCP bağlantısıdır — container veya
sunucu konumundan etkilenmez.

### 1. PgBouncer sunucusunu hazırlama (uzak)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Ardından `docker compose build` komutunu çalıştıracağınız makinede bir SSH anahtarı oluşturun ve
genel anahtarı PgBouncer sunucusuna yükleyin:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<pgbouncer-sunucu-ip>
```

Ayrıca PgBouncer admin portunun (varsayılan `6432`) `pgbouncer-manager` container'ının çalıştığı
ağdan erişilebilir olduğundan emin olun.

### 2. Yapılandırma

```bash
cp .env.example .env
# .env dosyasını düzenleyin: PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS vb. doldurun
```

### 3. Derleme ve çalıştırma

```bash
docker compose up -d --build
```

Uygulama `http://<bu-host>:8088` adresinde, tam dashboard ile (status, pools, clients, stats,
SSH üzerinden start/stop/restart, yapılandırma yeniden yükleme) kullanılabilir olacaktır.

### Önemli notlar

- **"Configuration" sekmesi** (pool_mode değiştirme), `PGB_CONTROL_MODE=ssh` olduğunda otomatik
  olarak devre dışı bırakılır, çünkü bu endpoint yerel dosya sisteminde `pgbouncer.ini`'yi
  düzenler. SSH modunda, `pgbouncer.ini`'yi doğrudan PgBouncer sunucusunda düzenleyin (manuel
  olarak veya kendi Ansible/script'inizle), ardından Overview sekmesindeki **Reload Config**
  düğmesine tıklayın — bu hâlâ çalışır çünkü `RELOAD`, dosya sistemi yerine PgBouncer yönetim
  konsolu üzerinden gönderilir.
- `./secrets/pgb_ssh_key` içindeki özel anahtar bir Docker secret olarak bağlanır (container
  içinde salt okunur, asla image içine gömülmez). `secrets/` klasörünü asla git'e commit etmeyin.
- Production güvenliği için, `handlers.NewAPI` içindeki `knownHostsPath`'i (şu anda `""` = host
  key doğrulamasını atla) PgBouncer sunucusunun parmak izini içeren bir `known_hosts` dosya yolu
  ile ayarlayın, böylece MITM saldırılarına karşı korunursunuz.
- PgBouncer bir gün manager ile aynı host'a taşınırsa, sadece `PGB_CONTROL_MODE=local` ayarlayın
  ve binary'yi doğrudan o host'ta (container içinde değil) çalıştırarak yerel systemd'ye erişin —
  yukarıdaki "sudoers kurulumu" bölümüne bakın.

- Bunu her zaman TLS'li bir VPN/reverse proxy arkasında çalıştırın, asla doğrudan internete açık
  bırakmayın.
- `PGB_UI_USER`/`PGB_UI_PASS` uygulamanın önünde yalnızca minimal bir koruma katmanıdır. Girişin
  kendisi zaten rollerle (admin vs. viewer, **Users** menüsüne bakın) oturum tabanlı kimlik
  doğrulama kullanır — ilk dağıtımdan hemen sonra varsayılan `admin` hesabının şifresini
  değiştirdiğinizden emin olun.
- Her `pgbouncer.ini` yazma işleminden önce otomatik olarak bir `.bak` dosyası oluşturulur.
