# SGIPC 2.0 — Standard Operating Procedure (SOP)

A full, code-level walkthrough of how this application works. Aimed at a beginner who needs
to explain the project end-to-end. Read it top-to-bottom once, then use the table of
contents to jump back when you need a refresher.

---

## Table of contents

1.  [What this app is](#1-what-this-app-is)
2.  [The stack and why each piece exists](#2-the-stack-and-why-each-piece-exists)
3.  [How a request flows through the system](#3-how-a-request-flows-through-the-system)
4.  [Repository layout](#4-repository-layout)
5.  [Backend deep dive](#5-backend-deep-dive)
    1.  [Bootstrap & configuration](#51-bootstrap--configuration)
    2.  [Database schema (every table)](#52-database-schema-every-table)
    3.  [Models (every file)](#53-models-every-file)
    4.  [The `ApiResponse` trait](#54-the-apiresponse-trait)
    5.  [Form requests (validation)](#55-form-requests-validation)
    6.  [Middleware](#56-middleware)
    7.  [Public controllers](#57-public-controllers)
    8.  [Authenticated controllers](#58-authenticated-controllers)
    9.  [Admin controllers](#59-admin-controllers)
    10. [Routes file](#510-routes-file)
    11. [Cloudinary service](#511-cloudinary-service)
    12. [Mail + queues](#512-mail--queues)
    13. [Migrations](#513-migrations)
    14. [Seeders + factories](#514-seeders--factories)
6.  [Frontend deep dive](#6-frontend-deep-dive)
    1.  [App Router crash course](#61-app-router-crash-course)
    2.  [Root files](#62-root-files)
    3.  [The `lib/` folder](#63-the-lib-folder)
    4.  [Types](#64-types)
    5.  [Route groups & layouts](#65-route-groups--layouts)
    6.  [Public pages](#66-public-pages)
    7.  [Auth pages](#67-auth-pages)
    8.  [Profile page](#68-profile-page)
    9.  [Admin pages](#69-admin-pages)
    10. [Public components](#610-public-components)
    11. [Admin components](#611-admin-components)
    12. [UI primitives](#612-ui-primitives)
7.  [End-to-end feature walkthroughs](#7-end-to-end-feature-walkthroughs)
    1.  [A visitor lands on the homepage](#71-a-visitor-lands-on-the-homepage)
    2.  [Registration → verification → approval → login](#72-registration--verification--approval--login)
    3.  [Writing and publishing a blog](#73-writing-and-publishing-a-blog)
    4.  [Admin moderates a comment](#74-admin-moderates-a-comment)
8.  [Environment variables](#8-environment-variables)
9.  [Security model](#9-security-model)
10. [Caching, revalidation, performance](#10-caching-revalidation-performance)
11. [Glossary for beginners](#11-glossary-for-beginners)

---

## 1. What this app is

SGIPC 2.0 is the public website + content management system for the **Special Group
Interested in Programming Contest** club at KUET (Khulna University of Engineering &
Technology). It has three audiences:

| Audience      | What they can do                                                              |
| ------------- | ----------------------------------------------------------------------------- |
| Visitor       | Browse public pages: home, about, events, contests, achievements, leaderboard, gallery, blog, resources. |
| Member        | Register, verify email, await approval, log in, edit their profile, comment / like / report blog posts. |
| Admin         | Approve / reject members, edit site settings, CRUD on events / contests / achievements / gallery / blogs / leaderboard / resources, moderate comments & reports. |

The codebase is split into two top-level folders:

- `backend/` — a **Laravel 11** REST API that owns the database and business logic.
- `frontend/` — a **Next.js 14** (App Router) site that renders pages and talks to the API.

They are completely separate processes: the API lives on port `8000`, the frontend on
port `3000`. They communicate over HTTP/JSON.

---

## 2. The stack and why each piece exists

### Backend

| Tool | Why it's there |
| --- | --- |
| **PHP 8.2+** | Language Laravel runs on. |
| **Laravel 11** | Web framework: routing, ORM, queue, mail, validation in one package. |
| **MySQL 8** | Relational database that stores everything. |
| **Laravel Sanctum** | Issues **bearer tokens** so a logged-in frontend user can call protected endpoints. We use the *token* mode, not the SPA-cookie mode. |
| **`cloudinary-labs/cloudinary-laravel`** | Server-side SDK that uploads images to Cloudinary so we never expose the API secret to the browser. |
| **`spatie/laravel-permission`** | Installed but not actively used — we gate admin with a simple `role === 'admin'` check on the `users` table, which is enough for a single-tier admin role. |
| **Queue (database driver)** | Email sending is slow; we push every mail onto a `jobs` table and a `php artisan queue:work` process drains it in the background. |

### Frontend

| Tool | Why it's there |
| --- | --- |
| **Next.js 14 (App Router)** | React framework with file-based routing, server components (data fetched on the server), and built-in caching. |
| **TypeScript** | Static types catch shape mismatches against the API before the browser sees them. |
| **Tailwind CSS** | Utility CSS — every visual rule lives in `className`, no separate `.css` files per component. |
| **shadcn/ui** (`Button`, `Card`, `Input`, `Label` in `components/ui/`) | Pre-built unstyled React components you copy into your repo and own outright. |
| **NextAuth** | Manages the browser-side session cookie that holds the Laravel API token. |
| **react-hook-form + zod** | Form state and runtime validation matching the backend rules. |
| **axios** | HTTP client used both server-side (`lib/server-api.ts`) and client-side (`lib/api.ts`, `lib/useApi.ts`). |
| **Framer Motion** (installed) | Animation library (used lightly via Tailwind `animate-fade-in`). |
| **`lucide-react`** | Icon set (`<Trophy />`, `<Calendar />` etc.). |
| **`sonner`** | Toast notifications for success / error feedback. |
| **TipTap** | Rich-text editor in the admin panel for the long-form fields (about, mission, vision, blog content). |

---

## 3. How a request flows through the system

Take the homepage as an example: a user visits `http://localhost:3000/`.

```
Browser
   │  GET /
   ▼
Next.js (port 3000)
   │  serverFetch("/settings"), serverFetch("/contests"), …  (Promise.all)
   ▼
Laravel (port 8000)
   │  Route → Controller → Eloquent → MySQL
   ▼
MySQL
   │  rows
   ▼
Laravel  ── wraps in { success, data, message } ──►  Next.js
   │
Next.js  ── renders React HTML on the server ──►  Browser
   │
Browser  ── hydrates, runs CountdownTimer's useEffect tick, etc.
```

Two key ideas to memorise:

- The **API response envelope** is always `{ success: boolean, data: any, message: string }`.
  Every controller returns it via `ApiResponse::ok()` or `::fail()`. The frontend's
  `serverFetch<T>()` and `useApi()` helpers unwrap it.
- Pages that need fresh data on every request use **React Server Components** (no
  `"use client"` at the top of the page file). Pages that need interactivity (forms,
  buttons that POST) start with `"use client"`.

---

## 4. Repository layout

```
SGIPC_2.0/
├── backend/                       Laravel API
│   ├── .docker/                   Custom PHP-CLI image for dev (no host PHP needed)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   All API endpoints (public, authed, admin)
│   │   │   ├── Middleware/        EnsureAdmin
│   │   │   ├── Requests/          Validation classes (RegisterRequest, LoginRequest, …)
│   │   │   └── Traits/            ApiResponse trait (ok/fail helpers)
│   │   ├── Mail/                  3 mailables — Verify, Approved, Rejected
│   │   ├── Models/                12 Eloquent models, one per table
│   │   ├── Providers/             AppServiceProvider (unused defaults)
│   │   └── Services/              CloudinaryService
│   ├── bootstrap/app.php          Wires routes + middleware
│   ├── config/                    Standard Laravel config files
│   ├── database/
│   │   ├── factories/             Test-data generators (used by seeders)
│   │   ├── migrations/            Schema definitions
│   │   └── seeders/               Realistic dev data (admin, 20 users, blogs, etc.)
│   ├── resources/views/emails/    Blade templates for the 3 emails
│   └── routes/api.php             The endpoint registry
│
└── frontend/                      Next.js site
    ├── app/
    │   ├── (public)/              Pages with the Navbar + Footer
    │   ├── (auth)/                Login, register, verify-email
    │   ├── admin/                 Admin panel (server-side role guard)
    │   ├── profile/               Member profile page
    │   ├── api/auth/[...nextauth] NextAuth route handler
    │   ├── layout.tsx             Root <html> shell + metadata
    │   ├── providers.tsx          Wraps SessionProvider + Toaster
    │   ├── sitemap.ts             /sitemap.xml builder
    │   └── robots.ts              /robots.txt builder
    ├── components/
    │   ├── public/                Hero, Navbar, Footer, CountdownTimer, …
    │   ├── admin/                 AdminShell sidebar, RichTextEditor, ImageUpload, …
    │   └── ui/                    shadcn primitives (Button, Card, Input, Label)
    ├── lib/
    │   ├── api.ts                 Browser-side axios instance
    │   ├── server-api.ts          fetch() wrapper for server components
    │   ├── useApi.ts              hook that injects the bearer token
    │   ├── auth.ts                NextAuth options
    │   └── utils.ts               cn() helper (clsx + tailwind-merge)
    └── types/                     Shared TypeScript types
```

---

## 5. Backend deep dive

### 5.1 Bootstrap & configuration

**`backend/bootstrap/app.php`** is the entry point that builds the Laravel application
object. In Laravel 11 this file replaces the older `App\Http\Kernel` and
`App\Providers\RouteServiceProvider` classes.

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',                 // GET /up → 200 OK (used as a health probe)
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => EnsureAdmin::class,   // lets routes do ->middleware('admin')
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) { })
    ->create();
```

Important: there is **no `$middleware->statefulApi()` call**. That call would enable
Sanctum's cookie-based "SPA" mode and require CSRF tokens. We use the simpler
**bearer-token mode** instead, so the frontend just sends `Authorization: Bearer …` on
every authed request.

Config files of interest in `backend/config/`:

| File | What you set there |
| --- | --- |
| `app.php` | Timezone, locale, `frontend_url` (used in emails). |
| `database.php` | MySQL connection (read from `DB_*` env vars). |
| `cors.php` | Allowed origins — must include `http://localhost:3000` and your production frontend domain. |
| `sanctum.php` | Token expiry, stateful domains (unused in token mode). |
| `mail.php` | SMTP credentials (read from `MAIL_*` env vars). |
| `queue.php` | Queue driver (we use `database`). |
| `services.php` | Cloudinary credentials. |

### 5.2 Database schema (every table)

Migrations live in `backend/database/migrations/` and run in filename order. The full
list:

| Migration | Table | Purpose |
| --- | --- | --- |
| `0001_01_01_000000_create_users_table` | `users`, `password_reset_tokens`, `sessions` | Core auth tables. |
| `0001_01_01_000001_create_cache_table` | `cache`, `cache_locks` | Used because `CACHE_STORE=database`. |
| `0001_01_01_000002_create_jobs_table` | `jobs`, `job_batches`, `failed_jobs` | Queued mail lives here. |
| `2026_05_26_065349_create_personal_access_tokens_table` | `personal_access_tokens` | Sanctum tokens. |
| `2026_05_26_070001_create_site_settings_table` | `site_settings` | Key/value CMS content. |
| `2026_05_26_070002_create_events_table` | `events` | Workshops, talks, etc. |
| `2026_05_26_070003_create_contests_table` | `contests` | Programming contests, with `contest_date`. |
| `2026_05_26_070004_create_achievements_table` | `achievements` | Past wins, top-3 highlights. |
| `2026_05_26_070005_create_team_gallery_table` | `team_gallery` | Photos. |
| `2026_05_26_070006_create_blogs_table` | `blogs` | Posts with `status` (pending/approved/rejected). |
| `2026_05_26_070007_create_blog_comments_table` | `blog_comments` | Comments with `status` (visible/hidden). |
| `2026_05_26_070008_create_blog_likes_table` | `blog_likes` | Unique on `(blog_id, user_id)`. |
| `2026_05_26_070009_create_comment_reports_table` | `comment_reports` | User-submitted comment flags. |
| `2026_05_26_080001_create_leaderboard_entries_table` | `leaderboard_entries` | Codeforces standings snapshot per year. |
| `2026_05_26_080002_create_resources_table` | `resources` | Learning material list. |
| `2026_05_30_000000_swap_email_verification_token_for_code` | adds `email_verification_code` and `email_verification_code_expires_at` to `users`; drops the old `email_verification_token`. | Replaced link verification with a 6-digit code. |

Key columns to remember:

- **`users`**: `name`, `email` (unique), `password`, `student_id` (unique), `batch`,
  `department` (default `CSE`), `role` (`admin`|`client`), `status`
  (`pending`|`approved`|`rejected`), `rejection_reason`, `email_verified_at`,
  `email_verification_code` (6 chars), `email_verification_code_expires_at`,
  `profile_photo_url`.
- **`blogs`**: `title`, `slug` (unique, auto-generated), `content` (HTML from TipTap),
  `excerpt`, `cover_image_url`, `author_id` (FK users), `status`, `rejection_reason`,
  `is_published` (boolean), `views_count`.
- **`blog_likes`**: composite unique on `(blog_id, user_id)` — one like per user.

Each migration is short and follows the same pattern: a `Schema::create(...)` for `up()`
and `Schema::dropIfExists(...)` for `down()`. Open them when you need column types.

### 5.3 Models (every file)

Models in `backend/app/Models/` are Eloquent classes. Each one maps to one table.

| File | Key responsibilities |
| --- | --- |
| `User.php` | `HasApiTokens` from Sanctum (so `$user->createToken('sgipc')` works). `isAdmin()` returns `role === 'admin'`. `isApproved()` returns `status === 'approved' && email_verified_at !== null`. Defines `blogs()`, `comments()`, `likes()` relations. Casts `email_verified_at`, `email_verification_code_expires_at` to datetimes, hides password and verification code from JSON. |
| `Blog.php` | Auto-generates a unique slug in `booted()` via `static::uniqueSlug(title)`. `getRouteKeyName()` returns `'slug'` — so route binding `{blog}` in **public** routes matches by slug. Defines `author()`, `comments()`, `likes()`, and a `published()` scope (`status='approved' && is_published=true`). |
| `BlogComment.php` | Belongs to `Blog`, `User`. `status` field controls visibility (`visible`|`hidden`). |
| `BlogLike.php` | `blog_id`, `user_id` only — toggled by `BlogInteractionController`. |
| `CommentReport.php` | A user can flag a comment with `reason`; admins resolve. |
| `Event.php`, `Contest.php`, `Achievement.php`, `TeamGallery.php`, `LeaderboardEntry.php`, `Resource.php` | Mostly plain `$fillable` + a couple of casts (booleans, JSON arrays for `members` on achievements). |
| `SiteSetting.php` | A simple key/value table that powers most CMS-editable strings (hero title, mission, contact info). |

Most models override no methods — Laravel does the heavy lifting via convention.

### 5.4 The `ApiResponse` trait

`backend/app/Http/Traits/ApiResponse.php` exists so every endpoint returns the same JSON
shape. All controllers `use ApiResponse;` near the top.

```php
trait ApiResponse {
    protected function ok($data = null, string $message = '', int $status = 200) {
        return response()->json(['success' => true, 'data' => $data, 'message' => $message], $status);
    }
    protected function fail(string $message, $data = null, int $status = 400) {
        return response()->json(['success' => false, 'data' => $data, 'message' => $message], $status);
    }
}
```

The `data` slot on failures usually carries a structured error like
`['code' => 'invalid_credentials']` so the frontend can branch without parsing strings.

### 5.5 Form requests (validation)

Form Request classes live in `backend/app/Http/Requests/`. Laravel runs `authorize()` and
`rules()` automatically when you type-hint one in a controller method.

| File | Rules summary |
| --- | --- |
| `Auth/RegisterRequest.php` | `name` required string, `email` required unique, `student_id` required unique, `batch`, `department` optional, `password` required min 8 with `confirmed` (matches a `password_confirmation` field). |
| `Auth/LoginRequest.php` | `email`, `password`. |
| `Admin/RejectMemberRequest.php` | `reason` required string for member rejection. |

When validation fails Laravel auto-returns a 422 with `errors: {...}` — the frontend
maps these onto `react-hook-form` field errors.

### 5.6 Middleware

`backend/app/Http/Middleware/EnsureAdmin.php` — the only custom middleware.

```php
$user = $request->user();
if (!$user || !$user->isAdmin()) {
    return response()->json([
        'success' => false,
        'data' => ['code' => 'forbidden'],
        'message' => 'Admin access required.',
    ], 403);
}
return $next($request);
```

It runs after `auth:sanctum`, so by the time we hit it the user is already authenticated.
The class is aliased to the string `'admin'` in `bootstrap/app.php`, which is why
`routes/api.php` can say `->middleware('admin')`.

### 5.7 Public controllers

Each one returns published rows, no auth required.

| Controller | Methods | Behaviour |
| --- | --- | --- |
| `SettingsController` | `index` | Returns all `site_settings` rows flattened to `{ key: value }`. |
| `EventController` | `index`, `show` | Filters to `is_published=true`; `index` supports `?year=` and orders by `event_date desc`. |
| `ContestController` | `index`, `show` | `index` returns `{ upcoming, past }` split by `contest_date >= now()`. |
| `AchievementController` | `index` | Filters by `?year=`; includes a Hall-of-Fame (top 3) section if you read the spec. |
| `GalleryController` | `index` | Optional `?year=`. |
| `BlogController` | `index`, `show` | `index` paginates 10/page using `Blog::published()` scope. `show` increments `views_count`, eager-loads visible comments + author, returns `liked_by_me` if a user token is present. Uses `{blog:slug}` binding. |
| `LeaderboardController` | `index` | Returns `{ year, years[], entries[] }` for the requested or current year. |
| `ResourceController` | `index` | Lists published resources, optional `?category=`. |

All paginated responses leak Laravel's standard envelope (`current_page`, `last_page`,
`per_page`, `total`, `data`), wrapped inside our own envelope's `data` field.

### 5.8 Authenticated controllers

Routes in this group sit behind `auth:sanctum`. The user is reachable via
`$request->user()`.

| Controller | Methods | Behaviour |
| --- | --- | --- |
| `AuthController` | `register`, `verifyEmail`, `resendVerification`, `login`, `logout`, `me` | The full auth flow (see §7.2). `login` returns `{ token, user }` only if `status === 'approved' && email_verified_at !== null`. Otherwise it returns a distinct error code (`email_not_verified`, `account_pending`, `account_rejected`). |
| `ProfileController` | `update`, `myBlogs`, `myComments` | `PATCH /me` updates name, profile photo URL, optionally password. `GET /me/blogs` and `/me/comments` paginate the signed-in user's content. |
| `UploadController` | `image` | Single endpoint that proxies a multipart upload to `CloudinaryService::upload()` and returns `{ url, public_id }`. |
| `BlogInteractionController` | `like`, `unlike`, `comment`, `reportComment` | Routes bind by `{blog:id}` (not slug) because interactions need stable IDs. `like` is idempotent (`firstOrCreate`). `comment` creates a `BlogComment` with `status='visible'`. `reportComment` creates a `CommentReport`. |

### 5.9 Admin controllers

Sit behind `auth:sanctum` **then** `admin`. Folder: `app/Http/Controllers/Api/Admin/`.

| Controller | Endpoints | Behaviour |
| --- | --- | --- |
| `StatsController` | `GET /admin/stats` | Returns dashboard counts: members by status, blogs by status, pending reports, etc. |
| `MemberController` | list, approve, reject, destroy | `approve` flips `status` to `approved` and queues `RegistrationApprovedMail`. `reject` requires a reason, queues `RegistrationRejectedMail`. |
| `SettingsController` | index, bulkUpsert | `bulkUpsert` accepts `{ key1: value1, key2: value2 }` and writes them all in one transaction. |
| `EventController`, `ContestController`, `AchievementController`, `GalleryController`, `LeaderboardController`, `ResourceController` | full CRUD + `togglePublish` where it exists | Stock create / update / delete using `$model->fill($request->validate(...))`. |
| `BlogController` | list (with `?status=`), store (admin creates directly, auto-approved), `approve`, `reject`, destroy | Admins can post a blog without going through moderation. |
| `CommentController` | list (with filters), `hide`, `restore`, destroy | Flips `status` between `visible`/`hidden`. |
| `ReportController` | list (with `?status=`), `resolve`, destroy | Resolves a report by either hiding the comment or dismissing the flag. |

### 5.10 Routes file

`backend/routes/api.php` is the single source of truth for endpoints. Read it top to
bottom:

- Public endpoints (registration + content reads).
- A `Route::middleware('auth:sanctum')->group(...)` block for member-only routes.
- Inside that group, `Route::middleware('admin')->prefix('admin')->group(...)` for the
  admin panel.

Inside admin, models are bound by ID by default. Public blog routes bind by slug because
the `Blog` model overrides `getRouteKeyName()` to `'slug'`. Blog **interaction** routes
explicitly use `{blog:id}` so URLs don't depend on slugs that may change.

### 5.11 Cloudinary service

`backend/app/Services/CloudinaryService.php` wraps the Cloudinary PHP SDK so controllers
don't touch the SDK directly:

```php
public function upload(UploadedFile $file, string $folder = 'sgipc'): array {
    $result = $this->client->uploadApi()->upload($file->getRealPath(), [
        'folder' => $folder, 'resource_type' => 'image',
    ]);
    return ['url' => $result['secure_url'], 'public_id' => $result['public_id'], ...];
}
public function destroy(string $publicId): bool {
    return ($this->client->uploadApi()->destroy($publicId)['result'] ?? '') === 'ok';
}
```

Configured via `CLOUDINARY_URL` env var. Only one endpoint (`POST /upload/image`)
uses it; everything else just stores the returned URL as a string.

### 5.12 Mail + queues

Three mailables:

| Class | Trigger | Template |
| --- | --- | --- |
| `EmailVerificationMail($user, $code)` | Registration + resend | `resources/views/emails/verify.blade.php` — shows the 6-digit code. |
| `RegistrationApprovedMail($user)` | Admin approves a member | `emails/approved.blade.php` — welcome message + link to login. |
| `RegistrationRejectedMail($user, $reason)` | Admin rejects a member | `emails/rejected.blade.php` — explanation + reason. |

Each implements `ShouldQueue`, so calling `Mail::to(...)->queue(...)` writes the job to
the `jobs` table. `php artisan queue:work` (a separate process) reads jobs and dispatches
them via SMTP.

`backend/resources/views/emails/_layout.blade.php` is a shared dark-themed Blade
component that wraps all three templates with consistent header/footer styling.

### 5.13 Migrations

Already enumerated in §5.2. Each file is a small class with `up()` and `down()`. Run
them with:

```bash
php artisan migrate          # apply pending migrations
php artisan migrate:fresh    # drop all tables and re-run from scratch (DEV ONLY)
php artisan migrate:rollback # undo the last batch
```

### 5.14 Seeders + factories

**Factories** (`database/factories/`) declare how to build a random row of a model. We
have `User`, `Event`, `Contest`, `Achievement`, `Blog` factories.

**Seeders** (`database/seeders/`) call factories with realistic content. Order is
defined in `DatabaseSeeder::run()`:

1. `AdminSeeder` — creates `admin@sgipc.kuet.ac.bd / admin123456`.
2. `UserSeeder` — 15 approved + 3 pending-but-verified + 2 pending-unverified = 20 members.
3. `SiteSettingSeeder` — 17 default key/value rows (hero text, mission, etc.).
4. `EventSeeder` — 8 events.
5. `ContestSeeder` — 5 contests (mix of upcoming + past).
6. `AchievementSeeder` — 10 wins.
7. `TeamGallerySeeder` — 12 photos.
8. `BlogSeeder` — 15 blogs (12 approved, 2 pending, 1 rejected).
9. `BlogCommentSeeder` — 30 comments (25 visible, 3 hidden, 2 deleted).
10. `BlogLikeSeeder` — 50 likes, uses a `Set` to enforce uniqueness.
11. `CommentReportSeeder` — 3 reports.
12. `LeaderboardSeeder` — 18 entries split across 2026 + 2025.
13. `ResourceSeeder` — 16 categorised resources.

Run all of them at once: `php artisan migrate:fresh --seed`.

---

## 6. Frontend deep dive

### 6.1 App Router crash course

Next.js 14 uses **file-based routing**. The `frontend/app/` folder is the routing tree:

- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/blog/[slug]/page.tsx` → `/blog/anything`
- `app/(public)/page.tsx` → still `/` — the `(public)` parentheses are a **route group**.
  Route groups don't appear in the URL; they exist so you can share a `layout.tsx`
  among a bunch of routes.
- `app/layout.tsx` → wraps every page; must contain `<html>` and `<body>`.

Components default to **React Server Components**. They render on the server and can
`await` data, but they can't use `useState`, `useEffect`, or browser APIs. To make a
component interactive, put `"use client"` on its first line.

### 6.2 Root files

| File | Purpose |
| --- | --- |
| `app/layout.tsx` | Sets the `<html lang="en" className="dark">` shell, loads Geist fonts via `next/font/local`, exports `metadata` (used for the `<title>`, OG tags, Twitter card), wraps children in `<Providers>`. |
| `app/providers.tsx` | Client component that injects `<SessionProvider>` (NextAuth) and `<Toaster>` (sonner) so any descendant can call `useSession()` and `toast(...)`. |
| `app/sitemap.ts` | Returns a `MetadataRoute.Sitemap`. Builds entries for every static page plus every approved blog slug (paginated via the API). |
| `app/robots.ts` | Returns a `MetadataRoute.Robots`. Allows `/`, disallows `/admin`, `/profile`, `/api/auth/`. |
| `app/api/auth/[...nextauth]/route.ts` | One line that re-exports `NextAuth(authOptions)` from `lib/auth.ts`. This makes `/api/auth/signin`, `/api/auth/signout`, `/api/auth/callback/credentials` work. |

### 6.3 The `lib/` folder

| File | Used by | What it does |
| --- | --- | --- |
| `lib/api.ts` | Server-side login (`authorize`), other one-off calls | A plain axios instance pointed at `NEXT_PUBLIC_API_URL`. No auth header — used only for endpoints that don't need a token (`/login`, `/register`, `/verify-email`). |
| `lib/server-api.ts` | All public **server** components (home, blog index, contest page, …) | `serverFetch<T>(path, { revalidate })` uses Next.js's built-in `fetch` with the `next.revalidate` option. Returns `T \| null` after unwrapping the envelope. 60-second ISR default. |
| `lib/useApi.ts` | All **client** components that need to call the API as the logged-in user | `useApi()` reads `apiToken` from the NextAuth session and returns a memoised axios instance with `Authorization: Bearer …`. |
| `lib/auth.ts` | `app/api/auth/[...nextauth]/route.ts`, `getServerSession()` calls in layouts | Defines `authOptions`: a single `CredentialsProvider` that POSTs to Laravel `/login`, returns `{ id, name, email, role, token }` on success. JWT callbacks copy `role` and `token` (renamed `apiToken`) into the session. |
| `lib/utils.ts` | Everywhere | `cn(...inputs)` = `twMerge(clsx(...))`. Use it to conditionally compose Tailwind classes without conflicts. |

### 6.4 Types

`types/api.ts` and `types/api-extra.ts` define the shapes returned by the API
(`SiteSettings`, `Event`, `Contest`, `Achievement`, `Blog`, `BlogPage`, `LeaderboardEntry`,
`Resource`, etc.). They are not enforced at runtime — they just give the editor
autocomplete and catch typos.

`types/next-auth.d.ts` is a module augmentation file that tells TypeScript "the session
object also has a `role` field on `session.user` and an `apiToken` field on the session
root". Without it, accessing `session.apiToken` would error.

### 6.5 Route groups & layouts

There are four nested layouts:

1. **`app/layout.tsx`** — applies to literally every page.
2. **`app/(public)/layout.tsx`** — server component. Fetches `/settings` once, wraps
   children with `<Navbar />` + `<Footer settings={...}/>`. Adds `pt-16` to leave room
   for the fixed-position navbar.
3. **`app/(auth)/layout.tsx`** — centres the login/register/verify card on a dark
   gradient background.
4. **`app/admin/layout.tsx`** — server component. Calls `getServerSession(authOptions)`,
   redirects to `/login?callbackUrl=/admin` if not signed in, redirects to `/` if not
   admin. Wraps children in `<AdminShell>` (the sidebar + topbar).
5. **`app/profile/layout.tsx`** — server-side guard that redirects to `/login` if no
   session.

### 6.6 Public pages

All page files live under `app/(public)/`. Each is a **server component** by default; it
fetches data with `Promise.all([...])` and passes plain props to client child components
where interactivity is needed.

| File | Notes |
| --- | --- |
| `page.tsx` (home) | Fetches settings, contests, achievements, blogs, gallery in parallel. Renders the matrix-rain hero, stats bar, about preview, upcoming-contest card with `<CountdownTimer>`, top-3 achievements, latest 3 blogs, gallery preview. |
| `about/page.tsx` | Pure server render of about-section settings. |
| `events/page.tsx` | Server-fetches events, hands them to `<EventsList>` (client) which manages the year filter. |
| `contest/page.tsx` | Server-fetches `{ upcoming, past }`. Renders the next contest with `<CountdownTimer>` (client) and a past-contests archive. |
| `achievements/page.tsx` | Server-fetches achievements, hands them to `<AchievementsList>` (client). |
| `gallery/page.tsx` | Server-fetches gallery, hands them to `<GalleryFilterable>` (client) which does year filter + lightbox. |
| `leaderboard/page.tsx` | Server-fetches the current year's leaderboard, hands them to `<LeaderboardClient>` for year switching. |
| `blog/page.tsx` | Server-fetches paginated blogs, renders `<BlogCard>` grid + page links. Honours `?page=`, `?q=`. |
| `blog/[slug]/page.tsx` | Server-fetches one blog. Renders TipTap HTML via `dangerouslySetInnerHTML`. Mounts `<BlogInteractions>` (client) for like/comment/report. |
| `resources/page.tsx` | Lists `<ResourceCard>`s grouped by category. |

The hydration-safe `<CountdownTimer>` deserves a mention: it renders `--` placeholders
during SSR and only fills in real numbers in `useEffect`, so the server- and
client-rendered HTML always match. See `components/public/CountdownTimer.tsx`.

### 6.7 Auth pages

| File | Notes |
| --- | --- |
| `(auth)/login/page.tsx` | Client component. Calls `signIn("credentials", { ... })`. On success NextAuth stores the JWT cookie and redirects to `callbackUrl`. Error states map onto specific messages by inspecting the `result.error` string. |
| `(auth)/register/page.tsx` | Two-step form (personal info → account setup). On submit it POSTs to `/api/register`, then **redirects** to `/verify-email?email=…` so the user can immediately enter the 6-digit code. |
| `(auth)/verify-email/page.tsx` | Wrapped in `<Suspense>` because it uses `useSearchParams`. Shows an email input (prefilled from the query) plus a 6-digit code input with `inputMode=numeric` and `autoComplete="one-time-code"` so mobile keyboards autofill from SMS where supported. Has a "Resend code" button that POSTs `/api/resend-verification`. |

### 6.8 Profile page

`app/profile/page.tsx` is a client component (form). It calls `useApi()` (token attached
automatically), shows the current user, lets them update name and password, lets them
upload a profile photo through `<ImageUpload>`, and lists their own blogs / comments via
`/me/blogs` and `/me/comments`.

### 6.9 Admin pages

All admin pages are **client components** that use `useApi()`. They follow the same
pattern:

1. Local state for the loaded list + a filter / search bar.
2. `useEffect(() => { api.get(...).then(setData) }, [filters])` for refresh.
3. CRUD via `api.post / put / patch / delete`, then re-call the load function.
4. `<Dialog>` from `components/admin/Dialog.tsx` for create/edit modals.

Specific ones:

- `admin/page.tsx` — Dashboard. Fetches `/admin/stats`, renders counters.
- `admin/members/page.tsx` — Approve / reject buttons. Reject opens a Dialog with a
  required reason textarea.
- `admin/settings/page.tsx` — Form for every site_settings key. Long-form fields
  (about_content, mission, vision, footer_description) use `<RichTextEditor>` (TipTap).
- `admin/events/`, `contests/`, `achievements/`, `gallery/`, `leaderboard/`,
  `resources/`, `blogs/` — Standard table + Dialog form with `<ImageUpload>` for cover
  images.
- `admin/comments/page.tsx` — Hide / restore / delete.
- `admin/reports/page.tsx` — Resolve / dismiss reports.

### 6.10 Public components

| File | Purpose |
| --- | --- |
| `Navbar.tsx` | Client. Listens for scroll to add a backdrop blur. Shows login/profile based on `useSession()`. |
| `Footer.tsx` | Server. Reads `settings` props. Custom inline SVG for Github / Facebook icons (lucide dropped brand icons in v1.16). |
| `MatrixRain.tsx` | Client. Canvas-based "code rain" animation in the hero. |
| `Typewriter.tsx` | Client. Animated text reveal for the hero title. |
| `CountdownTimer.tsx` | Client, SSR-safe (see §6.6). |
| `SectionHeader.tsx` | Reusable section title + subtitle. |
| `BlogCard.tsx`, `ResourceCard.tsx` | Cards used on grids. |
| `EventsList.tsx`, `AchievementsList.tsx`, `GalleryFilterable.tsx`, `LeaderboardClient.tsx`, `YearChips.tsx` | Year-filter UIs paired with server-fetched data. |
| `BlogInteractions.tsx` | Like button, comment form, report button on a blog single page. Uses `useApi()`. |
| `GalleryGrid.tsx` | Masonry grid + lightbox. |

### 6.11 Admin components

| File | Purpose |
| --- | --- |
| `AdminShell.tsx` | The sidebar + topbar wrapper. Holds the nav array (12 items). |
| `AdminPageHeader.tsx` | Page title + optional action buttons. |
| `Dialog.tsx` | Modal wrapper. |
| `RichTextEditor.tsx` | TipTap editor wired to `StarterKit`. Uses `editor.commands.setContent(value, { emitUpdate: false })` (the v2 API). |
| `ImageUpload.tsx` | Sends a multipart POST to `/upload/image` and exposes the returned URL. |
| `PublishToggle.tsx` | Calls `PATCH /admin/.../toggle-publish`. |

### 6.12 UI primitives

`components/ui/button.tsx`, `card.tsx`, `input.tsx`, `label.tsx` are unmodified shadcn
exports. They are based on Radix UI primitives + Tailwind variants and live in your
repository so you can edit them later without yanking a dependency.

---

## 7. End-to-end feature walkthroughs

### 7.1 A visitor lands on the homepage

1. Browser requests `GET http://localhost:3000/`.
2. Next.js matches `app/(public)/page.tsx` and its parent layout `(public)/layout.tsx`.
3. Both layouts and the page are server components, so Next runs them on the server.
4. `(public)/layout.tsx` calls `serverFetch<SiteSettings>("/settings")` which makes a
   `fetch("http://localhost:8000/api/settings", { next: { revalidate: 60 } })`.
5. The home page calls `Promise.all([serverFetch(...), …])` to fetch settings, contests,
   achievements, blogs, gallery in parallel.
6. Each `serverFetch` call hits Laravel; the matching controller paginates / filters and
   returns the envelope.
7. Next renders the HTML. Server components stream to the browser.
8. Once HTML arrives, React **hydrates** on the client. Client components like
   `MatrixRain`, `Typewriter`, `CountdownTimer`, `Navbar` mount and their `useEffect`s
   run.
9. For the next 60 seconds, repeated requests for `/` are served from Next.js's cache;
   after that, the next request triggers a regeneration.

### 7.2 Registration → verification → approval → login

1. User fills the multi-step `(auth)/register` form. Client validation runs through
   `zodResolver` so the inputs match the backend's `RegisterRequest` rules.
2. Step 2 submit calls `api.post("/register", {...})`.
3. Laravel:
    - Runs `RegisterRequest` validation.
    - Generates a 6-digit code via `random_int(0, 999999)` zero-padded.
    - Creates a user with `role='client'`, `status='pending'`,
      `email_verification_code`, `email_verification_code_expires_at = now() + 15 min`.
    - `Mail::to($user)->queue(new EmailVerificationMail($user, $code))` — writes a row
      to the `jobs` table.
    - Returns `{ user_id, email }` plus a friendly message.
4. The queue worker (`php artisan queue:work`) wakes up, deserialises the mail job,
   renders `emails/verify.blade.php` with `$code`, and sends via SMTP.
5. Frontend redirects to `/verify-email?email=…`. User reads the code from email, types
   it in.
6. Submit POSTs `/verify-email` with `{ email, code }`. Laravel checks:
    - The user exists.
    - They aren't already verified.
    - The code field isn't null.
    - The expiry isn't passed.
    - `hash_equals($stored, $submitted)` matches.
   On success it nulls the code fields and stamps `email_verified_at = now()`. Status
   stays `pending`.
7. User can't log in yet — the `login` endpoint returns `account_pending`.
8. Admin opens `/admin/members?status=pending`, sees the user, clicks **Approve**.
9. `PATCH /admin/members/{id}/approve` flips `status='approved'` and queues a
   `RegistrationApprovedMail` welcoming the user.
10. User attempts `/login` again. Laravel now passes all guards, calls
    `$user->createToken('sgipc')->plainTextToken`, returns `{ token, user }`.
11. NextAuth `authorize()` receives `{ token, user }`, stores them in a JWT cookie.
12. Every subsequent client component pulls the token from `useSession()` via
    `useApi()` and sends it as `Authorization: Bearer …`. Sanctum's auth guard sees the
    token in `personal_access_tokens` and resolves the user.

### 7.3 Writing and publishing a blog

1. Member opens their profile and submits a blog (admin can also create directly via
   `/admin/blogs`).
2. The post starts with `status='pending'`, `is_published=false`, `slug` auto-generated.
3. Admin opens `/admin/blogs?status=pending`, reviews, hits **Approve** →
   `PATCH /admin/blogs/{id}/approve` sets `status='approved'`, `is_published=true`.
4. Public `/blog` re-fetches on the next ISR window (60 s) — or you can manually
   `revalidatePath` if you wire that in.
5. Visitor lands on `/blog/<slug>`. `Blog::published()` scope finds it; views_count
   increments; comments render.

### 7.4 Admin moderates a comment

1. Visitor reports a comment via `<BlogInteractions>` → `POST /comments/{id}/report` →
   row in `comment_reports`.
2. Admin sees a badge on the Reports tab (`/admin/reports`).
3. Resolution paths:
   - **Hide the comment**: `PATCH /admin/comments/{id}/hide` flips
     `BlogComment.status='hidden'`. The comment vanishes from public reads because
     `BlogController::show` loads only `status='visible'`.
   - **Dismiss the report**: `PATCH /admin/reports/{id}/resolve`.

---

## 8. Environment variables

### Backend (`backend/.env`)

| Variable | Example | Purpose |
| --- | --- | --- |
| `APP_KEY` | `base64:…` | Cipher key. Generate with `php artisan key:generate`. |
| `APP_URL` | `http://localhost:8000` | Used in queued jobs that build absolute URLs. |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | … | MySQL connection. |
| `QUEUE_CONNECTION` | `database` | Use the `jobs` table. |
| `MAIL_MAILER` | `smtp` | |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION` | `smtp.gmail.com`, 587, …, `tls` | SMTP. For Gmail use an **App Password**. |
| `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` | `noreply@sgipc.kuet.ac.bd`, "SGIPC Club" | |
| `CLOUDINARY_URL` | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` | Single composite credential. |
| `FRONTEND_URL` | `http://localhost:3000` | Used inside email links. |
| `SANCTUM_STATEFUL_DOMAINS` | `localhost:3000` | Only needed if you ever switch to stateful SPA mode. |

### Frontend (`frontend/.env.local`)

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | All axios + fetch calls use this. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Used in metadata, sitemap, OG tags. |
| `NEXTAUTH_URL` | `http://localhost:3000` | Required by NextAuth in production. |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Signs the JWT cookie. **Must change between environments.** |

Anything prefixed `NEXT_PUBLIC_` is shipped to the browser; everything else is
server-only.

---

## 9. Security model

- **Passwords** are hashed with bcrypt via Laravel's `'password' => 'hashed'` cast.
- **Bearer tokens** are stored hashed in `personal_access_tokens` and only the
  plain-text value is returned once at login.
- **Mass assignment** is controlled by `$fillable` arrays on every model. The
  verification code is in `$hidden` so it never appears in JSON responses.
- **Admin gating** runs *server-side* in two places:
  - Backend: `auth:sanctum` + `admin` middleware on every `/admin/*` route.
  - Frontend: `app/admin/layout.tsx` calls `getServerSession()` and redirects on the
    server before any admin component renders. Never trust client-side redirects alone.
- **CORS** is configured in `backend/config/cors.php` to whitelist the frontend origin
  only.
- **Cloudinary** secrets stay in the backend. The browser never sees the API key — it
  POSTs the file to `/upload/image` and gets back a URL.
- **Hashing comparison** in `verifyEmail` uses `hash_equals` to avoid timing attacks.

---

## 10. Caching, revalidation, performance

- **Server-side fetches** use Next.js's `next: { revalidate: 60 }`. After the first
  request, the response is cached for 60 seconds; subsequent requests serve the cached
  HTML.
- **Pagination** uses Laravel's `->paginate(10)->withQueryString()` so `?page=2&q=foo`
  carries `q` automatically to the next-page link.
- **N+1 prevention**: every controller uses `->with([...])` or `->withCount([...])` to
  eager-load relations. Don't introduce `$blog->comments` inside a `foreach` without
  loading first.
- **The queue** keeps email send time off the request path. If `php artisan queue:work`
  isn't running, registrations succeed but the email never arrives.
- **Cloudinary URLs** include built-in CDN, transformation, and WebP serving — no extra
  optimisation needed in the frontend.

---

## 11. Glossary for beginners

- **Eloquent**: Laravel's ORM. `User::where(...)->first()` instead of raw SQL.
- **Migration**: a versioned script that describes a DB schema change.
- **Seeder**: a script that inserts example rows so dev environments have data.
- **Sanctum**: Laravel's official package for issuing API tokens.
- **Mailable**: a class representing one outgoing email.
- **Queue**: a list of jobs to do later. The worker process picks them up.
- **Form Request**: a class that validates an incoming request before it reaches the
  controller.
- **Trait**: PHP's "mix-in" — a reusable set of methods you add to a class with `use`.
- **Server component** (Next.js): runs on the server, can `await`, can't use hooks.
- **Client component**: starts with `"use client"`, runs in the browser, can use
  `useState`/`useEffect`.
- **Hydration**: the moment the React tree on the page (rendered by the server) gets
  attached to its event listeners on the client. Mismatched server/client output here
  throws an error.
- **ISR (Incremental Static Regeneration)**: serve a cached page; rebuild it in the
  background after the revalidation window expires.
- **JWT (in our app)**: the cookie NextAuth uses to remember a user. It contains our
  Laravel API token.

---

If you got here, you can describe the whole app: it's a Laravel API plus a Next.js
front-end, talking JSON in a `{success, data, message}` envelope, with Sanctum for
auth, a queue for mail, Cloudinary for images, and a strict server-side admin guard.
