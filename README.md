# SGIPC 2.0

Monorepo for the **Special Group Interested in Programming Contest** (SGIPC) club website at KUET.

- **`backend/`** — Laravel 11 REST API (PHP 8.2+, MySQL 8+, Sanctum auth, Cloudinary uploads, queued SMTP mail)
- **`frontend/`** — Next.js 14 (App Router, TypeScript, Tailwind, shadcn/ui, NextAuth)

---

## Quickstart

### Prerequisites

- PHP 8.2+ with extensions: `pdo_mysql`, `mbstring`, `tokenizer`, `xml`, `curl`, `openssl`, `bcmath`, `fileinfo`
- Composer 2.x
- Node 20+ and npm 10+
- MySQL 8+ running locally with a database named `sgipc_db`
- (Optional) Docker — used as a PHP runtime substitute on machines without PHP installed locally

### Backend

```bash
cd backend
cp .env.example .env
# fill in DB, MAIL, CLOUDINARY values in .env
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve            # http://localhost:8000
php artisan queue:work       # in a second terminal — required for emails
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# fill in NEXTAUTH_SECRET (openssl rand -base64 32)
npm install
npm run dev                  # http://localhost:3000
```

---

## Default credentials (seeded)

| Role   | Email                          | Password         |
| ------ | ------------------------------ | ---------------- |
| Admin  | `admin@sgipc.kuet.ac.bd`       | `admin123456`    |
| Client | any seeded `*@student.kuet.ac.bd` | `password123` |

---

## Repository structure

```
SGIPC_2.0/
├── backend/      Laravel 11 API
├── frontend/     Next.js 14 App Router
├── .env.example  Root reference of env vars
└── README.md
```

See `backend/README.md` for the full list of artisan commands (migrations, seeders, queue, fresh installs).
