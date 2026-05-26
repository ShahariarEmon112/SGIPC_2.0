# SGIPC Backend (Laravel 11)

REST API for the SGIPC club website. Auth via Sanctum tokens, MySQL persistence, queued SMTP mail, Cloudinary image uploads.

## Setup

```bash
composer install
cp .env.example .env
# Fill in DB, MAIL, CLOUDINARY values
php artisan key:generate
php artisan migrate:fresh --seed
```

## Run

```bash
php artisan serve              # http://localhost:8000
php artisan queue:work         # in a second terminal — required for emails
```

## Database / seeders

| Command                                          | Purpose                                  |
| ------------------------------------------------ | ---------------------------------------- |
| `php artisan migrate:fresh --seed`               | Drop all tables, re-migrate, re-seed     |
| `php artisan db:seed`                            | Re-run all seeders (idempotent)          |
| `php artisan db:seed --class=BlogSeeder`         | Run a single seeder                      |
| `php artisan migrate`                            | Apply new migrations only                |
| `php artisan migrate:rollback`                   | Roll back the last batch                 |

### Seeded data

| Table             | Rows | Notes                                              |
| ----------------- | ---: | -------------------------------------------------- |
| `users`           |   21 | 1 admin, 15 approved+verified, 3 pending+verified, 2 pending+unverified |
| `site_settings`   |   17 | CMS values for hero, about, mission, stats, footer |
| `events`          |    8 | Past KUET / SGIPC events                           |
| `contests`        |    5 | 2 upcoming, 3 past                                 |
| `achievements`    |   10 | ICPC and inter-university results                  |
| `team_gallery`    |   12 | Contest team photos                                |
| `blogs`           |   15 | 12 approved, 2 pending, 1 rejected                 |
| `blog_comments`   |   30 | 25 visible, 3 reported, 2 hidden                   |
| `blog_likes`      |   50 | Random distribution, unique per (blog, user)       |
| `comment_reports` |    3 | All pending                                        |

## Default credentials (post-seed)

| Role   | Email                             | Password         |
| ------ | --------------------------------- | ---------------- |
| Admin  | `admin@sgipc.kuet.ac.bd`          | `admin123456`    |
| Client | any `*@student.kuet.ac.bd`        | `password123`    |

## Running PHP via Docker (if host PHP isn't installed)

Build the dev CLI image once:

```bash
docker build -t sgipc-cli .docker -f .docker/Dockerfile.cli
```

Then alias for the current shell:

```bash
alias artisan='docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app --network host sgipc-cli php artisan'
alias composer='docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app sgipc-cli composer'
```

All `php artisan …` and `composer …` commands in this README will then work transparently.
