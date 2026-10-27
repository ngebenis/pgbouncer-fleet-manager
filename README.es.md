# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[Explora la Galería de Cultura y Gastronomía de Indonesia →](CULTURE.md)**

Una interfaz web ligera para monitorear y controlar PgBouncer: estado de pools/clients/servers/stats,
iniciar/detener/reiniciar el servicio, recargar la configuración, pausar/reanudar, y cambiar el
pool_mode por base de datos.

## Capturas de pantalla

| Iniciar sesión | Dashboard | Pools |
|---|---|---|
| ![Iniciar sesión](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Clientes | Servidores | Estadísticas |
|---|---|---|
| ![Clientes](docs/screenshots/03-clients.png) | ![Servidores](docs/screenshots/04-servers.png) | ![Estadísticas](docs/screenshots/05-stats.png) |

| Bases de datos | Configuración | Gestionar Servidores |
|---|---|---|
| ![Bases de datos](docs/screenshots/06-databases.png) | ![Configuración](docs/screenshots/07-configuration.png) | ![Gestionar Servidores](docs/screenshots/08-manage-servers.png) |

| Usuarios | Registro de Auditoría | Copia de Seguridad |
|---|---|---|
| ![Usuarios](docs/screenshots/09-users.png) | ![Registro de Auditoría](docs/screenshots/10-audit-log.png) | ![Copia de Seguridad](docs/screenshots/11-backup-restore.png) |

| Identidad |
|---|
| ![Identidad](docs/screenshots/12-identity.png) |

## Stack
- Backend: Go + Gin + pgx (se conecta directamente a la consola de administración de PgBouncer mediante el protocolo Postgres)
- Frontend: Vue 3 + TypeScript + Vite (ya está en la carpeta `web/`)

## Ejecutar el frontend (desarrollo)

```bash
cd web
npm install
npm run dev
```

El servidor de desarrollo de Vite redirige `/api/*` a `http://localhost:8088` (ver `web/vite.config.ts`),
así que primero ejecuta el backend de Go en ese puerto.

## Compilar el frontend para producción

```bash
cd web
npm run build
```

El resultado se genera en `web/dist/`, y el backend de Go (`cmd/server/main.go`) ya está configurado
para servir esta carpeta automáticamente como archivos estáticos — así que después de compilar, solo
necesitas ejecutar el binario de Go, no se requiere Node.js en producción.

## Estructura del frontend

```
web/src/
  App.vue                    # diseño del dashboard + navegación por pestañas
  main.ts                    # punto de entrada
  style.css                  # tokens de diseño (tema oscuro)
  types/api.ts                # tipos de respuesta de la API
  composables/api.ts          # cliente axios para todos los endpoints del backend
  composables/usePolling.ts   # actualiza los datos automáticamente cada pocos segundos (se pausa cuando la pestaña está oculta)
  components/
    ServiceStatusCard.vue     # estado + botones de start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + pausar/reanudar
    ReadOnlyCard.vue           # pestañas de clients/servers/stats/databases (reutilizable)
    ConfigEditorCard.vue       # cambiar pool_mode por base de datos + configuración global
    DataTable.vue              # tabla genérica para los resultados de comandos SHOW
```

## Requisitos previos de PgBouncer

1. Asegúrate de tener un usuario admin en `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Agrega las credenciales de ese usuario admin a `userlist.txt`.
3. Asegúrate de que el puerto admin (normalmente el mismo que el de pgbouncer, por defecto 6432)
   sea accesible desde el host donde se ejecuta este servicio Go.

## Configuración de sudoers (para start/stop/restart del servicio)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # validar la sintaxis
```

Edita `appuser` en ese archivo para que coincida con el usuario que ejecuta este binario de Go.
NO otorgues acceso sudo más amplio que esas 4 líneas de comandos.

## Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | host de PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | puerto de PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | usuario registrado en `admin_users` |
| `PGB_ADMIN_PASS` | - | contraseña del usuario admin |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | ruta del archivo de configuración |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | ruta del archivo userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | nombre de la unidad systemd |
| `PGB_LISTEN_ADDR` | `:8088` | dirección de escucha del servidor web |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | autenticación básica para la interfaz (OBLIGATORIO antes de usarla fuera de localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | ruta donde se guarda el nombre de la app/empresa (configurado desde el menú Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | ruta donde se guarda el logo personalizado subido desde el menú Branding |

## Ejecución

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Endpoints principales

- `GET /api/status` — estado del servicio systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — SET en tiempo de ejecución (limitado, revisa `SHOW CONFIG`)
- `GET /api/config-edit/raw` — lee todo el contenido del ini como secciones
- `POST /api/config-edit/database-field` `{"database","field","value"}` — edita el ini + RELOAD automático
- `POST /api/config-edit/global-field` `{"field","value"}` — edita el ini + RELOAD automático
- `GET /api/branding` `/api/branding/logo` — identidad de la app y logo (público, se lee antes de iniciar sesión)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — solo admin
- `POST /api/branding/logo` (multipart `logo`, máx. 2MB) `/ DELETE /api/branding/logo` — solo admin

## Personalizar la identidad de la app (Branding)

El menú **Branding** (solo admin) permite cambiar el nombre de la app, el subtítulo, el nombre
de la empresa/organización que aparece en el pie de página, y el logo (reemplazando el ícono ◈
por defecto) — se muestran en la barra lateral, la página de inicio de sesión y la pestaña del
navegador. Todos estos ajustes se guardan en `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` y persisten
entre reinicios del contenedor mientras la carpeta `/app/data` esté montada como volumen.

## Ejecutar con Docker (PgBouncer en un servidor separado)

Como tu PgBouncer corre en otro servidor, el control de start/stop/restart se hace mediante
**SSH**, no mediante `systemctl` local dentro del contenedor (el contenedor no tiene acceso al
systemd de otro host). Las conexiones a la consola de administración (`SHOW POOLS`, etc.) siguen
funcionando con normalidad porque es solo una conexión TCP común al puerto de PgBouncer — no se
ve afectada por el contenedor ni la ubicación del servidor.

### 1. Preparar el servidor de PgBouncer (remoto)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Luego genera una clave SSH en la máquina donde ejecutarás `docker compose build`, e instala la
clave pública en el servidor de PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-del-servidor-pgbouncer>
```

Asegúrate también de que el puerto admin de PgBouncer (por defecto `6432`) sea accesible desde
la red donde corre el contenedor `pgbouncer-manager`.

### 2. Configuración

```bash
cp .env.example .env
# edita .env: completa PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS, etc.
```

### 3. Compilar y ejecutar

```bash
docker compose up -d --build
```

La app estará disponible en `http://<este-host>:8088`, con el dashboard completo (status, pools,
clients, stats, start/stop/restart vía SSH, reload de configuración).

### Notas importantes

- La **pestaña "Configuration"** (cambiar pool_mode) se desactiva automáticamente cuando
  `PGB_CONTROL_MODE=ssh`, porque ese endpoint edita `pgbouncer.ini` en el sistema de archivos
  local. En modo SSH, edita `pgbouncer.ini` directamente en el servidor de PgBouncer
  (manualmente o con tu propio Ansible/script), y luego haz clic en **Reload Config** en la
  pestaña Overview — esto sigue funcionando porque `RELOAD` se envía a través de la consola de
  administración de PgBouncer, no mediante el sistema de archivos.
- La clave privada en `./secrets/pgb_ssh_key` se monta como un Docker secret (solo lectura dentro
  del contenedor, no se incluye en la imagen). No subas la carpeta `secrets/` a git.
- Para mayor seguridad en producción, configura `knownHostsPath` en `handlers.NewAPI` (actualmente
  `""` = omite la verificación de host key) con la ruta de un archivo `known_hosts` que contenga
  el fingerprint del servidor de PgBouncer, para protegerte contra ataques MITM.
- Si alguna vez PgBouncer se traslada al mismo host que el manager, simplemente configura
  `PGB_CONTROL_MODE=local` y ejecuta el binario directamente en ese host (no en un contenedor)
  para poder acceder al systemd local — ver la sección "Configuración de sudoers" más arriba.

- Ejecuta siempre esto detrás de una VPN/reverse proxy con TLS, nunca lo expongas directamente a
  internet.
- `PGB_UI_USER`/`PGB_UI_PASS` es solo una capa mínima de protección frente a la app. El login en
  sí ya usa autenticación basada en sesión con roles (admin vs. viewer, ver el menú **Users**) —
  asegúrate de cambiar la contraseña de la cuenta `admin` por defecto inmediatamente después del
  primer despliegue.
- Se crea automáticamente un archivo `.bak` antes de cada escritura en `pgbouncer.ini`.
