# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md)*

🍲 **[Ontdek de Indonesische Culinaire & Cultuurgalerij →](CULTURE.md)**

Een lichtgewicht web-GUI voor het monitoren en beheren van PgBouncer: status van
pools/clients/servers/stats, de service starten/stoppen/herstarten, configuratie herladen,
pauzeren/hervatten, en pool_mode per database wijzigen.

## Schermafbeeldingen

| Inloggen | Dashboard | Pools |
|---|---|---|
| ![Inloggen](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Clients | Servers | Statistieken |
|---|---|---|
| ![Clients](docs/screenshots/03-clients.png) | ![Servers](docs/screenshots/04-servers.png) | ![Statistieken](docs/screenshots/05-stats.png) |

| Databases | Configuratie | Servers Beheren |
|---|---|---|
| ![Databases](docs/screenshots/06-databases.png) | ![Configuratie](docs/screenshots/07-configuration.png) | ![Servers Beheren](docs/screenshots/08-manage-servers.png) |

| Gebruikers | Auditlogboek | Back-up & Herstel |
|---|---|---|
| ![Gebruikers](docs/screenshots/09-users.png) | ![Auditlogboek](docs/screenshots/10-audit-log.png) | ![Back-up & Herstel](docs/screenshots/11-backup-restore.png) |

| Identiteit |
|---|
| ![Identiteit](docs/screenshots/12-identity.png) |

## Stack
- Backend: Go + Gin + pgx (maakt rechtstreeks verbinding met de PgBouncer-adminconsole via het Postgres-protocol)
- Frontend: Vue 3 + TypeScript + Vite (al aanwezig in de map `web/`)

## Frontend starten (ontwikkeling)

```bash
cd web
npm install
npm run dev
```

De Vite-ontwikkelserver proxyt `/api/*` naar `http://localhost:8088` (zie `web/vite.config.ts`),
start dus eerst de Go-backend op die poort.

## Frontend bouwen voor productie

```bash
cd web
npm run build
```

Het buildresultaat komt in `web/dist/` terecht, en de Go-backend (`cmd/server/main.go`) is al
geconfigureerd om deze map automatisch als statische bestanden te serveren — na het bouwen hoef
je dus alleen de Go-binary uit te voeren, Node.js is niet nodig in productie.

## Structuur van de frontend

```
web/src/
  App.vue                    # dashboardlayout + tabnavigatie
  main.ts                    # startpunt
  style.css                  # design tokens (donker thema)
  types/api.ts                # types van API-responses
  composables/api.ts          # axios-client voor alle backend-endpoints
  composables/usePolling.ts   # ververst data automatisch elke paar seconden (gepauzeerd als tab verborgen is)
  components/
    ServiceStatusCard.vue     # status + start/stop/restart/reload-knoppen
    PoolsCard.vue              # SHOW POOLS + pauzeren/hervatten
    ReadOnlyCard.vue           # tabs clients/servers/stats/databases (herbruikbaar)
    ConfigEditorCard.vue       # pool_mode per database wijzigen + algemene instellingen
    DataTable.vue              # generieke tabel voor resultaten van SHOW-commando's
```

## PgBouncer-vereisten

1. Zorg dat er een admin-gebruiker is ingesteld in `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Voeg de inloggegevens van deze admin-gebruiker toe aan `userlist.txt`.
3. Zorg dat de adminpoort (meestal dezelfde als de pgbouncer-poort, standaard 6432) bereikbaar
   is vanaf de host waarop deze Go-service draait.

## Sudoers instellen (voor start/stop/restart van de service)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # syntax valideren
```

Pas `appuser` in dat bestand aan naar de gebruiker die deze Go-binary uitvoert. Geef GEEN
bredere sudo-toegang dan deze 4 commandoregels.

## Omgevingsvariabelen

| Variabele | Standaard | Beschrijving |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer-host |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer-poort |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | gebruiker geregistreerd in `admin_users` |
| `PGB_ADMIN_PASS` | - | wachtwoord van de admin-gebruiker |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | pad naar het configuratiebestand |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | pad naar het userlist-bestand |
| `PGB_SERVICE_NAME` | `pgbouncer` | naam van de systemd-unit |
| `PGB_LISTEN_ADDR` | `:8088` | listen-adres van de webserver |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | basisauthenticatie voor de UI (**VERPLICHT** in te stellen vóór gebruik buiten localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | opslagpad voor app-/bedrijfsnaam (ingesteld via het Branding-menu) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | opslagpad voor het aangepaste logo dat via het Branding-menu is geüpload |

## Uitvoeren

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Belangrijkste endpoints

- `GET /api/status` — status van de systemd-service (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — runtime SET (beperkt, zie `SHOW CONFIG`)
- `GET /api/config-edit/raw` — leest de volledige inhoud van het ini-bestand als secties
- `POST /api/config-edit/database-field` `{"database","field","value"}` — bewerkt de ini + automatische RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — bewerkt de ini + automatische RELOAD
- `GET /api/branding` `/api/branding/logo` — app-identiteit en logo (openbaar, leesbaar vóór inloggen)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — alleen admin
- `POST /api/branding/logo` (multipart `logo`, max. 2MB) `/ DELETE /api/branding/logo` — alleen admin

## App-identiteit aanpassen (Branding)

Via het **Branding**-menu (alleen admin) kun je de appnaam, ondertitel, bedrijfs-/organisatienaam
die in de footer wordt getoond, en het logo (vervangt het standaard ◈-icoon) wijzigen — deze
worden getoond in de zijbalk, inlogpagina en browsertab. Al deze instellingen worden opgeslagen in
`PGB_BRANDING_FILE`/`PGB_LOGO_FILE` en blijven behouden na het herstarten van de container, zolang
de map `/app/data` als volume is gekoppeld.

## Uitvoeren met Docker (PgBouncer op een aparte server)

Omdat je PgBouncer op een andere server draait, verloopt de start/stop/restart-besturing via
**SSH**, niet via lokale `systemctl` binnen de container (de container heeft geen toegang tot
systemd van een andere host). Verbindingen met de adminconsole (`SHOW POOLS`, enz.) blijven
gewoon werken, omdat dit slechts een normale TCP-verbinding is met de PgBouncer-poort — dit wordt
niet beïnvloed door de container of de locatie van de server.

### 1. PgBouncer-server voorbereiden (remote)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Genereer vervolgens een SSH-sleutel op de machine waar je `docker compose build` zult uitvoeren,
en installeer de publieke sleutel op de PgBouncer-server:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-van-pgbouncer-server>
```

Zorg er ook voor dat de adminpoort van PgBouncer (standaard `6432`) bereikbaar is vanuit het
netwerk waarin de container `pgbouncer-manager` draait.

### 2. Configuratie

```bash
cp .env.example .env
# bewerk .env: vul PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS, enz. in
```

### 3. Bouwen en uitvoeren

```bash
docker compose up -d --build
```

De app is beschikbaar op `http://<deze-host>:8088`, met het volledige dashboard (status, pools,
clients, stats, start/stop/restart via SSH, configuratie herladen).

### Belangrijke opmerkingen

- Het **tabblad "Configuration"** (pool_mode wijzigen) wordt automatisch uitgeschakeld wanneer
  `PGB_CONTROL_MODE=ssh`, omdat dat endpoint `pgbouncer.ini` op het lokale bestandssysteem
  bewerkt. Bewerk in SSH-modus `pgbouncer.ini` rechtstreeks op de PgBouncer-server (handmatig of
  via je eigen Ansible/script), en klik vervolgens op **Reload Config** in het tabblad Overview —
  dit blijft werken omdat `RELOAD` via de PgBouncer-adminconsole wordt verzonden, niet via het
  bestandssysteem.
- De privésleutel in `./secrets/pgb_ssh_key` wordt gemount als een Docker-secret (alleen-lezen
  binnen de container, nooit ingebakken in de image). Commit de map `secrets/` nooit naar git.
- Voor productiebeveiliging stel je `knownHostsPath` in `handlers.NewAPI` in (momenteel `""` =
  verificatie van host key overslaan) met het pad naar een `known_hosts`-bestand dat de
  fingerprint van de PgBouncer-server bevat, ter bescherming tegen MITM-aanvallen.
- Als PgBouncer ooit wordt verplaatst naar dezelfde host als de manager, stel dan gewoon
  `PGB_CONTROL_MODE=local` in en voer de binary rechtstreeks op die host uit (niet in een
  container) om toegang te krijgen tot de lokale systemd — zie de sectie "Sudoers instellen"
  hierboven.

- Voer dit altijd uit achter een VPN/reverse proxy met TLS, stel het nooit rechtstreeks bloot
  aan het internet.
- `PGB_UI_USER`/`PGB_UI_PASS` is slechts een minimale beschermingslaag vóór de app. Het inloggen
  zelf gebruikt al sessiegebaseerde authenticatie met rollen (admin vs. viewer, zie het
  **Users**-menu) — zorg ervoor dat je het wachtwoord van het standaard `admin`-account meteen na
  de eerste deployment wijzigt.
- Er wordt automatisch een `.bak`-bestand aangemaakt vóór elke schrijfactie naar
  `pgbouncer.ini`.

## Doneren

☕ *Trakteer me op een kopje koffie*

PayPal: **b3n1_id@yahoo.com** (benisantoso72@gmail.com)
