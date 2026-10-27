# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Nederlands](README.nl.md)*

🍲 **[Entdecke die indonesische Kulinarik- & Kulturgalerie →](CULTURE.md)**

Eine schlanke Web-GUI zur Überwachung und Steuerung von PgBouncer: Status von
Pools/Clients/Servern/Statistiken, Starten/Stoppen/Neustarten des Dienstes, Konfiguration neu
laden, Pausieren/Fortsetzen und Ändern des pool_mode pro Datenbank.

## Screenshots

| Anmeldung | Dashboard | Pools |
|---|---|---|
| ![Anmeldung](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Clients | Server | Statistiken |
|---|---|---|
| ![Clients](docs/screenshots/03-clients.png) | ![Server](docs/screenshots/04-servers.png) | ![Statistiken](docs/screenshots/05-stats.png) |

| Datenbanken | Konfiguration | Server verwalten |
|---|---|---|
| ![Datenbanken](docs/screenshots/06-databases.png) | ![Konfiguration](docs/screenshots/07-configuration.png) | ![Server verwalten](docs/screenshots/08-manage-servers.png) |

| Benutzer | Audit-Log | Sicherung & Wiederherstellung |
|---|---|---|
| ![Benutzer](docs/screenshots/09-users.png) | ![Audit-Log](docs/screenshots/10-audit-log.png) | ![Sicherung & Wiederherstellung](docs/screenshots/11-backup-restore.png) |

| Identität |
|---|
| ![Identität](docs/screenshots/12-identity.png) |

## Stack
- Backend: Go + Gin + pgx (verbindet sich direkt über das Postgres-Protokoll mit der PgBouncer-Admin-Konsole)
- Frontend: Vue 3 + TypeScript + Vite (bereits im Ordner `web/` vorhanden)

## Frontend ausführen (Entwicklung)

```bash
cd web
npm install
npm run dev
```

Der Vite-Dev-Server leitet `/api/*` an `http://localhost:8088` weiter (siehe
`web/vite.config.ts`), führe also zuerst das Go-Backend auf diesem Port aus.

## Frontend für die Produktion bauen

```bash
cd web
npm run build
```

Das Build-Ergebnis landet in `web/dist/`, und das Go-Backend (`cmd/server/main.go`) ist bereits
so konfiguriert, dass es diesen Ordner automatisch als statische Dateien ausliefert — nach dem
Build genügt es also, die Go-Binärdatei auszuführen, Node.js wird in der Produktion nicht
benötigt.

## Frontend-Struktur

```
web/src/
  App.vue                    # Dashboard-Layout + Tab-Navigation
  main.ts                    # Einstiegspunkt
  style.css                  # Design-Tokens (dunkles Theme)
  types/api.ts                # Typen der API-Antworten
  composables/api.ts          # axios-Client für alle Backend-Endpunkte
  composables/usePolling.ts   # aktualisiert Daten automatisch alle paar Sekunden (pausiert bei ausgeblendetem Tab)
  components/
    ServiceStatusCard.vue     # Status + start/stop/restart/reload-Schaltflächen
    PoolsCard.vue              # SHOW POOLS + pausieren/fortsetzen
    ReadOnlyCard.vue           # Tabs clients/servers/stats/databases (wiederverwendbar)
    ConfigEditorCard.vue       # pool_mode pro Datenbank ändern + globale Einstellungen
    DataTable.vue              # generische Tabelle für die Ergebnisse von SHOW-Befehlen
```

## PgBouncer-Voraussetzungen

1. Stelle sicher, dass in `pgbouncer.ini` ein Admin-Benutzer existiert:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Füge die Zugangsdaten dieses Admin-Benutzers zu `userlist.txt` hinzu.
3. Stelle sicher, dass der Admin-Port (in der Regel derselbe wie der pgbouncer-Port, Standard
   6432) vom Host aus erreichbar ist, auf dem dieser Go-Dienst läuft.

## Sudoers-Einrichtung (für start/stop/restart des Dienstes)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # Syntax prüfen
```

Passe `appuser` in dieser Datei an den Benutzer an, der diese Go-Binärdatei ausführt. Gewähre
KEINEN sudo-Zugriff, der über diese 4 Befehlszeilen hinausgeht.

## Umgebungsvariablen

| Variable | Standard | Beschreibung |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer-Host |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer-Port |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | in `admin_users` registrierter Benutzer |
| `PGB_ADMIN_PASS` | - | Passwort des Admin-Benutzers |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | Pfad zur Konfigurationsdatei |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | Pfad zur userlist-Datei |
| `PGB_SERVICE_NAME` | `pgbouncer` | Name der systemd-Unit |
| `PGB_LISTEN_ADDR` | `:8088` | Listen-Adresse des Webservers |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | Basic Auth für die UI (vor Nutzung außerhalb von localhost **PFLICHT**) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | Speicherpfad für App-/Firmennamen (über das Branding-Menü eingestellt) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | Speicherpfad für das über das Branding-Menü hochgeladene Logo |

## Ausführen

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Wichtigste Endpunkte

- `GET /api/status` — Status des systemd-Dienstes (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — Laufzeit-SET (eingeschränkt, siehe `SHOW CONFIG`)
- `GET /api/config-edit/raw` — liest den gesamten Inhalt der ini-Datei als Sections
- `POST /api/config-edit/database-field` `{"database","field","value"}` — bearbeitet die ini + automatisches RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — bearbeitet die ini + automatisches RELOAD
- `GET /api/branding` `/api/branding/logo` — App-Identität und Logo (öffentlich, vor dem Login lesbar)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — nur Admin
- `POST /api/branding/logo` (multipart `logo`, max. 2MB) `/ DELETE /api/branding/logo` — nur Admin

## App-Identität anpassen (Branding)

Im **Branding**-Menü (nur Admin) können der App-Name, der Untertitel, der im Footer angezeigte
Firmen-/Organisationsname sowie das Logo (ersetzt das Standard-◈-Icon) geändert werden — diese
werden in der Seitenleiste, auf der Login-Seite und im Browser-Tab angezeigt. Alle diese
Einstellungen werden in `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` gespeichert und bleiben nach einem
Container-Neustart erhalten, solange der Ordner `/app/data` als Volume gemountet ist.

## Ausführen mit Docker (PgBouncer auf separatem Server)

Da dein PgBouncer auf einem anderen Server läuft, erfolgt die start/stop/restart-Steuerung über
**SSH**, nicht über lokales `systemctl` im Container (der Container hat keinen Zugriff auf das
systemd eines anderen Hosts). Admin-Konsolen-Verbindungen (`SHOW POOLS` usw.) funktionieren
weiterhin normal, da es sich lediglich um eine gewöhnliche TCP-Verbindung zum PgBouncer-Port
handelt — unabhängig vom Container oder dem Serverstandort.

### 1. PgBouncer-Server vorbereiten (remote)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Generiere dann einen SSH-Schlüssel auf der Maschine, auf der du `docker compose build`
ausführst, und installiere den öffentlichen Schlüssel auf dem PgBouncer-Server:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-des-pgbouncer-servers>
```

Stelle außerdem sicher, dass der Admin-Port von PgBouncer (Standard `6432`) aus dem Netzwerk
erreichbar ist, in dem der Container `pgbouncer-manager` läuft.

### 2. Konfiguration

```bash
cp .env.example .env
# .env bearbeiten: PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS usw. eintragen
```

### 3. Bauen und ausführen

```bash
docker compose up -d --build
```

Die App ist unter `http://<dieser-host>:8088` mit dem vollständigen Dashboard verfügbar
(status, pools, clients, stats, start/stop/restart via SSH, Konfiguration neu laden).

### Wichtige Hinweise

- Der **Tab "Configuration"** (pool_mode ändern) wird automatisch deaktiviert, wenn
  `PGB_CONTROL_MODE=ssh` gesetzt ist, da dieser Endpunkt `pgbouncer.ini` im lokalen Dateisystem
  bearbeitet. Im SSH-Modus bearbeite `pgbouncer.ini` direkt auf dem PgBouncer-Server (manuell
  oder über dein eigenes Ansible/Skript) und klicke dann im Overview-Tab auf
  **Reload Config** — das funktioniert weiterhin, da `RELOAD` über die PgBouncer-Admin-Konsole
  gesendet wird, nicht über das Dateisystem.
- Der private Schlüssel in `./secrets/pgb_ssh_key` wird als Docker-Secret gemountet (nur lesbar
  im Container, wird nie ins Image eingebacken). Committe den Ordner `secrets/` niemals in git.
- Für die Sicherheit in der Produktion setze `knownHostsPath` in `handlers.NewAPI` (aktuell
  `""` = Überspringen der Host-Key-Verifizierung) auf den Pfad einer `known_hosts`-Datei, die
  den Fingerprint des PgBouncer-Servers enthält, um dich vor MITM-Angriffen zu schützen.
- Falls PgBouncer irgendwann auf denselben Host wie der Manager verschoben wird, setze einfach
  `PGB_CONTROL_MODE=local` und führe die Binärdatei direkt auf diesem Host aus (nicht im
  Container), um auf das lokale systemd zugreifen zu können — siehe Abschnitt
  "Sudoers-Einrichtung" oben.

- Führe dies immer hinter einem VPN/Reverse-Proxy mit TLS aus, exponiere es niemals direkt im
  Internet.
- `PGB_UI_USER`/`PGB_UI_PASS` ist nur eine minimale Schutzebene vor der App. Der Login selbst
  nutzt bereits sitzungsbasierte Authentifizierung mit Rollen (Admin vs. Viewer, siehe
  **Users**-Menü) — stelle sicher, dass du das Passwort des Standard-`admin`-Kontos sofort nach
  dem ersten Deployment änderst.
- Vor jedem Schreibvorgang in `pgbouncer.ini` wird automatisch eine `.bak`-Datei erstellt.
