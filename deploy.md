# SGIPC 2.0 — VPS Deployment Guide

How to deploy this app to a fresh Linux VPS (Ubuntu 22.04 LTS is the target — Debian 12,
Ubuntu 24.04, and AlmaLinux 9 work with minor package-name changes). The end state:

- Frontend served on **https://sgipc.example.com**.
- Backend API on **https://api.sgipc.example.com**.
- HTTPS via Let's Encrypt.
- Queue worker + frontend node process managed by `systemd` so they survive reboots.
- Nginx in front of both as the public-facing reverse proxy.

Replace `sgipc.example.com` everywhere with your real domain.

---

## Table of contents

1.  [Architecture in production](#1-architecture-in-production)
2.  [Provision the server](#2-provision-the-server)
3.  [Install system dependencies](#3-install-system-dependencies)
4.  [Create the database](#4-create-the-database)
5.  [Clone the repo](#5-clone-the-repo)
6.  [Deploy the backend](#6-deploy-the-backend)
7.  [Deploy the frontend](#7-deploy-the-frontend)
8.  [Run things as services with `systemd`](#8-run-things-as-services-with-systemd)
9.  [Nginx + HTTPS](#9-nginx--https)
10. [DNS records](#10-dns-records)
11. [Verify the deployment](#11-verify-the-deployment)
12. [Updating to a new release](#12-updating-to-a-new-release)
13. [Backups](#13-backups)
14. [Optional: Docker-Compose deployment](#14-optional-docker-compose-deployment)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Architecture in production

```
Internet ──► Nginx :443 ─────► Next.js  node process on :3000  (sgipc.example.com)
                       └────► PHP-FPM 8.3 + Laravel public/   (api.sgipc.example.com)
                                       │
                                       └──► MySQL 8 on :3306 (localhost)
                                       └──► jobs table  ←─ queue:work systemd unit
                                                              │
                                                              ▼
                                                       Gmail SMTP, Cloudinary
```

- A single VPS hosts everything. For higher traffic you'd later move MySQL to a
  managed DB and the frontend to Vercel — but the same `.env` values work.
- We use **PHP-FPM** behind Nginx (rather than `php artisan serve`) because FPM is the
  production-grade runner with proper process management.
- The Next.js app runs as `npm run start` after a `npm run build`. There's no static
  export — server components depend on the live API.

---

## 2. Provision the server

Any VPS provider works (DigitalOcean, Hetzner, Linode, Vultr, AWS Lightsail). Pick the
smallest box that meets:

- 2 vCPU, 2 GB RAM minimum (4 GB recommended once the queue worker + node process
  are both running).
- 25 GB SSD.
- Ubuntu 22.04 LTS.

After creating the droplet, SSH in as root:

```bash
ssh root@YOUR.SERVER.IP
```

Create a non-root deploy user (everything below uses `deploy`):

```bash
adduser deploy
usermod -aG sudo deploy

# copy your SSH key onto the deploy user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# log out and back in as deploy
exit
ssh deploy@YOUR.SERVER.IP
```

Update the box:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ufw fail2ban unzip git curl
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## 3. Install system dependencies

### PHP 8.3 + extensions

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y \
  php8.3 php8.3-fpm php8.3-cli php8.3-mysql \
  php8.3-mbstring php8.3-xml php8.3-curl php8.3-bcmath \
  php8.3-zip php8.3-fileinfo php8.3-tokenizer php8.3-intl
```

### Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

### MySQL 8

```bash
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation     # set a strong root password
```

### Node.js 20 + PM2 alternative (we use systemd instead, but install Node)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version    # v20.x
npm --version
```

### Nginx + certbot

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

---

## 4. Create the database

```bash
sudo mysql
```

```sql
CREATE DATABASE sgipc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sgipc'@'localhost' IDENTIFIED BY 'GENERATE-A-LONG-PASSWORD';
GRANT ALL ON sgipc_db.* TO 'sgipc'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Generate the password with `openssl rand -base64 24` and **save it in your password
manager**. You'll paste it into `backend/.env` shortly.

---

## 5. Clone the repo

```bash
sudo mkdir -p /var/www
sudo chown deploy:deploy /var/www
cd /var/www
git clone https://github.com/ShahariarEmon112/SGIPC_2.0.git sgipc
cd sgipc
```

If the repo is private, configure a deploy key:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/sgipc_deploy -N ""
cat ~/.ssh/sgipc_deploy.pub
# paste into GitHub → repo Settings → Deploy keys → Add key (read-only is fine)
# add to your SSH config:
cat >> ~/.ssh/config <<'EOF'
Host github-sgipc
  HostName github.com
  User git
  IdentityFile ~/.ssh/sgipc_deploy
EOF
git clone git@github-sgipc:ShahariarEmon112/SGIPC_2.0.git sgipc
```

---

## 6. Deploy the backend

```bash
cd /var/www/sgipc/backend
cp .env.example .env
```

Edit `.env` (`nano .env`):

```ini
APP_NAME=SGIPC
APP_ENV=production
APP_DEBUG=false
APP_KEY=                                 # filled in by next command
APP_URL=https://api.sgipc.example.com
APP_TIMEZONE=Asia/Dhaka

LOG_CHANNEL=daily
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sgipc_db
DB_USERNAME=sgipc
DB_PASSWORD='paste-the-strong-password-here'

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
FILESYSTEM_DISK=local

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD='your-16-char-gmail-app-password'
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="SGIPC Club"

CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

FRONTEND_URL=https://sgipc.example.com
SANCTUM_STATEFUL_DOMAINS=sgipc.example.com
```

Install deps, generate the key, migrate, seed the admin only:

```bash
composer install --no-dev --optimize-autoloader

php artisan key:generate
php artisan migrate --force

# Seed JUST the admin so there's a way to log in. Skip the demo data on prod.
php artisan db:seed --class=AdminSeeder --force
php artisan db:seed --class=SiteSettingSeeder --force

php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> **Why no `--seed`?** The full seeder set is for development. On production you only
> want the admin user + the default site settings. Skip the rest unless you really do
> want 20 fake students in your database.

Configure CORS so the frontend domain is allowed. Open
`backend/config/cors.php` and confirm:

```php
'allowed_origins' => ['https://sgipc.example.com'],
'supports_credentials' => true,
```

Fix file permissions for storage and bootstrap/cache:

```bash
sudo chown -R deploy:www-data /var/www/sgipc/backend
sudo chmod -R 775 /var/www/sgipc/backend/storage
sudo chmod -R 775 /var/www/sgipc/backend/bootstrap/cache
```

---

## 7. Deploy the frontend

```bash
cd /var/www/sgipc/frontend
cp .env.local.example .env.local
nano .env.local
```

```ini
NEXT_PUBLIC_API_URL=https://api.sgipc.example.com/api
NEXT_PUBLIC_SITE_URL=https://sgipc.example.com
NEXTAUTH_URL=https://sgipc.example.com
NEXTAUTH_SECRET=PASTE-OUTPUT-OF-OPENSSL-RAND-BELOW
```

Generate the secret:

```bash
openssl rand -base64 32
```

Install dependencies and build:

```bash
npm ci
npm run build
```

`npm ci` is the production-safe install (uses the lock file exactly, fails if it
disagrees with `package.json`).

---

## 8. Run things as services with `systemd`

Three units: backend queue worker, frontend Node server. Nginx + PHP-FPM are already
systemd units.

### Queue worker

```bash
sudo tee /etc/systemd/system/sgipc-queue.service > /dev/null <<'UNIT'
[Unit]
Description=SGIPC Laravel queue worker
After=mysql.service

[Service]
Type=simple
User=deploy
Group=www-data
WorkingDirectory=/var/www/sgipc/backend
ExecStart=/usr/bin/php artisan queue:work --tries=3 --sleep=3 --max-time=3600
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now sgipc-queue
sudo systemctl status sgipc-queue --no-pager
```

`--max-time=3600` makes the worker exit cleanly every hour so systemd can restart it —
this is the recommended way to avoid memory creep in a long-running PHP process.

### Frontend Node process

```bash
sudo tee /etc/systemd/system/sgipc-web.service > /dev/null <<'UNIT'
[Unit]
Description=SGIPC Next.js frontend
After=network.target

[Service]
Type=simple
User=deploy
Group=www-data
WorkingDirectory=/var/www/sgipc/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now sgipc-web
sudo systemctl status sgipc-web --no-pager
```

(The backend Laravel app does **not** need a systemd unit because Nginx + PHP-FPM
already serve it.)

---

## 9. Nginx + HTTPS

### Backend vhost

```bash
sudo tee /etc/nginx/sites-available/sgipc-api > /dev/null <<'CONF'
server {
    listen 80;
    server_name api.sgipc.example.com;
    root /var/www/sgipc/backend/public;
    index index.php;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_read_timeout 60;
    }

    location ~ /\.(?!well-known).* { deny all; }
}
CONF

sudo ln -sf /etc/nginx/sites-available/sgipc-api /etc/nginx/sites-enabled/sgipc-api
```

### Frontend vhost

```bash
sudo tee /etc/nginx/sites-available/sgipc-web > /dev/null <<'CONF'
server {
    listen 80;
    server_name sgipc.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60;
    }
}
CONF

sudo ln -sf /etc/nginx/sites-available/sgipc-web /etc/nginx/sites-enabled/sgipc-web
```

Disable the default vhost and reload:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t            # must say "test is successful"
sudo systemctl reload nginx
```

### Get certificates

Make sure DNS already points the domains at this server (see §10), then:

```bash
sudo certbot --nginx \
  -d sgipc.example.com \
  -d api.sgipc.example.com \
  --agree-tos -m you@example.com --redirect --no-eff-email
```

Certbot edits the Nginx configs to add `listen 443 ssl;` blocks and an HTTP→HTTPS
redirect. It also installs a renew timer; verify it:

```bash
sudo systemctl list-timers | grep certbot
sudo certbot renew --dry-run
```

---

## 10. DNS records

At your DNS provider create two A records:

| Type | Host | Value |
| --- | --- | --- |
| A | `sgipc` (or `@` for apex) | `YOUR.SERVER.IP` |
| A | `api.sgipc` | `YOUR.SERVER.IP` |

Wait a few minutes for propagation, then `dig sgipc.example.com +short` should return
your IP before you run `certbot`.

---

## 11. Verify the deployment

```bash
curl -sS https://api.sgipc.example.com/up                  # → "" with HTTP 200
curl -sS https://api.sgipc.example.com/api/settings | head # → {"success":true,...}
curl -sS -o /dev/null -w '%{http_code}\n' https://sgipc.example.com   # → 200
```

In your browser:

1. https://sgipc.example.com — homepage with hero.
2. https://sgipc.example.com/login — log in as `admin@sgipc.kuet.ac.bd / admin123456`.
3. **Immediately change the admin password**: go to `/profile`, set a strong one.
4. Submit a real registration to test the email pipeline.

---

## 12. Updating to a new release

```bash
cd /var/www/sgipc

# Pull
git pull --ff-only

# Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache
sudo systemctl restart sgipc-queue          # picks up new mailable code

# Frontend
cd ../frontend
npm ci
npm run build
sudo systemctl restart sgipc-web

# PHP-FPM picks up new PHP code via opcache reset on the config:cache step,
# but if you change config/, also:
sudo systemctl reload php8.3-fpm
```

A short downtime is acceptable on a small site. For zero-downtime you'd use an
atomic-symlink release scheme (`deployer`, `envoy`, etc.) — out of scope for this guide.

---

## 13. Backups

### Database

Set up a daily `mysqldump` cron:

```bash
sudo mkdir -p /var/backups/sgipc
sudo tee /etc/cron.daily/sgipc-db-backup > /dev/null <<'CRON'
#!/usr/bin/env bash
set -e
ts=$(date +%F)
mysqldump --single-transaction --quick sgipc_db | gzip > /var/backups/sgipc/db-$ts.sql.gz
# Keep last 14 days
find /var/backups/sgipc -name 'db-*.sql.gz' -mtime +14 -delete
CRON
sudo chmod +x /etc/cron.daily/sgipc-db-backup
```

For real disaster recovery, also `rsync` `/var/backups/sgipc` to a remote location
(S3, Backblaze B2, or another VPS).

### Code & uploads

- The code lives in git — restore is just `git clone` + the `.env` file from your
  password manager.
- User-uploaded images live in **Cloudinary**, not on the VPS. They survive any
  rebuild as long as you keep the same Cloudinary account.

---

## 14. Optional: Docker-Compose deployment

If you'd rather containerise everything, a minimal `docker-compose.yml` at the repo root
looks like this. (Not committed — copy if you want it.)

```yaml
version: "3.9"
services:
  db:
    image: mysql:8
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: sgipc_db
      MYSQL_USER: sgipc
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes: ["dbdata:/var/lib/mysql"]

  api:
    build: ./backend/.docker          # the existing dev image works for prod too
    restart: unless-stopped
    working_dir: /app
    volumes: ["./backend:/app"]
    env_file: ./backend/.env
    command: ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
    depends_on: [db]
    ports: ["8000:8000"]

  queue:
    build: ./backend/.docker
    restart: unless-stopped
    working_dir: /app
    volumes: ["./backend:/app"]
    env_file: ./backend/.env
    command: ["php", "artisan", "queue:work", "--tries=3", "--sleep=3"]
    depends_on: [db]

  web:
    image: node:20-alpine
    restart: unless-stopped
    working_dir: /app
    volumes: ["./frontend:/app"]
    env_file: ./frontend/.env.local
    command: sh -c "npm ci && npm run build && npm run start"
    depends_on: [api]
    ports: ["3000:3000"]

volumes:
  dbdata:
```

Front this with Nginx + certbot the same way as §9, just proxying to `:8000` and
`:3000`.

---

## 15. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Nginx returns 502 from API | PHP-FPM not running or wrong socket path | `sudo systemctl status php8.3-fpm`; confirm `fastcgi_pass` matches `/run/php/php8.3-fpm.sock`. |
| Front-end returns 502 | Node process crashed | `sudo journalctl -u sgipc-web -n 100`. Most likely a missing env var. |
| Login works but every authed call 401s | NextAuth cookie domain mismatch | `NEXTAUTH_URL` must match the browser URL exactly, including https. |
| CORS error in browser console | API CORS doesn't include the front-end origin | Edit `backend/config/cors.php`, re-run `php artisan config:cache`, reload Nginx. |
| Emails never arrive | Queue worker stopped, or Gmail blocked the sender | `sudo systemctl restart sgipc-queue`; check Gmail App Password; check `storage/logs/laravel.log`. |
| `php artisan migrate` says "no driver" | Wrong PHP version in CLI vs FPM | `php -v` should show 8.3; `update-alternatives --config php` if not. |
| Disk fills up | Laravel daily logs not rotated | Add `/etc/logrotate.d/sgipc`: rotate `storage/logs/*.log` weekly. |
| MySQL won't connect | `bind-address` locked to localhost — fine for us; for remote DB switch to `0.0.0.0` + firewall rules. |
| HTTPS redirect loop | `proxy_set_header X-Forwarded-Proto $scheme` missing | Re-add to the front-end vhost, reload Nginx. |
| 413 on image upload | `client_max_body_size` too small | Bump to `20M` (or higher) in the API vhost. |

---

You're live. From here, point your members at the URL and use the admin panel to
update the content. When a CVE or major Laravel/Next.js release lands, follow §12 to
roll forward.
