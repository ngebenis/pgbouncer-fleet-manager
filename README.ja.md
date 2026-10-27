# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[インドネシアの食文化ギャラリーを見る →](CULTURE.md)**

PgBouncer を監視・制御するための軽量な Web GUI です。pools/clients/servers/stats の状態表示、
サービスの start/stop/restart、設定の reload、pause/resume、データベースごとの pool_mode 変更
などが行えます。

## スクリーンショット

| ログイン | ダッシュボード | Pools |
|---|---|---|
| ![ログイン](docs/screenshots/00-login.png) | ![ダッシュボード](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| クライアント | サーバー | 統計 |
|---|---|---|
| ![クライアント](docs/screenshots/03-clients.png) | ![サーバー](docs/screenshots/04-servers.png) | ![統計](docs/screenshots/05-stats.png) |

| データベース | 設定 | サーバー管理 |
|---|---|---|
| ![データベース](docs/screenshots/06-databases.png) | ![設定](docs/screenshots/07-configuration.png) | ![サーバー管理](docs/screenshots/08-manage-servers.png) |

| ユーザー | 監査ログ | バックアップと復元 |
|---|---|---|
| ![ユーザー](docs/screenshots/09-users.png) | ![監査ログ](docs/screenshots/10-audit-log.png) | ![バックアップと復元](docs/screenshots/11-backup-restore.png) |

| アイデンティティ |
|---|
| ![アイデンティティ](docs/screenshots/12-identity.png) |

## スタック
- バックエンド: Go + Gin + pgx（Postgres プロトコル経由で PgBouncer の管理コンソールに直接接続）
- フロントエンド: Vue 3 + TypeScript + Vite（`web/` フォルダにすでに含まれています）

## フロントエンドの起動（開発環境）

```bash
cd web
npm install
npm run dev
```

Vite の開発サーバーは `/api/*` を `http://localhost:8088` にプロキシします（`web/vite.config.ts`
参照）。そのため、先にそのポートで Go バックエンドを起動してください。

## フロントエンドを本番用にビルドする

```bash
cd web
npm run build
```

ビルド結果は `web/dist/` に出力され、Go バックエンド（`cmd/server/main.go`）はこのフォルダを
静的ファイルとして自動的に配信するようすでに設定されています。そのためビルド後は Go の
バイナリを実行するだけでよく、本番サーバーに Node.js は不要です。

## フロントエンドの構成

```
web/src/
  App.vue                    # ダッシュボードのレイアウト + タブナビゲーション
  main.ts                    # エントリーポイント
  style.css                  # デザイントークン（ダークテーマ）
  types/api.ts                # API レスポンスの型定義
  composables/api.ts          # バックエンドの全エンドポイント用 axios クライアント
  composables/usePolling.ts   # 数秒ごとにデータを自動更新（タブが非表示の間は停止）
  components/
    ServiceStatusCard.vue     # ステータス + start/stop/restart/reload ボタン
    PoolsCard.vue              # SHOW POOLS + pause/resume
    ReadOnlyCard.vue           # clients/servers/stats/databases タブ（再利用可能）
    ConfigEditorCard.vue       # データベースごとの pool_mode 変更 + グローバル設定
    DataTable.vue              # SHOW コマンドの結果を表示する汎用テーブル
```

## PgBouncer の事前準備

1. `pgbouncer.ini` に admin ユーザーが設定されていることを確認してください:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. その admin ユーザーの認証情報を `userlist.txt` に追加します。
3. admin ポート（通常 pgbouncer のポートと同じ、デフォルト 6432）が、この Go サービスを実行する
   ホストからアクセス可能であることを確認してください。

## sudoers の設定（サービスの start/stop/restart 用）

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # 構文を検証
```

このファイル内の `appuser` を、この Go バイナリを実行するユーザーに合わせて編集してください。
この 4 行のコマンド以外に sudo 権限を付与しないでください。

## 環境変数

| 変数 | デフォルト | 説明 |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | PgBouncer のホスト |
| `PGB_ADMIN_PORT` | `6432` | PgBouncer のポート |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | `admin_users` に登録されたユーザー |
| `PGB_ADMIN_PASS` | - | admin ユーザーのパスワード |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | 設定ファイルのパス |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | userlist ファイルのパス |
| `PGB_SERVICE_NAME` | `pgbouncer` | systemd ユニット名 |
| `PGB_LISTEN_ADDR` | `:8088` | Web サーバーの待ち受けアドレス |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | UI の Basic 認証（localhost 以外で使用する前に**必須**） |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | アプリ名/会社名の保存先パス（Branding メニューで設定） |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | Branding メニューからアップロードしたカスタムロゴの保存先パス |

## 実行方法

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## 主な API エンドポイント

- `GET /api/status` — systemd サービスのステータス（active/inactive/failed）
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — ランタイム SET（制限あり、`SHOW CONFIG` を確認）
- `GET /api/config-edit/raw` — ini ファイル全体をセクション単位で読み込み
- `POST /api/config-edit/database-field` `{"database","field","value"}` — ini を編集 + 自動 RELOAD
- `POST /api/config-edit/global-field` `{"field","value"}` — ini を編集 + 自動 RELOAD
- `GET /api/branding` `/api/branding/logo` — アプリのアイデンティティとロゴ（公開、ログイン前でも読み取り可能）
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — admin のみ
- `POST /api/branding/logo`（multipart `logo`、最大 2MB）`/ DELETE /api/branding/logo` — admin のみ

## アプリのアイデンティティをカスタマイズする（Branding）

**Branding** メニュー（admin のみ）では、アプリ名、サブタイトル、フッターに表示される会社名/
組織名、そしてロゴ（デフォルトの ◈ アイコンを置き換え）を変更できます。これらはサイドバー、
ログインページ、ブラウザタブに表示されます。これらの設定はすべて
`PGB_BRANDING_FILE`/`PGB_LOGO_FILE` に保存され、`/app/data` フォルダが volume としてマウント
されている限り、コンテナの再起動後も保持されます。

## Docker での実行（PgBouncer が別サーバーにある場合）

PgBouncer が別のサーバーで動作しているため、start/stop/restart の制御は **SSH** 経由で行われ、
コンテナ内のローカル `systemctl` は使用しません（コンテナは他のホストの systemd にアクセスでき
ません）。管理コンソールへの接続（`SHOW POOLS` など）は、単なる PgBouncer ポートへの通常の TCP
接続のため、通常どおり動作し続けます — コンテナやサーバーの場所には影響されません。

### 1. PgBouncer サーバー（リモート）の準備

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

次に、`docker compose build` を実行するマシンで SSH キーを生成し、公開鍵を PgBouncer サーバー
にインストールします:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<PgBouncerサーバーのIP>
```

また、PgBouncer の admin ポート（デフォルト `6432`）が、`pgbouncer-manager` コンテナが動作する
ネットワークからアクセス可能であることを確認してください。

### 2. 設定

```bash
cp .env.example .env
# .env を編集: PGB_ADMIN_HOST、PGB_SSH_HOST、PGB_UI_USER/PASS などを入力
```

### 3. ビルドと実行

```bash
docker compose up -d --build
```

アプリは `http://<このホスト>:8088` で利用可能になり、完全なダッシュボード（status、pools、
clients、stats、SSH 経由の start/stop/restart、設定の reload）が使用できます。

### 重要な注意事項

- **"Configuration" タブ**（pool_mode の変更）は、`PGB_CONTROL_MODE=ssh` の場合は自動的に無効
  になります。このエンドポイントはローカルファイルシステム上の `pgbouncer.ini` を編集するため
  です。SSH モードでは、`pgbouncer.ini` を PgBouncer サーバー上で直接編集し（手動、または独自の
  Ansible/スクリプトで）、その後 Overview タブの **Reload Config** ボタンをクリックしてください
  — `RELOAD` はファイルシステムではなく PgBouncer の管理コンソール経由で送信されるため、これは
  引き続き機能します。
- `./secrets/pgb_ssh_key` にある秘密鍵は Docker secret としてマウントされます（コンテナ内では
  読み取り専用で、イメージには決して焼き込まれません）。`secrets/` フォルダを git に commit し
  ないでください。
- 本番環境のセキュリティのため、`handlers.NewAPI` 内の `knownHostsPath`（現在は `""` = host key
  の検証をスキップ）を、PgBouncer サーバーのフィンガープリントを含む `known_hosts` ファイルの
  パスに設定し、MITM 攻撃から保護してください。
- 将来 PgBouncer が manager と同じホストに移動した場合は、単に `PGB_CONTROL_MODE=local` を設定
  し、そのホスト上で直接（コンテナではなく）バイナリを実行することで、ローカルの systemd に
  アクセスできます — 上記の「sudoers の設定」セクションを参照してください。

- 必ず TLS 付きの VPN/reverse proxy の背後で実行し、直接インターネットに公開しないでください。
- `PGB_UI_USER`/`PGB_UI_PASS` はアプリの前段にある最小限の保護層にすぎません。ログイン自体は
  すでにロールベース（admin と viewer、**Users** メニューを参照）のセッション認証を使用して
  います — 初回デプロイ後は、デフォルトの `admin` アカウントのパスワードを必ずすぐに変更して
  ください。
- `pgbouncer.ini` への書き込みのたびに `.bak` ファイルが自動的に作成されます。
