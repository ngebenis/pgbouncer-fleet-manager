# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Français](README.fr.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

Uma interface web leve para monitorar e controlar o PgBouncer: status de pools/clients/servers/stats,
iniciar/parar/reiniciar o serviço, recarregar a configuração, pausar/retomar, e alterar o pool_mode
por banco de dados.

## Capturas de tela

| Login | Dashboard | Pools |
|---|---|---|
| ![Login](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Clientes | Servidores | Estatísticas |
|---|---|---|
| ![Clientes](docs/screenshots/03-clients.png) | ![Servidores](docs/screenshots/04-servers.png) | ![Estatísticas](docs/screenshots/05-stats.png) |

| Bancos de Dados | Configuração | Gerenciar Servidores |
|---|---|---|
| ![Bancos de Dados](docs/screenshots/06-databases.png) | ![Configuração](docs/screenshots/07-configuration.png) | ![Gerenciar Servidores](docs/screenshots/08-manage-servers.png) |

| Usuários | Log de Auditoria | Backup & Restauração |
|---|---|---|
| ![Usuários](docs/screenshots/09-users.png) | ![Log de Auditoria](docs/screenshots/10-audit-log.png) | ![Backup & Restauração](docs/screenshots/11-backup-restore.png) |

| Identidade |
|---|
| ![Identidade](docs/screenshots/12-identity.png) |

## Stack
- Backend: Go + Gin + pgx (conecta-se diretamente ao console de administração do PgBouncer via protocolo Postgres)
- Frontend: Vue 3 + TypeScript + Vite (já presente na pasta `web/`)

## Executando o frontend (desenvolvimento)

```bash
cd web
npm install
npm run dev
```

O servidor de desenvolvimento do Vite faz proxy de `/api/*` para `http://localhost:8088` (veja
`web/vite.config.ts`), então execute primeiro o backend Go nessa porta.

## Compilando o frontend para produção

```bash
cd web
npm run build
```

O resultado da build vai para `web/dist/`, e o backend Go (`cmd/server/main.go`) já está
configurado para servir essa pasta automaticamente como arquivos estáticos — então, após a build,
basta executar o binário Go, sem necessidade de Node.js em produção.

## Estrutura do frontend

```
web/src/
  App.vue                    # layout do dashboard + navegação por abas
  main.ts                    # ponto de entrada
  style.css                  # tokens de design (tema escuro)
  types/api.ts                # tipos das respostas da API
  composables/api.ts          # cliente axios para todos os endpoints do backend
  composables/usePolling.ts   # atualiza os dados automaticamente a cada poucos segundos (pausa quando a aba está oculta)
  components/
    ServiceStatusCard.vue     # status + botões de start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + pausar/retomar
    ReadOnlyCard.vue           # abas de clients/servers/stats/databases (reutilizável)
    ConfigEditorCard.vue       # alterar o pool_mode por banco de dados + configuração global
    DataTable.vue              # tabela genérica para os resultados dos comandos SHOW
```

## Pré-requisitos do PgBouncer

1. Certifique-se de que há um usuário admin em `pgbouncer.ini`:
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Adicione as credenciais desse usuário admin em `userlist.txt`.
3. Certifique-se de que a porta admin (geralmente a mesma do pgbouncer, padrão 6432) esteja
   acessível a partir do host onde este serviço Go é executado.

## Configuração do sudoers (para start/stop/restart do serviço)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # validar a sintaxe
```

Edite `appuser` nesse arquivo para corresponder ao usuário que executa este binário Go. NÃO
conceda acesso sudo mais amplo do que essas 4 linhas de comandos.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | host do PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | porta do PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | usuário registrado em `admin_users` |
| `PGB_ADMIN_PASS` | - | senha do usuário admin |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | caminho do arquivo de configuração |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | caminho do arquivo userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | nome da unidade systemd |
| `PGB_LISTEN_ADDR` | `:8088` | endereço de escuta do servidor web |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | autenticação básica para a interface (OBRIGATÓRIO antes de usar fora do localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | caminho de armazenamento do nome do app/empresa (definido pelo menu Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | caminho de armazenamento do logo personalizado enviado pelo menu Branding |

## Executando

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Principais endpoints

- `GET /api/status` — status do serviço systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — SET em tempo de execução (limitado, verifique `SHOW CONFIG`)
- `GET /api/config-edit/raw` — lê todo o conteúdo do ini como seções
- `POST /api/config-edit/database-field` `{"database","field","value"}` — edita o ini + RELOAD automático
- `POST /api/config-edit/global-field` `{"field","value"}` — edita o ini + RELOAD automático
- `GET /api/branding` `/api/branding/logo` — identidade do app e logo (público, lido antes do login)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — apenas admin
- `POST /api/branding/logo` (multipart `logo`, máx. 2MB) `/ DELETE /api/branding/logo` — apenas admin

## Personalizando a identidade do app (Branding)

O menu **Branding** (apenas admin) permite alterar o nome do app, o subtítulo, o nome da
empresa/organização exibido no rodapé, e o logo (substituindo o ícone ◈ padrão) — exibidos na
barra lateral, na página de login e na aba do navegador. Todas essas configurações são salvas em
`PGB_BRANDING_FILE`/`PGB_LOGO_FILE` e persistem entre reinicializações do container, desde que a
pasta `/app/data` esteja montada como volume.

## Executando com Docker (PgBouncer em um servidor separado)

Como seu PgBouncer roda em outro servidor, o controle de start/stop/restart é feito via **SSH**,
e não via `systemctl` local dentro do container (o container não tem acesso ao systemd de outro
host). As conexões com o console de administração (`SHOW POOLS`, etc.) continuam funcionando
normalmente, pois é apenas uma conexão TCP comum à porta do PgBouncer — não é afetada pelo
container ou pela localização do servidor.

### 1. Preparar o servidor PgBouncer (remoto)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Em seguida, gere uma chave SSH na máquina onde você executará `docker compose build`, e instale a
chave pública no servidor PgBouncer:

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-do-servidor-pgbouncer>
```

Certifique-se também de que a porta admin do PgBouncer (padrão `6432`) esteja acessível a partir
da rede onde o container `pgbouncer-manager` é executado.

### 2. Configuração

```bash
cp .env.example .env
# edite o .env: preencha PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS, etc.
```

### 3. Build e execução

```bash
docker compose up -d --build
```

O app estará disponível em `http://<este-host>:8088`, com o dashboard completo (status, pools,
clients, stats, start/stop/restart via SSH, reload de configuração).

### Notas importantes

- A **aba "Configuration"** (alterar pool_mode) é desativada automaticamente quando
  `PGB_CONTROL_MODE=ssh`, pois esse endpoint edita `pgbouncer.ini` no sistema de arquivos local.
  No modo SSH, edite `pgbouncer.ini` diretamente no servidor PgBouncer (manualmente ou via seu
  próprio script/Ansible), depois clique em **Reload Config** na aba Overview — isso continua
  funcionando porque o `RELOAD` é enviado pelo console de administração do PgBouncer, e não pelo
  sistema de arquivos.
- A chave privada em `./secrets/pgb_ssh_key` é montada como um Docker secret (somente leitura
  dentro do container, nunca incluída na imagem). Não faça commit da pasta `secrets/` no git.
- Para segurança em produção, defina `knownHostsPath` em `handlers.NewAPI` (atualmente `""` =
  ignora a verificação de host key) com o caminho de um arquivo `known_hosts` contendo o
  fingerprint do servidor PgBouncer, para proteção contra ataques MITM.
- Se o PgBouncer for movido para o mesmo host do manager, basta definir `PGB_CONTROL_MODE=local`
  e executar o binário diretamente nesse host (não em um container) para acessar o systemd local
  — veja a seção "Configuração do sudoers" acima.

- Sempre execute isso atrás de uma VPN/reverse proxy com TLS, nunca exponha diretamente à
  internet.
- `PGB_UI_USER`/`PGB_UI_PASS` é apenas uma camada mínima de proteção na frente do app. O login em
  si já usa autenticação baseada em sessão com roles (admin vs. viewer, veja o menu **Users**) —
  certifique-se de alterar a senha da conta `admin` padrão imediatamente após o primeiro deploy.
- Um arquivo `.bak` é criado automaticamente antes de cada escrita em `pgbouncer.ini`.
