# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

PgBouncer를 모니터링하고 제어하기 위한 가벼운 웹 GUI입니다: pools/clients/servers/stats 상태
확인, 서비스 start/stop/restart, 설정 reload, pause/resume, 데이터베이스별 pool_mode 변경 등을
제공합니다.

## 기술 스택
- 백엔드: Go + Gin + pgx (Postgres 프로토콜을 통해 PgBouncer 관리 콘솔에 직접 연결)
- 프론트엔드: Vue 3 + TypeScript + Vite (`web/` 폴더에 이미 포함되어 있음)

## 프론트엔드 실행 (개발 환경)

```bash
cd web
npm install
npm run dev
```

Vite 개발 서버는 `/api/*`를 `http://localhost:8088`로 프록시합니다 (`web/vite.config.ts` 참고).
따라서 먼저 해당 포트에서 Go 백엔드를 실행하세요.

## 프로덕션용 프론트엔드 빌드

```bash
cd web
npm run build
```

빌드 결과물은 `web/dist/`에 생성되며, Go 백엔드(`cmd/server/main.go`)는 이미 이 폴더를 정적
파일로 자동 서빙하도록 설정되어 있습니다 — 따라서 빌드 후에는 Go 바이너리만 실행하면 되며,
프로덕션 서버에 Node.js가 필요하지 않습니다.

## 프론트엔드 구조

```
web/src/
  App.vue                    # 대시보드 레이아웃 + 탭 내비게이션
  main.ts                    # 진입점
  style.css                  # 디자인 토큰 (다크 테마)
  types/api.ts                # API 응답 타입
  composables/api.ts          # 백엔드의 모든 엔드포인트를 위한 axios 클라이언트
  composables/usePolling.ts   # 몇 초마다 데이터 자동 새로고침 (탭이 숨겨지면 일시 중지)
  components/
    ServiceStatusCard.vue     # 상태 + start/stop/restart/reload 버튼
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # clients/servers/stats/databases 탭 (재사용 가능)
    ConfigEditorCard.vue       # 데이터베이스별 pool_mode 변경 + 전역 설정
    DataTable.vue              # SHOW 명령 결과를 위한 범용 테이블
```

## PgBouncer 사전 준비

1. `pgbouncer.ini`에 admin 사용자가 설정되어 있는지 확인하세요:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. 해당 admin 사용자의 자격 증명을 `userlist.txt`에 추가하세요.
3. admin 포트(일반적으로 pgbouncer 포트와 동일, 기본값 6432)가 이 Go 서비스가 실행되는 호스트
   에서 접근 가능한지 확인하세요.

## sudoers 설정 (서비스 start/stop/restart용)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # 문법 검증
```

해당 파일의 `appuser`를 이 Go 바이너리를 실행하는 사용자로 수정하세요. 이 4줄의 명령어보다
넓은 범위의 sudo 권한을 부여하지 마세요.

## 환경 변수

| 변수 | 기본값 | 설명 |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer 호스트 |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer 포트 |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | `admin_users`에 등록된 사용자 |
| `PGB_ADMIN_PASS` | - | admin 사용자의 비밀번호 |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | 설정 파일 경로 |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | userlist 파일 경로 |
| `PGB_SERVICE_NAME` | `pgbouncer` | systemd 유닛 이름 |
| `PGB_LISTEN_ADDR` | `:8088` | 웹 서버 리스닝 주소 |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | UI용 기본 인증 (localhost 외부에서 사용하기 전 **필수** 설정) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | 앱/회사 이름 저장 경로 (Branding 메뉴에서 설정) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | Branding 메뉴에서 업로드한 커스텀 로고 저장 경로 |

## 실행

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## 주요 엔드포인트

- `GET /api/status` — systemd 서비스 상태 (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — 런타임 SET (제한적, `SHOW CONFIG` 참고)
- `GET /api/config-edit/raw` — 전체 ini 파일 내용을 섹션 단위로 읽기
- `POST /api/config-edit/database-field` `{"database","field","value"}` — ini 수정 + 자동 RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — ini 수정 + 자동 RELOAD
- `GET /api/branding` `/api/branding/logo` — 앱 아이덴티티 및 로고 (공개, 로그인 전에도 읽기 가능)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — admin 전용
- `POST /api/branding/logo` (multipart `logo`, 최대 2MB) `/ DELETE /api/branding/logo` — admin 전용

## 앱 아이덴티티 커스터마이징 (Branding)

**Branding** 메뉴(admin 전용)를 통해 앱 이름, 부제목, 푸터에 표시되는 회사/조직 이름, 그리고
로고(기본 ◈ 아이콘 대체)를 변경할 수 있습니다 — 이는 사이드바, 로그인 페이지, 브라우저 탭에
표시됩니다. 이러한 모든 설정은 `PGB_BRANDING_FILE`/`PGB_LOGO_FILE`에 저장되며, `/app/data`
폴더가 volume으로 마운트되어 있는 한 컨테이너 재시작 후에도 유지됩니다.

## Docker로 실행하기 (PgBouncer가 별도 서버에 있는 경우)

PgBouncer가 다른 서버에서 실행 중이므로, start/stop/restart 제어는 컨테이너 내부의 로컬
`systemctl`이 아닌 **SSH**를 통해 이루어집니다 (컨테이너는 다른 호스트의 systemd에 접근할 수
없습니다). 관리 콘솔 연결(`SHOW POOLS` 등)은 단순히 PgBouncer 포트로의 일반 TCP 연결이므로
정상적으로 계속 작동합니다 — 컨테이너나 서버 위치와는 무관합니다.

### 1. PgBouncer 서버 준비 (원격)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

그런 다음 `docker compose build`를 실행할 머신에서 SSH 키를 생성하고, public key를 PgBouncer
서버에 설치하세요:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<pgbouncer-서버-ip>
```

또한 PgBouncer admin 포트(기본값 `6432`)가 `pgbouncer-manager` 컨테이너가 실행되는 네트워크에서
접근 가능한지 확인하세요.

### 2. 설정

```bash
cp .env.example .env
# .env 편집: PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS 등을 입력
```

### 3. 빌드 및 실행

```bash
docker compose up -d --build
```

앱은 `http://<이-호스트>:8088`에서 사용 가능하며, 전체 대시보드(status, pools, clients, stats,
SSH를 통한 start/stop/restart, 설정 reload)를 제공합니다.

### 중요 참고 사항

- **"Configuration" 탭**(pool_mode 변경)은 `PGB_CONTROL_MODE=ssh`일 때 자동으로 비활성화됩니다.
  이 엔드포인트가 로컬 파일시스템에서 `pgbouncer.ini`를 수정하기 때문입니다. SSH 모드에서는
  `pgbouncer.ini`를 PgBouncer 서버에서 직접 수정(수동으로 또는 자체 Ansible/스크립트를 통해)한
  후, Overview 탭에서 **Reload Config** 버튼을 클릭하세요 — `RELOAD`는 파일시스템이 아닌
  PgBouncer 관리 콘솔을 통해 전송되므로 이는 계속 작동합니다.
- `./secrets/pgb_ssh_key`에 있는 개인 키는 Docker secret으로 마운트됩니다(컨테이너 내부에서
  읽기 전용이며, 이미지에 포함되지 않습니다). `secrets/` 폴더는 git에 commit하지 마세요.
- 프로덕션 보안을 위해 `handlers.NewAPI`의 `knownHostsPath`(현재 `""` = host key 검증 건너뛰기)를
  PgBouncer 서버의 fingerprint가 포함된 `known_hosts` 파일 경로로 설정하여 MITM 공격으로부터
  보호하세요.
- 나중에 PgBouncer가 manager와 동일한 호스트로 이전되는 경우, `PGB_CONTROL_MODE=local`을
  설정하고 해당 호스트에서 바이너리를 직접(컨테이너가 아닌) 실행하여 로컬 systemd에 접근할 수
  있습니다 — 위의 "sudoers 설정" 섹션을 참고하세요.

- 항상 TLS가 적용된 VPN/reverse proxy 뒤에서 실행하고, 절대 인터넷에 직접 노출하지 마세요.
- `PGB_UI_USER`/`PGB_UI_PASS`는 앱 앞단의 최소한의 보호 계층일 뿐입니다. 로그인 자체는 이미
  역할 기반(admin과 viewer, **Users** 메뉴 참고) 세션 인증을 사용합니다 — 첫 배포 직후에는
  반드시 기본 `admin` 계정의 비밀번호를 변경하세요.
- `pgbouncer.ini`에 쓰기 작업을 할 때마다 `.bak` 파일이 자동으로 생성됩니다.
