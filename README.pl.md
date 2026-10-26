# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

Lekki interfejs webowy do monitorowania i sterowania PgBouncer: stan pools/clients/servers/stats,
uruchamianie/zatrzymywanie/restartowanie usługi, przeładowanie konfiguracji, wstrzymanie/
wznowienie oraz zmiana pool_mode dla każdej bazy danych.

## Zrzuty ekranu

| Logowanie | Dashboard | Pools |
|---|---|---|
| ![Logowanie](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Klienci | Serwery | Statystyki |
|---|---|---|
| ![Klienci](docs/screenshots/03-clients.png) | ![Serwery](docs/screenshots/04-servers.png) | ![Statystyki](docs/screenshots/05-stats.png) |

| Bazy danych | Konfiguracja | Zarządzaj Serwerami |
|---|---|---|
| ![Bazy danych](docs/screenshots/06-databases.png) | ![Konfiguracja](docs/screenshots/07-configuration.png) | ![Zarządzaj Serwerami](docs/screenshots/08-manage-servers.png) |

| Użytkownicy | Dziennik Audytu | Kopia Zapasowa i Przywracanie |
|---|---|---|
| ![Użytkownicy](docs/screenshots/09-users.png) | ![Dziennik Audytu](docs/screenshots/10-audit-log.png) | ![Kopia Zapasowa i Przywracanie](docs/screenshots/11-backup-restore.png) |

| Tożsamość |
|---|
| ![Tożsamość](docs/screenshots/12-identity.png) |

## Stos technologiczny
- Backend: Go + Gin + pgx (łączy się bezpośrednio z konsolą administracyjną PgBouncer przez protokół Postgres)
- Frontend: Vue 3 + TypeScript + Vite (już dostępny w folderze `web/`)

## Uruchamianie frontendu (środowisko deweloperskie)

```bash
cd web
npm install
npm run dev
```

Serwer deweloperski Vite przekierowuje `/api/*` na `http://localhost:8088` (zobacz
`web/vite.config.ts`), więc najpierw uruchom backend Go na tym porcie.

## Budowanie frontendu na produkcję

```bash
cd web
npm run build
```

Wynik budowania trafia do `web/dist/`, a backend Go (`cmd/server/main.go`) jest już skonfigurowany
tak, aby automatycznie serwować ten folder jako pliki statyczne — po zbudowaniu wystarczy więc
uruchomić binarkę Go, bez potrzeby instalowania Node.js na serwerze produkcyjnym.

## Struktura frontendu

```
web/src/
  App.vue                    # układ dashboardu + nawigacja zakładkami
  main.ts                    # punkt wejścia
  style.css                  # tokeny designu (ciemny motyw)
  types/api.ts                # typy odpowiedzi API
  composables/api.ts          # klient axios dla wszystkich endpointów backendu
  composables/usePolling.ts   # automatyczne odświeżanie danych co kilka sekund (wstrzymywane, gdy karta jest ukryta)
  components/
    ServiceStatusCard.vue     # status + przyciski start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + wstrzymanie/wznowienie
    ReadOnlyCard.vue           # zakładki clients/servers/stats/databases (wielokrotnego użytku)
    ConfigEditorCard.vue       # zmiana pool_mode dla każdej bazy danych + ustawienia globalne
    DataTable.vue              # ogólna tabela dla wyników poleceń SHOW
```

## Wymagania wstępne PgBouncer

1. Upewnij się, że w `pgbouncer.ini` istnieje użytkownik admin:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Dodaj dane uwierzytelniające tego użytkownika admin do `userlist.txt`.
3. Upewnij się, że port admin (zwykle taki sam jak port pgbouncer, domyślnie 6432) jest dostępny
   z hosta, na którym działa ta usługa Go.

## Konfiguracja sudoers (do start/stop/restart usługi)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # sprawdzenie poprawności składni
```

Edytuj `appuser` w tym pliku, aby pasował do użytkownika uruchamiającego tę binarkę Go. NIE
przyznawaj szerszego dostępu sudo niż te 4 linie poleceń.

## Zmienne środowiskowe

| Zmienna | Domyślna | Opis |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | host PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | port PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | użytkownik zarejestrowany w `admin_users` |
| `PGB_ADMIN_PASS` | - | hasło użytkownika admin |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | ścieżka pliku konfiguracyjnego |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | ścieżka pliku userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | nazwa jednostki systemd |
| `PGB_LISTEN_ADDR` | `:8088` | adres nasłuchu serwera webowego |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | uwierzytelnianie podstawowe dla interfejsu (**WYMAGANE** przed użyciem poza localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | ścieżka przechowywania nazwy aplikacji/firmy (ustawiana w menu Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | ścieżka przechowywania niestandardowego logo przesłanego przez menu Branding |

## Uruchamianie

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Główne endpointy

- `GET /api/status` — status usługi systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — SET w czasie działania (ograniczone, sprawdź `SHOW CONFIG`)
- `GET /api/config-edit/raw` — odczytuje całą zawartość pliku ini jako sekcje
- `POST /api/config-edit/database-field` `{"database","field","value"}` — edytuje ini + automatyczny RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — edytuje ini + automatyczny RELOAD
- `GET /api/branding` `/api/branding/logo` — tożsamość aplikacji i logo (publiczne, odczytywane przed zalogowaniem)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — tylko admin
- `POST /api/branding/logo` (multipart `logo`, maks. 2MB) `/ DELETE /api/branding/logo` — tylko admin

## Dostosowywanie tożsamości aplikacji (Branding)

Menu **Branding** (tylko admin) pozwala zmienić nazwę aplikacji, podtytuł, nazwę firmy/organizacji
wyświetlaną w stopce oraz logo (zastępujące domyślną ikonę ◈) — są one widoczne w pasku bocznym,
na stronie logowania i w karcie przeglądarki. Wszystkie te ustawienia są zapisywane w
`PGB_BRANDING_FILE`/`PGB_LOGO_FILE` i zachowywane po restarcie kontenera, o ile folder
`/app/data` jest zamontowany jako wolumen.

## Uruchamianie w Dockerze (PgBouncer na osobnym serwerze)

Ponieważ Twój PgBouncer działa na innym serwerze, sterowanie start/stop/restart odbywa się przez
**SSH**, a nie przez lokalny `systemctl` wewnątrz kontenera (kontener nie ma dostępu do systemd
innego hosta). Połączenia z konsolą administracyjną (`SHOW POOLS` itp.) nadal działają normalnie,
ponieważ jest to zwykłe połączenie TCP do portu PgBouncer — nie ma na nie wpływu kontener ani
lokalizacja serwera.

### 1. Przygotowanie serwera PgBouncer (zdalnego)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Następnie wygeneruj klucz SSH na maszynie, na której uruchomisz `docker compose build`, i
zainstaluj klucz publiczny na serwerze PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-serwera-pgbouncer>
```

Upewnij się również, że port admin PgBouncer (domyślnie `6432`) jest dostępny z sieci, w której
działa kontener `pgbouncer-manager`.

### 2. Konfiguracja

```bash
cp .env.example .env
# edytuj .env: wypełnij PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS itd.
```

### 3. Budowanie i uruchamianie

```bash
docker compose up -d --build
```

Aplikacja będzie dostępna pod adresem `http://<ten-host>:8088`, z pełnym dashboardem (status,
pools, clients, stats, start/stop/restart przez SSH, przeładowanie konfiguracji).

### Ważne uwagi

- **Zakładka "Configuration"** (zmiana pool_mode) jest automatycznie wyłączana, gdy
  `PGB_CONTROL_MODE=ssh`, ponieważ ten endpoint edytuje `pgbouncer.ini` w lokalnym systemie
  plików. W trybie SSH edytuj `pgbouncer.ini` bezpośrednio na serwerze PgBouncer (ręcznie lub za
  pomocą własnego Ansible/skryptu), a następnie kliknij **Reload Config** w zakładce Overview —
  to nadal działa, ponieważ `RELOAD` jest wysyłane przez konsolę administracyjną PgBouncer, a nie
  przez system plików.
- Klucz prywatny w `./secrets/pgb_ssh_key` jest montowany jako sekret Dockera (tylko do odczytu
  wewnątrz kontenera, nigdy nie jest wbudowywany w obraz). Nigdy nie commituj folderu `secrets/`
  do git.
- Dla bezpieczeństwa produkcyjnego ustaw `knownHostsPath` w `handlers.NewAPI` (obecnie `""` =
  pomijanie weryfikacji klucza hosta) na ścieżkę pliku `known_hosts` zawierającego odcisk palca
  serwera PgBouncer, aby chronić się przed atakami MITM.
- Jeśli kiedykolwiek PgBouncer zostanie przeniesiony na ten sam host co manager, wystarczy
  ustawić `PGB_CONTROL_MODE=local` i uruchomić binarkę bezpośrednio na tym hoście (nie w
  kontenerze), aby uzyskać dostęp do lokalnego systemd — zobacz sekcję "Konfiguracja sudoers"
  powyżej.

- Zawsze uruchamiaj to za VPN-em/reverse proxy z TLS, nigdy nie udostępniaj bezpośrednio do
  internetu.
- `PGB_UI_USER`/`PGB_UI_PASS` to tylko minimalna warstwa ochrony przed aplikacją. Samo logowanie
  korzysta już z uwierzytelniania opartego na sesji z rolami (admin vs. viewer, zobacz menu
  **Users**) — pamiętaj, aby zmienić hasło domyślnego konta `admin` natychmiast po pierwszym
  wdrożeniu.
- Przed każdym zapisem do `pgbouncer.ini` automatycznie tworzony jest plik `.bak`.
