# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

Лёгкий веб-интерфейс для мониторинга и управления PgBouncer: состояние pools/clients/servers/stats,
запуск/остановка/перезапуск сервиса, перезагрузка конфигурации, пауза/возобновление, и изменение
pool_mode для каждой базы данных.

## Стек технологий
- Backend: Go + Gin + pgx (подключается напрямую к консоли администрирования PgBouncer по протоколу Postgres)
- Frontend: Vue 3 + TypeScript + Vite (уже находится в папке `web/`)

## Запуск frontend (разработка)

```bash
cd web
npm install
npm run dev
```

Dev-сервер Vite проксирует `/api/*` на `http://localhost:8088` (см. `web/vite.config.ts`),
поэтому сначала запустите backend на Go на этом порту.

## Сборка frontend для продакшена

```bash
cd web
npm run build
```

Результат сборки попадает в `web/dist/`, а backend на Go (`cmd/server/main.go`) уже настроен
автоматически отдавать эту папку как статические файлы — поэтому после сборки достаточно
просто запустить бинарник Go, Node.js на продакшен-сервере не требуется.

## Структура frontend

```
web/src/
  App.vue                    # макет дашборда + навигация по вкладкам
  main.ts                    # точка входа
  style.css                  # дизайн-токены (тёмная тема)
  types/api.ts                # типы ответов API
  composables/api.ts          # axios-клиент для всех endpoint'ов backend
  composables/usePolling.ts   # автообновление данных каждые несколько секунд (пауза при скрытой вкладке)
  components/
    ServiceStatusCard.vue     # статус + кнопки start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + пауза/возобновление
    ReadOnlyCard.vue           # вкладки clients/servers/stats/databases (переиспользуемый)
    ConfigEditorCard.vue       # изменение pool_mode для каждой БД + глобальные настройки
    DataTable.vue              # универсальная таблица для результатов команд SHOW
```

## Предварительные требования для PgBouncer

1. Убедитесь, что в `pgbouncer.ini` настроен admin-пользователь:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Добавьте учётные данные этого admin-пользователя в `userlist.txt`.
3. Убедитесь, что admin-порт (обычно совпадает с портом pgbouncer, по умолчанию 6432) доступен
   с хоста, на котором запущен этот Go-сервис.

## Настройка sudoers (для start/stop/restart сервиса)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # проверка синтаксиса
```

Отредактируйте `appuser` в этом файле, указав пользователя, от имени которого запускается этот
Go-бинарник. НЕ предоставляйте доступ sudo шире, чем эти 4 строки команд.

## Переменные окружения

| Переменная | По умолчанию | Описание |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | хост PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | порт PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | пользователь, зарегистрированный в `admin_users` |
| `PGB_ADMIN_PASS` | - | пароль admin-пользователя |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | путь к файлу конфигурации |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | путь к файлу userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | имя systemd-юнита |
| `PGB_LISTEN_ADDR` | `:8088` | адрес, на котором слушает веб-сервер |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | базовая аутентификация для интерфейса (ОБЯЗАТЕЛЬНО заполнить перед использованием вне localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | путь хранения названия приложения/компании (настраивается через меню Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | путь хранения кастомного логотипа, загруженного через меню Branding |

## Запуск

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Основные endpoint'ы

- `GET /api/status` — статус systemd-сервиса (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — runtime SET (ограниченно, см. `SHOW CONFIG`)
- `GET /api/config-edit/raw` — читает всё содержимое ini-файла в виде секций
- `POST /api/config-edit/database-field` `{"database","field","value"}` — редактирует ini + авто-RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — редактирует ini + авто-RELOAD
- `GET /api/branding` `/api/branding/logo` — идентичность приложения и логотип (публичный доступ, читается до входа в систему)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — только admin
- `POST /api/branding/logo` (multipart, поле `logo`, макс. 2MB) `/ DELETE /api/branding/logo` — только admin

## Настройка идентичности приложения (Branding)

Меню **Branding** (только для admin) позволяет изменить название приложения, подзаголовок, имя
компании/организации, отображаемое в футере, и логотип (заменяя стандартную иконку ◈) — они
отображаются в боковой панели, на странице входа и во вкладке браузера. Все эти настройки
сохраняются в `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` и сохраняются между перезапусками контейнера,
пока папка `/app/data` смонтирована как volume.

## Запуск через Docker (PgBouncer на отдельном сервере)

Поскольку ваш PgBouncer работает на другом сервере, управление start/stop/restart выполняется
через **SSH**, а не через локальный `systemctl` внутри контейнера (у контейнера нет доступа к
systemd другого хоста). Подключения к консоли администрирования (`SHOW POOLS` и т.д.)
по-прежнему работают нормально, так как это обычное TCP-соединение с портом PgBouncer — оно не
зависит от контейнера или расположения сервера.

### 1. Подготовка сервера PgBouncer (удалённого)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Затем сгенерируйте SSH-ключ на машине, где будете выполнять `docker compose build`, и установите
публичный ключ на сервер PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-сервера-pgbouncer>
```

Также убедитесь, что admin-порт PgBouncer (по умолчанию `6432`) доступен из сети, в которой
работает контейнер `pgbouncer-manager`.

### 2. Конфигурация

```bash
cp .env.example .env
# отредактируйте .env: заполните PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS и т.д.
```

### 3. Сборка и запуск

```bash
docker compose up -d --build
```

Приложение будет доступно по адресу `http://<этот-хост>:8088`, с полным дашбордом (статус,
pools, clients, stats, start/stop/restart через SSH, перезагрузка конфигурации).

### Важные замечания

- **Вкладка "Configuration"** (изменение pool_mode) автоматически отключается при
  `PGB_CONTROL_MODE=ssh`, так как этот endpoint редактирует `pgbouncer.ini` на локальной
  файловой системе. В режиме SSH редактируйте `pgbouncer.ini` напрямую на сервере PgBouncer
  (вручную или через свой Ansible/скрипт), затем нажмите **Reload Config** на вкладке Overview
  — это по-прежнему работает, так как `RELOAD` отправляется через консоль администрирования
  PgBouncer, а не через файловую систему.
- Приватный ключ в `./secrets/pgb_ssh_key` монтируется как Docker secret (только для чтения
  внутри контейнера, никогда не запекается в образ). Никогда не коммитьте папку `secrets/` в git.
- Для безопасности в продакшене укажите `knownHostsPath` в `handlers.NewAPI` (сейчас `""` =
  пропуск проверки host key) путь к файлу `known_hosts`, содержащему отпечаток сервера
  PgBouncer, чтобы защититься от атак MITM.
- Если когда-нибудь PgBouncer переместится на тот же хост, что и manager, просто установите
  `PGB_CONTROL_MODE=local` и запустите бинарник напрямую на этом хосте (не в контейнере), чтобы
  получить доступ к локальному systemd — см. раздел "Настройка sudoers" выше.

- Всегда запускайте это за VPN/reverse proxy с TLS, никогда не выставляйте напрямую в интернет.
- `PGB_UI_USER`/`PGB_UI_PASS` — это лишь минимальный уровень защиты перед приложением. Сам вход
  в систему уже использует аутентификацию на основе сессий с ролями (admin и viewer, см. меню
  **Users**) — обязательно смените пароль учётной записи `admin` по умолчанию сразу после
  первого развёртывания.
- Перед каждой записью в `pgbouncer.ini` автоматически создаётся файл `.bak`.
