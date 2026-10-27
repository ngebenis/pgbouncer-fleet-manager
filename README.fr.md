# PgBouncer Manager

*[Bahasa Indonesia](README.md) · [English](README.en.md) · [中文](README.zh.md) · [हिन्दी](README.hi.md) · [Español](README.es.md) · [Português](README.pt.md) · [العربية](README.ar.md) · [বাংলা](README.bn.md) · [Русский](README.ru.md) · [ไทย](README.th.md) · [ខ្មែរ](README.km.md) · [Tagalog](README.tl.md) · [Tiếng Việt](README.vi.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Polski](README.pl.md) · [Italiano](README.it.md) · [Türkçe](README.tr.md) · [தமிழ்](README.ta.md) · [فارسی](README.fa.md) · [Українська](README.uk.md) · [Deutsch](README.de.md) · [Nederlands](README.nl.md)*

🍲 **[Découvrez la Galerie Culinaire et Culturelle d'Indonésie →](CULTURE.md)**

Une interface web légère pour surveiller et contrôler PgBouncer : état des pools/clients/servers/stats,
démarrage/arrêt/redémarrage du service, rechargement de la configuration, pause/reprise, et
changement du pool_mode par base de données.

## Captures d'écran

| Connexion | Dashboard | Pools |
|---|---|---|
| ![Connexion](docs/screenshots/00-login.png) | ![Dashboard](docs/screenshots/01-dashboard.png) | ![Pools](docs/screenshots/02-pools.png) |

| Clients | Serveurs | Statistiques |
|---|---|---|
| ![Clients](docs/screenshots/03-clients.png) | ![Serveurs](docs/screenshots/04-servers.png) | ![Statistiques](docs/screenshots/05-stats.png) |

| Bases de données | Configuration | Gérer les Serveurs |
|---|---|---|
| ![Bases de données](docs/screenshots/06-databases.png) | ![Configuration](docs/screenshots/07-configuration.png) | ![Gérer les Serveurs](docs/screenshots/08-manage-servers.png) |

| Utilisateurs | Journal d\'Audit | Sauvegarde & Restauration |
|---|---|---|
| ![Utilisateurs](docs/screenshots/09-users.png) | ![Journal d\'Audit](docs/screenshots/10-audit-log.png) | ![Sauvegarde & Restauration](docs/screenshots/11-backup-restore.png) |

| Identité |
|---|
| ![Identité](docs/screenshots/12-identity.png) |

## Stack technique
- Backend : Go + Gin + pgx (connexion directe à la console d'administration de PgBouncer via le protocole Postgres)
- Frontend : Vue 3 + TypeScript + Vite (déjà présent dans le dossier `web/`)

## Lancer le frontend (développement)

```bash
cd web
npm install
npm run dev
```

Le serveur de développement Vite redirige `/api/*` vers `http://localhost:8088` (voir
`web/vite.config.ts`), lancez donc d'abord le backend Go sur ce port.

## Compiler le frontend pour la production

```bash
cd web
npm run build
```

Le résultat de la compilation est placé dans `web/dist/`, et le backend Go (`cmd/server/main.go`)
est déjà configuré pour servir automatiquement ce dossier en tant que fichiers statiques — après
la compilation, il suffit donc d'exécuter le binaire Go, sans besoin de Node.js en production.

## Structure du frontend

```
web/src/
  App.vue                    # mise en page du tableau de bord + navigation par onglets
  main.ts                    # point d'entrée
  style.css                  # tokens de design (thème sombre)
  types/api.ts                # types des réponses de l'API
  composables/api.ts          # client axios pour tous les endpoints du backend
  composables/usePolling.ts   # rafraîchissement automatique des données toutes les quelques secondes (en pause si l'onglet est caché)
  components/
    ServiceStatusCard.vue     # statut + boutons start/stop/restart/reload
    PoolsCard.vue              # SHOW POOLS + pause/reprise
    ReadOnlyCard.vue           # onglets clients/servers/stats/databases (réutilisable)
    ConfigEditorCard.vue       # changer le pool_mode par base de données + paramètres globaux
    DataTable.vue              # tableau générique pour les résultats des commandes SHOW
```

## Prérequis PgBouncer

1. Assurez-vous qu'un utilisateur admin existe dans `pgbouncer.ini` :
   ```ini
   [pgbouncer]
   admin_users = pgbouncer_admin
   ```
2. Ajoutez les identifiants de cet utilisateur admin dans `userlist.txt`.
3. Assurez-vous que le port admin (généralement le même que celui de pgbouncer, par défaut 6432)
   est accessible depuis l'hôte où ce service Go s'exécute.

## Configuration de sudoers (pour start/stop/restart du service)

```bash
sudo cp deploy/sudoers-pgbouncer-manager /etc/sudoers.d/pgbouncer-manager
sudo visudo -c   # valider la syntaxe
```

Modifiez `appuser` dans ce fichier pour qu'il corresponde à l'utilisateur exécutant ce binaire Go.
N'accordez PAS d'accès sudo plus large que ces 4 lignes de commandes.

## Variables d'environnement

| Variable | Valeur par défaut | Description |
|---|---|---|
| `PGB_ADMIN_HOST` | `127.0.0.1` | hôte de PgBouncer |
| `PGB_ADMIN_PORT` | `6432` | port de PgBouncer |
| `PGB_ADMIN_USER` | `pgbouncer_admin` | utilisateur enregistré dans `admin_users` |
| `PGB_ADMIN_PASS` | - | mot de passe de l'utilisateur admin |
| `PGB_INI_PATH` | `/etc/pgbouncer/pgbouncer.ini` | chemin du fichier de configuration |
| `PGB_USERLIST_PATH` | `/etc/pgbouncer/userlist.txt` | chemin du fichier userlist |
| `PGB_SERVICE_NAME` | `pgbouncer` | nom de l'unité systemd |
| `PGB_LISTEN_ADDR` | `:8088` | adresse d'écoute du serveur web |
| `PGB_UI_USER` / `PGB_UI_PASS` | - | authentification basique pour l'interface (OBLIGATOIRE avant toute utilisation en dehors de localhost) |
| `PGB_BRANDING_FILE` | `/app/data/branding.json` | chemin de stockage du nom de l'app/entreprise (configuré via le menu Branding) |
| `PGB_LOGO_FILE` | `/app/data/branding-logo` | chemin de stockage du logo personnalisé téléversé via le menu Branding |

## Lancement

```bash
go mod tidy
export PGB_ADMIN_PASS=xxxx
export PGB_UI_USER=admin
export PGB_UI_PASS=xxxx
go run ./cmd/server
```

## Principaux endpoints

- `GET /api/status` — statut du service systemd (active/inactive/failed)
- `GET /api/pools` `/api/clients` `/api/servers` `/api/stats` `/api/databases` `/api/config` `/api/lists` `/api/version`
- `POST /api/service/{start,stop,restart}`
- `POST /api/admin/reload`
- `POST /api/admin/pause` `{"database": "optional"}`
- `POST /api/admin/resume` `{"database": "optional"}`
- `POST /api/admin/kill` `{"database": "required"}`
- `POST /api/admin/set` `{"key","value"}` — SET à l'exécution (limité, voir `SHOW CONFIG`)
- `GET /api/config-edit/raw` — lit tout le contenu du fichier ini sous forme de sections
- `POST /api/config-edit/database-field` `{"database","field","value"}` — modifie le ini + RELOAD automatique
- `POST /api/config-edit/global-field` `{"field","value"}` — modifie le ini + RELOAD automatique
- `GET /api/branding` `/api/branding/logo` — identité de l'application et logo (public, lu avant connexion)
- `PUT /api/branding` `{"company_name","app_name","app_sub"}` — admin uniquement
- `POST /api/branding/logo` (multipart `logo`, max. 2MB) `/ DELETE /api/branding/logo` — admin uniquement

## Personnaliser l'identité de l'application (Branding)

Le menu **Branding** (admin uniquement) permet de modifier le nom de l'application, le sous-titre,
le nom de l'entreprise/organisation affiché en pied de page, et le logo (remplaçant l'icône ◈ par
défaut) — affichés dans la barre latérale, la page de connexion et l'onglet du navigateur. Tous
ces réglages sont enregistrés dans `PGB_BRANDING_FILE`/`PGB_LOGO_FILE` et persistent après
redémarrage du conteneur tant que le dossier `/app/data` est monté en tant que volume.

## Exécution avec Docker (PgBouncer sur un serveur séparé)

Comme votre PgBouncer s'exécute sur un autre serveur, le contrôle start/stop/restart se fait via
**SSH**, et non via `systemctl` local dans le conteneur (le conteneur n'a pas accès au systemd
d'un autre hôte). Les connexions à la console d'administration (`SHOW POOLS`, etc.) continuent de
fonctionner normalement car il s'agit simplement d'une connexion TCP classique vers le port de
PgBouncer — non affectée par le conteneur ni l'emplacement du serveur.

### 1. Préparer le serveur PgBouncer (distant)

```bash
sudo useradd -m -s /bin/bash pgbouncer_ctl
sudo cp deploy/sudoers-remote-pgbouncer-host /etc/sudoers.d/pgbouncer-manager
sudo visudo -c
```

Générez ensuite une clé SSH sur la machine où vous exécuterez `docker compose build`, et installez
la clé publique sur le serveur PgBouncer :

```bash
ssh-keygen -t ed25519 -f ./secrets/pgb_ssh_key -N "" -C "pgbouncer-manager"
ssh-copy-id -i ./secrets/pgb_ssh_key.pub pgbouncer_ctl@<ip-serveur-pgbouncer>
```

Assurez-vous également que le port admin de PgBouncer (par défaut `6432`) est accessible depuis
le réseau où s'exécute le conteneur `pgbouncer-manager`.

### 2. Configuration

```bash
cp .env.example .env
# modifiez .env : renseignez PGB_ADMIN_HOST, PGB_SSH_HOST, PGB_UI_USER/PASS, etc.
```

### 3. Compiler et lancer

```bash
docker compose up -d --build
```

L'application sera disponible sur `http://<cet-hôte>:8088`, avec le tableau de bord complet
(status, pools, clients, stats, start/stop/restart via SSH, rechargement de la configuration).

### Notes importantes

- L'**onglet "Configuration"** (changement de pool_mode) est automatiquement désactivé lorsque
  `PGB_CONTROL_MODE=ssh`, car cet endpoint modifie `pgbouncer.ini` sur le système de fichiers
  local. En mode SSH, modifiez `pgbouncer.ini` directement sur le serveur PgBouncer
  (manuellement ou via votre propre script/Ansible), puis cliquez sur **Reload Config** dans
  l'onglet Overview — cela fonctionne toujours car `RELOAD` est envoyé via la console
  d'administration de PgBouncer, et non via le système de fichiers.
- La clé privée dans `./secrets/pgb_ssh_key` est montée en tant que secret Docker (lecture seule
  dans le conteneur, jamais intégrée à l'image). Ne commitez jamais le dossier `secrets/` sur git.
- Pour la sécurité en production, renseignez `knownHostsPath` dans `handlers.NewAPI` (actuellement
  `""` = vérification de la clé d'hôte désactivée) avec le chemin d'un fichier `known_hosts`
  contenant l'empreinte du serveur PgBouncer, afin de vous protéger des attaques MITM.
- Si PgBouncer est un jour déplacé sur le même hôte que le manager, il suffit de définir
  `PGB_CONTROL_MODE=local` et d'exécuter le binaire directement sur cet hôte (pas dans un
  conteneur) pour pouvoir accéder au systemd local — voir la section "Configuration de sudoers"
  ci-dessus.

- Exécutez toujours ceci derrière un VPN/reverse proxy avec TLS, ne l'exposez jamais directement
  sur internet.
- `PGB_UI_USER`/`PGB_UI_PASS` n'est qu'une protection minimale en amont de l'application. La
  connexion elle-même utilise déjà une authentification par session avec des rôles (admin vs.
  viewer, voir le menu **Users**) — assurez-vous de changer le mot de passe du compte `admin` par
  défaut immédiatement après le premier déploiement.
- Un fichier `.bak` est créé automatiquement avant chaque écriture dans `pgbouncer.ini`.
