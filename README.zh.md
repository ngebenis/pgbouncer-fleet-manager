# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[探索印尼美食与文化画廊 →](CULTURE.md)**

一个轻量级的 PgBouncer 监控与控制 Web 界面：查看 pools/clients/servers/stats 状态、
启动/停止/重启服务、重新加载配置、暂停/恢复连接，以及按数据库修改 pool_mode。

## 截图

| 登录 | 仪表盘 | Pools |
|---|---|---|
| ![登录](docs/screenshots/00-login.png) | ![仪表盘](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| 客户端 | 服务器 | 统计 |
|---|---|---|
| ![客户端](docs/screenshots/03-clients.png) | ![服务器](docs/screenshots/04-servers.png) | ![统计](docs/screenshots/05-stats.png) |

| 数据库 | 配置 | 管理服务器 |
|---|---|---|
| ![数据库](docs/screenshots/06-databases.png) | ![配置](docs/screenshots/07-configuration.png) | ![管理服务器](docs/screenshots/08-manage-servers.png) |

| 用户 | 审计日志 | 备份与恢复 |
|---|---|---|
| ![用户](docs/screenshots/09-users.png) | ![审计日志](docs/screenshots/10-audit-log.png) | ![备份与恢复](docs/screenshots/11-backup-restore.png) |

| 身份标识 |
|---|
| ![身份标识](docs/screenshots/12-identity.png) |

## 技术栈
- 后端：Go + Gin + pgx（通过 Postgres 协议直接连接 PgBouncer 管理控制台）
- 前端：Vue 3 + TypeScript + Vite（已在 `web/` 目录中）

## 运行前端(开发环境)

```bash
cd web
npm install
npm run dev
```

Vite 开发服务器会将 `/api/*` 代理到 `http://localhost:8088`（参见 `web/vite.config.ts`），
因此请先在该端口启动 Go 后端。

## 构建前端(生产环境)

```bash
cd web
npm run build
```

构建产物会输出到 `web/dist/`，Go 后端(`cmd/server/main.go`)已配置为自动将该目录作为静态
文件提供服务——因此构建完成后，只需运行 Go 可执行文件即可，生产环境无需 Node.js。

## 前端目录结构

```
web/src/
  App.vue                    # 仪表盘布局 + 标签导航
  main.ts                    # 入口文件
  style.css                  # 设计变量(深色主题)
  types/api.ts                # API 响应类型
  composables/api.ts          # 调用后端所有接口的 axios 客户端
  composables/usePolling.ts   # 每隔几秒自动刷新数据(标签页不可见时暂停)
  components/
    ServiceStatusCard.vue     # 状态显示 + 启动/停止/重启/重载按钮
    PoolsCard.vue              # SHOW POOLS + 暂停/恢复
    ReadOnlyCard.vue           # clients/servers/stats/databases 标签页(可复用)
    ConfigEditorCard.vue       # 按数据库修改 pool_mode + 全局设置
    DataTable.vue              # 用于展示 SHOW 命令结果的通用表格
```

## PgBouncer 前置准备

1. 确保 `pgbouncer.ini` 中已配置管理员用户：
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. 将该管理员用户的凭据添加到 `userlist.txt`。
3. 确保管理端口(通常与 pgbouncer 端口相同，默认 6432)可以从运行本 Go 服务的主机访问。

## 配置 sudoers(用于启动/停止/重启服务)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # 验证语法
```

请将该文件中的 `appuser` 改为运行此 Go 可执行文件的实际用户。**不要**授予超出这 4 条命令
范围之外的 sudo 权限。

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer 主机地址 |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer 端口 |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | 已注册在 `admin_users` 中的用户 |
| `PGB_ADMIN_PASS` | - | 管理员用户密码 |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | 配置文件路径 |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | userlist 文件路径 |
| `PGB_SERVICE_NAME` | `pgbouncer` | systemd 单元名称 |
| `PGB_LISTEN_ADDR` | `:8088` | Web 服务器监听地址 |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | UI 的基础认证(在 localhost 之外使用前**必须**设置) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | 应用/公司名称的存储路径(通过 Branding 菜单设置) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | 通过 Branding 菜单上传的自定义 Logo 存储路径 |

## 运行

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## 主要接口

- `GET /api/status` — systemd 服务状态(active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — 运行时 SET(有限制，请查看 `SHOW CONFIG`)
- `GET /api/config-edit/raw` — 以 section 形式读取整个 ini 文件内容
- `POST /api/config-edit/database-field` `{"database","field","value"}` — 修改 ini + 自动 RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — 修改 ini + 自动 RELOAD
- `GET /api/branding` `/api/branding/logo` — 应用身份标识与 Logo(公开接口，登录前即可读取)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — 仅管理员
- `POST /api/branding/logo`(multipart 字段 `logo`，最大 2MB)`/ DELETE /api/branding/logo` — 仅管理员

## 自定义应用身份标识(Branding)

**Branding** 菜单(仅管理员可见)可用于修改应用名称、副标题、显示在页脚的公司/组织名称，
以及 Logo(替换默认的 ◈ 图标)——这些会显示在侧边栏、登录页面和浏览器标签页上。所有这些
设置都保存在 `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` 中，只要 `/app/data` 目录挂载为卷，就能
在容器重启后依然保留。

## 使用 Docker 运行(PgBouncer 部署在独立服务器上)

由于您的 PgBouncer 运行在另一台服务器上，启动/停止/重启的控制通过 **SSH** 完成，而不是
容器内本地的 `systemctl`(容器无法访问另一台主机的 systemd)。管理控制台连接
(`SHOW POOLS` 等)依然能正常工作，因为那只是普通的 TCP 连接到 PgBouncer 端口——不受
容器或服务器位置影响。

### 1. 准备 PgBouncer 服务器(远程)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

然后在您将要执行 `docker compose build` 的机器上生成 SSH 密钥，并将公钥安装到
PgBouncer 服务器上：

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<pgbouncer服务器IP>
```

同时确保 PgBouncer 管理端口(默认 `6432`)可以从运行 `pgbouncer-manager` 容器的网络访问。

### 2. 配置

```bash
cp .env.example .env
# 编辑 .env：填写 PGB_ADMIN_HOST、PGB_SSH_HOST、PGB_UI_USER/PASS 等
```

### 3. 构建并运行

```bash
docker compose up -d --build
```

应用将在 `http://<本机地址>:8088` 上可用，提供完整的仪表盘功能(状态、pools、clients、
stats、通过 SSH 启停/重启、重新加载配置)。

### 重要说明

- **"Configuration"(配置)标签页**(修改 pool_mode)在 `PGB_CONTROL_MODE=ssh` 时会自动
  禁用，因为该接口是在本地文件系统上编辑 `pgbouncer.ini`。在 SSH 模式下，请直接在
  PgBouncer 服务器上编辑 `pgbouncer.ini`(手动编辑或通过您自己的 Ansible/脚本)，然后在
  Overview 标签页点击 **Reload Config** 按钮——这个操作依然有效，因为 `RELOAD` 是通过
  PgBouncer 管理控制台发送的，而不是通过文件系统。
- `./secrets/pgb_ssh_key` 中的私钥是作为 Docker secret 挂载的(容器内只读，不会被打包进
  镜像)。请勿将 `secrets/` 目录提交到 git。
- 出于生产环境安全考虑，请在 `handlers.NewAPI` 中将 `knownHostsPath`(目前为 `""`，即跳过
  主机密钥验证)设置为包含 PgBouncer 服务器指纹的 `known_hosts` 文件路径，以防范中间人
  攻击(MITM)。
- 如果将来 PgBouncer 迁移到与 manager 相同的主机上，只需设置 `PGB_CONTROL_MODE=local`，
  并直接在该主机上运行可执行文件(而非在容器中运行)，以便访问本地 systemd——参见上方
  "配置 sudoers" 部分。

- 请务必在 VPN/带 TLS 的反向代理后面运行本服务，切勿直接暴露到公网。
- `PGB_UI_USER`/`PGB_UI_PASS` 仅是应用前的一层最基础防护。登录本身已经采用基于 session
  的认证并支持角色区分(管理员 vs 只读用户，参见 **Users** 菜单)——请务必在首次部署后
  立即修改默认 `admin` 账户的密码。
- 每次写入 `pgbouncer.ini` 之前都会自动生成 `.bak` 备份文件。

## 捐赠

☕ *请我喝杯咖啡*

PayPal: **b3n1_id@yahoo.com** (benisantoso72@gmail.com)
