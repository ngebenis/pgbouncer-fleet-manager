# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

Un'interfaccia web leggera per monitorare e controllare PgBouncer: stato di pools/clients/servers/
stats, avvio/arresto/riavvio del servizio, ricarica della configurazione, pausa/ripresa, e
modifica del pool_mode per database.

## Screenshot

| Accesso | Dashboard | Pools |
|---|---|---|
| ![Accesso](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Client | Server | Statistiche |
|---|---|---|
| ![Client](docs/screenshots/03-clients.png) | ![Server](docs/screenshots/04-servers.png) | ![Statistiche](docs/screenshots/05-stats.png) |

| Database | Configurazione | Gestisci Server |
|---|---|---|
| ![Database](docs/screenshots/06-databases.png) | ![Configurazione](docs/screenshots/07-configuration.png) | ![Gestisci Server](docs/screenshots/08-manage-servers.png) |

| Utenti | Registro di Controllo | Backup e Ripristino |
|---|---|---|
| ![Utenti](docs/screenshots/09-users.png) | ![Registro di Controllo](docs/screenshots/10-audit-log.png) | ![Backup e Ripristino](docs/screenshots/11-backup-restore.png) |

| Identità |
|---|
| ![Identità](docs/screenshots/12-identity.png) |

## Stack
- Backend: Go + Gin + pgx (si connette direttamente alla console di amministrazione di PgBouncer tramite il protocollo Postgres)
- Frontend: Vue 3 + TypeScript + Vite (già presente nella cartella `web/`)

## Avviare il frontend (sviluppo)

```bash
cd web
npm install
npm run dev
```

Il server di sviluppo Vite reindirizza `/api/*` a `http://localhost:8088` (vedi
`web/vite.config.ts`), quindi avvia prima il backend Go su quella porta.

## Compilare il frontend per la produzione

```bash
cd web
npm run build
```

Il risultato della build viene generato in `web/dist/`, e il backend Go (`cmd/server/main.go`)
è già configurato per servire automaticamente questa cartella come file statici — dopo la build
basta quindi eseguire il binario Go, senza bisogno di Node.js in produzione.

## Struttura del frontend

```
web/src/
  App.vue                    # layout della dashboard + navigazione a schede
  main.ts                    # punto di ingresso
  style.css                  # token di design (tema scuro)
  types/api.ts                # tipi delle risposte API
  composables/api.ts          # client axios per tutti gli endpoint del backend
  composables/usePolling.ts   # aggiorna automaticamente i dati ogni pochi secondi (in pausa quando la scheda è nascosta)
  components/
    ServiceStatusCard.vue     # stato + pulsanti start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + pausa/ripresa
    ReadOnlyCard.vue           # schede clients/servers/stats/databases (riutilizzabile)
    ConfigEditorCard.vue       # modifica del pool_mode per database + impostazioni globali
    DataTable.vue              # tabella generica per i risultati dei comandi SHOW
```

## Prerequisiti di PgBouncer

1. Assicurati che esista un utente admin in `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Aggiungi le credenziali di questo utente admin a `userlist.txt`.
3. Assicurati che la porta admin (di solito la stessa di pgbouncer, predefinita 6432) sia
   raggiungibile dall'host su cui è in esecuzione questo servizio Go.

## Configurazione di sudoers (per start/stop/restart del servizio)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # convalida la sintassi
```

Modifica `appuser` in quel file per farlo corrispondere all'utente che esegue questo binario Go.
NON concedere accesso sudo più ampio di queste 4 righe di comando.

## Variabili d'ambiente

| Variabile | Predefinito | Descrizione |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | host di PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | porta di PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | utente registrato in `admin_users` |
| `PGB_ADMIN_PASS` | - | password dell'utente admin |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | percorso del file di configurazione |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | percorso del file userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | nome dell'unità systemd |
| `PGB_LISTEN_ADDR` | `:8088` | indirizzo di ascolto del web server |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | autenticazione di base per l'interfaccia (**OBBLIGATORIO** prima dell'uso fuori da localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | percorso di salvataggio del nome dell'app/azienda (impostato dal menu Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | percorso di salvataggio del logo personalizzato caricato dal menu Branding |

## Esecuzione

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Endpoint principali

- `GET /api/status` — stato del servizio systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — SET a runtime (limitato, controlla `SHOW CONFIG`)
- `GET /api/config-edit/raw` — legge l'intero contenuto del file ini come sezioni
- `POST /api/config-edit/database-field` `{"database","field","value"}` — modifica l'ini + RELOAD automatico
- `POST /api/config-edit/global-field` `{"field","value"}` — modifica l'ini + RELOAD automatico
- `GET /api/branding` `/api/branding/logo` — identità dell'app e logo (pubblico, leggibile prima del login)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — solo admin
- `POST /api/branding/logo` (multipart `logo`, max 2MB) `/ DELETE /api/branding/logo` — solo admin

## Personalizzare l'identità dell'app (Branding)

Il menu **Branding** (solo admin) consente di modificare il nome dell'app, il sottotitolo, il
nome dell'azienda/organizzazione mostrato nel footer, e il logo (in sostituzione dell'icona ◈
predefinita) — questi vengono mostrati nella barra laterale, nella pagina di login e nella scheda
del browser. Tutte queste impostazioni vengono salvate in `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` e
persistono dopo il riavvio del container, purché la cartella `/app/data` sia montata come volume.

## Esecuzione con Docker (PgBouncer su un server separato)

Poiché il tuo PgBouncer è in esecuzione su un altro server, il controllo start/stop/restart
avviene tramite **SSH**, non tramite `systemctl` locale all'interno del container (il container
non ha accesso al systemd di un altro host). Le connessioni alla console di amministrazione
(`SHOW POOLS`, ecc.) continuano a funzionare normalmente perché si tratta solo di una normale
connessione TCP alla porta di PgBouncer — non è influenzata dal container o dalla posizione del
server.

### 1. Preparare il server PgBouncer (remoto)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Quindi genera una chiave SSH sulla macchina in cui eseguirai `docker compose build`, e installa
la chiave pubblica sul server PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-server-pgbouncer>
```

Assicurati anche che la porta admin di PgBouncer (predefinita `6432`) sia raggiungibile dalla
rete in cui è in esecuzione il container `pgbouncer-manager`.

### 2. Configurazione

```bash
cp .env.example .env
# modifica .env: inserisci PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS, ecc.
```

### 3. Compilazione ed esecuzione

```bash
docker compose up -d --build
```

L'app sarà disponibile su `http://<questo-host>:8088`, con la dashboard completa (status, pools,
clients, stats, start/stop/restart via SSH, ricarica della configurazione).

### Note importanti

- La **scheda "Configuration"** (modifica del pool_mode) viene disattivata automaticamente quando
  `PGB_CONTROL_MODE=ssh`, perché quell'endpoint modifica `pgbouncer.ini` sul filesystem locale.
  In modalità SSH, modifica `pgbouncer.ini` direttamente sul server PgBouncer (manualmente o
  tramite il tuo script/Ansible), quindi clicca su **Reload Config** nella scheda Overview —
  questo continua a funzionare perché `RELOAD` viene inviato tramite la console di
  amministrazione di PgBouncer, non tramite il filesystem.
- La chiave privata in `./secrets/pgb_ssh_key` viene montata come segreto Docker (sola lettura
  all'interno del container, mai inclusa nell'immagine). Non effettuare mai il commit della
  cartella `secrets/` su git.
- Per la sicurezza in produzione, imposta `knownHostsPath` in `handlers.NewAPI` (attualmente
  `""` = salta la verifica della host key) con il percorso di un file `known_hosts` contenente
  l'impronta digitale del server PgBouncer, per proteggerti dagli attacchi MITM.
- Se in futuro PgBouncer viene spostato sullo stesso host del manager, basta impostare
  `PGB_CONTROL_MODE=local` ed eseguire il binario direttamente su quell'host (non in un
  container) per poter accedere al systemd locale — vedi la sezione "Configurazione di sudoers"
  sopra.

- Esegui sempre questo dietro una VPN/reverse proxy con TLS, non esporlo mai direttamente a
  internet.
- `PGB_UI_USER`/`PGB_UI_PASS` è solo un livello minimo di protezione davanti all'app. Il login
  stesso utilizza già un'autenticazione basata su sessione con ruoli (admin vs. viewer, vedi il
  menu **Users**) — assicurati di cambiare la password dell'account `admin` predefinito subito
  dopo il primo deployment.
- Viene creato automaticamente un file `.bak` prima di ogni scrittura in `pgbouncer.ini`.
