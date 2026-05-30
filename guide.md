# SGIPC 2.0 — Local Setup Guide

How to clone this repo onto a fresh PC, install everything, seed the database, and run
the site at `http://localhost:3000` with the API at `http://localhost:8000`.

If anything below fails, see **[Troubleshooting](#troubleshooting)** at the bottom.

---

## 1. What you need installed

| Tool | Version | Check it |
| --- | --- | --- |
| Git | any recent | `git --version` |
| MySQL Server | 8.0+ | `mysql --version` |
| Node.js | 20+ | `node --version` |
| npm | 10+ (ships with Node) | `npm --version` |
| PHP | 8.2 – 8.4 with `pdo_mysql`, `mbstring`, `bcmath`, `curl`, `openssl`, `fileinfo`, `tokenizer`, `xml` | `php -v` and `php -m` |
| Composer | 2.x | `composer --version` |

**If you do not have PHP on your machine** you can run the backend through Docker
instead — see [§7. The Docker fallback](#7-the-docker-fallback). Everything else still
needs Node and MySQL on the host.

### Quick install commands

**Ubuntu / Debian:**
```bash
sudo apt update
sudo apt install -y git mysql-server nodejs npm php8.3 php8.3-cli php8.3-mysql \
  php8.3-mbstring php8.3-xml php8.3-curl php8.3-bcmath php8.3-zip php8.3-fileinfo \
  unzip
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
```

**macOS (Homebrew):**
```bash
brew install git mysql node php composer
brew services start mysql
```

**Windows:** use [Laragon](https://laragon.org/) (bundles PHP + MySQL + Composer) plus
the official Node.js installer.

---

## 2. Get the code

```bash
git clone https://github.com/ShahariarEmon112/SGIPC_2.0.git
cd SGIPC_2.0
```

The folder layout you should see:

```
SGIPC_2.0/
├── backend/    ← Laravel API
├── frontend/   ← Next.js site
├── SOP.md
├── deploy.md
└── guide.md
```

---

## 3. Create the database

Log into MySQL (use whatever user you set up — `root` by default after
`mysql_secure_installation`):

```bash
sudo mysql           # Ubuntu/Debian
# or
mysql -u root -p     # if you have a password
```

Run:

```sql
CREATE DATABASE sgipc_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional: create a dedicated user instead of using root
CREATE USER 'sgipc'@'localhost' IDENTIFIED BY 'change-me';
GRANT ALL ON sgipc_db.* TO 'sgipc'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

---

## 4. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` in your editor and fill in:

```ini
APP_URL=http://localhost:8000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sgipc_db
DB_USERNAME=root          # or sgipc
DB_PASSWORD=your-password

QUEUE_CONNECTION=database

# Gmail SMTP (use an App Password, NOT your account password)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=youraddress@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=youraddress@gmail.com
MAIL_FROM_NAME="SGIPC Club"

# Cloudinary — sign up at https://cloudinary.com/users/register/free
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

FRONTEND_URL=http://localhost:3000
```

> **Gmail App Password**: in your Google account, enable 2-Step Verification, then go to
> https://myaccount.google.com/apppasswords and generate a 16-character password.
> Use it as `MAIL_PASSWORD`. Regular Gmail passwords no longer work for SMTP.
>
> **DB passwords with `$` in them**: wrap the value in single quotes, e.g.
> `DB_PASSWORD='Takay$ane'` — otherwise `phpdotenv` treats `$ane` as a variable.

Install PHP dependencies and generate the app key:

```bash
composer install
php artisan key:generate
```

Run migrations and seeders:

```bash
php artisan migrate:fresh --seed
```

You should see each migration tick green, then the seeders run. When it finishes
verify the data:

```bash
php artisan tinker --execute="echo \App\Models\User::count();"
# expected: 21  (1 admin + 20 seeded members)
```

---

## 5. Run the backend

You need **two** terminal tabs open in `backend/`:

**Tab A — the API server:**
```bash
php artisan serve
# Server running on [http://127.0.0.1:8000]
```

**Tab B — the queue worker (handles emails):**
```bash
php artisan queue:work --tries=3 --sleep=3
```

Test it from a third terminal:
```bash
curl http://localhost:8000/up           # → "" with HTTP 200
curl http://localhost:8000/api/events   # → JSON envelope with 8 seeded events
```

---

## 6. Configure and run the frontend

In a new terminal:

```bash
cd frontend
cp .env.local.example .env.local
```

Open `frontend/.env.local` and set:

```ini
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=PASTE-OUTPUT-OF-COMMAND-BELOW
```

Generate the secret (it must be 32+ random bytes):

```bash
openssl rand -base64 32
```

Install Node deps and start the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the homepage should render with the matrix-rain hero and
seeded content.

---

## 7. The Docker fallback

If you don't want to install PHP system-wide, build the dev image bundled with the
repo and use it for every `php` / `composer` / `artisan` command.

```bash
cd backend
docker build -t sgipc-cli .docker
```

Now wrap any PHP command with this prefix:

```bash
docker run --rm -u $(id -u):$(id -g) \
  -v "$PWD":/app -w /app --network host \
  sgipc-cli  <your-command-here>
```

Examples:

```bash
# composer install
docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app --network host sgipc-cli composer install

# migrate + seed
docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app --network host sgipc-cli php artisan migrate:fresh --seed

# Long-running API server (background container)
docker run -d --rm --name sgipc-api \
  -u $(id -u):$(id -g) -v "$PWD":/app -w /app --network host \
  sgipc-cli php artisan serve --host=0.0.0.0 --port=8000

# Long-running queue worker (background container)
docker run -d --rm --name sgipc-queue \
  -u $(id -u):$(id -g) -v "$PWD":/app -w /app --network host \
  sgipc-cli php artisan queue:work --tries=3 --sleep=3
```

Stop the long-running containers:
```bash
docker kill sgipc-api sgipc-queue
```

`--network host` makes the container reach MySQL on the host's `127.0.0.1:3306` and
exposes port 8000 directly. On macOS / Windows Docker Desktop you can't use
`--network host`; use `-p 8000:8000` and set `DB_HOST=host.docker.internal` in
`backend/.env` instead.

---

## 8. Default seeded credentials

After `php artisan migrate:fresh --seed`:

| Who | Email | Password |
| --- | --- | --- |
| Admin | `admin@sgipc.kuet.ac.bd` | `admin123456` |
| Member (any) | any `*@student.kuet.ac.bd` seeded user, e.g. `1900100*@student.kuet.ac.bd` | `password123` |

To list the members the seeder created:

```bash
php artisan tinker --execute="\App\Models\User::pluck('email')->each(fn(\$e)=>print(\$e.\"\\n\"));"
```

---

## 9. Useful commands

### Backend (run from `backend/`)

```bash
# Drop all tables and re-seed from scratch
php artisan migrate:fresh --seed

# Re-run only the seeders (without dropping tables)
php artisan db:seed

# Run just one seeder
php artisan db:seed --class=BlogSeeder

# Roll back the last migration batch
php artisan migrate:rollback

# Clear caches if a config change is ignored
php artisan config:clear && php artisan cache:clear

# Inspect a model interactively
php artisan tinker

# Tail the application log
tail -f storage/logs/laravel.log
```

### Frontend (run from `frontend/`)

```bash
npm run dev          # dev server on :3000 (hot reload)
npm run build        # production build
npm run start        # serve the production build on :3000
npm run lint         # ESLint
```

---

## 10. Verify the full registration flow end-to-end

Once everything is running, you can confirm the email + verification flow works:

1. Open http://localhost:3000/register and submit the form using a real email you own.
2. The browser redirects to `/verify-email?email=…`.
3. Within ~10 seconds the queue worker dispatches an SMTP message; check the inbox for
   the 6-digit code.
4. Enter the code → success message → "Go to login".
5. Try to log in — you'll see `account_pending`.
6. Open another browser tab, sign in as admin, go to **Members → Pending**, approve.
7. Now log in as the new user.

If the email never arrives:

- Confirm `php artisan queue:work` is running and shows the job as **processed**.
- Check `storage/logs/laravel.log` — Gmail rejects bad app passwords with a clear error.
- During development you can change `MAIL_MAILER=log` so emails are dumped to the log
  file instead of being sent.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `php artisan serve` says "could not find driver" | `pdo_mysql` PHP extension missing | `sudo apt install php8.3-mysql` (Linux) then restart the terminal. |
| Migrations fail with "Access denied for user" | `DB_USERNAME` / `DB_PASSWORD` mismatch | Re-check `backend/.env`. If your password has `$` in it, single-quote the value. |
| Front-end says "Network Error" on every call | API not running on `:8000` or CORS misconfigured | Confirm `curl http://localhost:8000/up` returns 200; check `backend/config/cors.php` includes your frontend origin. |
| 419 / CSRF errors on login | Sanctum's stateful mode was re-enabled | This project intentionally uses bearer tokens. Make sure `bootstrap/app.php` does **not** call `$middleware->statefulApi()`. |
| Emails never arrive | Queue worker not running, or Gmail blocked the password | Run `php artisan queue:work`; switch to an App Password; check the log. |
| `verify-email` page says "expired" right away | Server clock skew or 15-minute TTL really did pass | Click **Resend code** to get a fresh one. |
| `MERGE`-style errors when re-seeding | A previous failed seed left orphan rows | `php artisan migrate:fresh --seed` (drops and rebuilds). |
| Hydration error on a page | A client component used `new Date()` or `Math.random()` in its initial render | Move that into `useEffect` so the SSR markup is deterministic. |
| Next.js says "Port 3000 already in use" | A previous `npm run dev` is still running | `pkill -f "next-server"` (Linux/macOS) then retry. |
| Cloudinary uploads return 500 | `CLOUDINARY_URL` malformed | Use exactly the URL Cloudinary's dashboard shows under "API Environment variable". |

---

You are done. You now have a fully running clone of SGIPC 2.0 with realistic seed data,
working email verification, and an admin who can approve members. From here jump to
**SOP.md** to learn how the code is structured, or to **deploy.md** when you're ready
to put this on a real server.
