# Ecommerce Platform

A full-stack e-commerce platform: **FastAPI + SQLAlchemy 2 + PostgreSQL** backend
and a **React 19 + Vite + TypeScript + Tailwind** frontend. Built as a modular
monolith — internally partitioned by domain (auth, products, orders, etc.) so it
can be split into microservices later without a rewrite.

> **Status:** Core storefront + checkout + admin flow is complete and has been
> tested end-to-end against a real PostgreSQL database (register → browse →
> cart → address → checkout → order history; admin dashboard, product/category/
> inventory/order/user management). Coupons, notifications, deep analytics, and
> a payment gateway integration are intentionally deferred — see
> [What's deferred](#whats-deferred) below.

---

## Tech Stack

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS, React Router, Axios, TanStack Query, Context API
**Backend:** FastAPI, Python 3.12, SQLAlchemy 2.x, Alembic, Pydantic v2, JWT (python-jose), Passlib (bcrypt)
**Database:** PostgreSQL

No Docker, Kubernetes, Jenkins, Terraform, Redis, or RabbitMQ are used in this
build by design — those are planned for a later DevOps phase. The code is kept
modular and environment-variable driven specifically so that phase is a
configuration change, not a rewrite.

## What's implemented

- **Auth:** register, login, JWT access + refresh tokens, logout, profile, change password, role-based guards
- **Customer:** home, categories, product listing with search/filter/sort/pagination, product details, wishlist, cart, checkout, address book, order history
- **Admin:** dashboard (revenue/orders/users/low-stock KPIs), product CRUD, category CRUD, inventory adjustment, order management with status transitions, user management (activate/deactivate)
- **Reviews:** create + list, product rating auto-recalculated
- **Dark/light mode**, responsive layout, protected routes, admin layout vs. customer layout

## What's deferred

Coupons, notifications, a real payment gateway (checkout supports COD/card/UPI as
a *method label* with a mock payment record — no gateway is called), deep
analytics beyond the dashboard KPIs. Each has a placeholder router in the
backend (`backend/app/modules/{coupons,notifications,analytics}`) that is not
mounted, and an `AdminAnalyticsPage` that says so explicitly in the UI.

---

## Prerequisites

- Python 3.12+
- Node.js 18+ and npm
- PostgreSQL 14+ installed and running locally

---

## Local Development — Windows (cmd.exe)

### 1. Create the database

Open **psql** (or pgAdmin) as the `postgres` superuser and run:

```sql
CREATE USER ecommerce_user WITH PASSWORD 'ecommerce_pass';
CREATE DATABASE ecommerce_db OWNER ecommerce_user;
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
```

From cmd.exe, that's typically:

```cmd
psql -U postgres
```

then paste the three SQL lines above, then `\q` to exit.

### 2. Install backend dependencies

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

The default `.env` already matches the database created in step 1. Edit it if
you used different credentials.

### 3. Run database migrations and seed data

```cmd
alembic upgrade head
python scripts\seed_db.py
```

This creates all 14 tables and seeds: 2 roles, an admin user
(`admin@example.com` / `Admin@123`), a customer user
(`customer@example.com` / `Customer@123`), 5 categories, and 20 products with
images and stock.

### 4. Run the backend

```cmd
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Install frontend dependencies

Open a **second** terminal:

```cmd
cd frontend
npm install
copy .env.example .env
```

### 6. Run the frontend

```cmd
npm run dev
```

### 7. Verify backend

Open http://localhost:8000/docs — the interactive OpenAPI docs should load and
list ~32 endpoints. `http://localhost:8000/health` should return
`{"status":"healthy"}`.

### 8. Verify frontend

Open http://localhost:5173 — the storefront home page should load with the 5
seeded categories and 20 seeded products. Log in with
`customer@example.com` / `Customer@123` to shop, or
`admin@example.com` / `Admin@123` and visit `/admin/dashboard` for the admin
panel.

---

## Local Development — macOS/Linux

Same steps, with the platform-appropriate equivalents:

```bash
# 1. Database
psql -U postgres -c "CREATE USER ecommerce_user WITH PASSWORD 'ecommerce_pass';"
psql -U postgres -c "CREATE DATABASE ecommerce_db OWNER ecommerce_user;"

# 2. Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# 3. Migrate + seed
alembic upgrade head
python scripts/seed_db.py

# 4. Run backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5-6. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Project Layout

```
ecommerce-platform/
├── backend/
│   ├── app/
│   │   ├── core/          # config, security (JWT/bcrypt), exceptions, logging
│   │   ├── db/             # SQLAlchemy engine/session, declarative base
│   │   ├── common/         # generic repository, response/pagination schemas, exception handlers
│   │   ├── modules/         # one folder per domain: auth, categories, products,
│   │   │                    # inventory, addresses, cart, wishlist, orders, payments,
│   │   │                    # reviews, users, admin (each with models/schemas/
│   │   │                    # repository/service/router/dependencies/exceptions)
│   │   └── api/v1/router.py # aggregates all module routers under /api/v1
│   ├── alembic/              # migrations (env.py wired to app settings + all models)
│   ├── scripts/
│   │   ├── seed_db.py        # roles, admin+customer users, 5 categories, 20 products
│   │   └── create_admin.py   # interactive: create or promote an admin user
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/               # axios client with JWT + refresh-token interceptor
│   │   ├── store/              # AuthProvider, CartProvider, ThemeProvider (Context API)
│   │   ├── features/            # one folder per domain: api + hooks + types
│   │   ├── components/           # common/, layout/, product/, ui/
│   │   ├── layouts/               # MainLayout, AdminLayout, AuthLayout
│   │   ├── routes/                 # AppRoutes, ProtectedRoute, AdminRoute
│   │   └── pages/                   # customer pages + pages/admin/*
│   ├── package.json
│   └── .env.example
├── database/    # early SQL planning stubs — not used at runtime; the app's
│                # actual schema lives in backend/alembic and is applied via
│                # `alembic upgrade head`, and seed data comes from
│                # backend/scripts/seed_db.py, not these files
└── docs/        # architecture / planning notes from the initial design pass
```

## API Documentation

With the backend running, interactive OpenAPI docs are at
http://localhost:8000/docs (Swagger UI) and http://localhost:8000/redoc.

## Troubleshooting

- **`connection to server at "localhost", port 5432 failed`** — PostgreSQL
  isn't running, or the credentials/DB name in `backend/.env` don't match what
  you created in step 1.
- **CORS errors in the browser console** — confirm `CORS_ORIGINS` in
  `backend/.env` includes `http://localhost:5173` (it does by default) and
  that the frontend's `VITE_API_BASE_URL` points at
  `http://localhost:8000/api/v1`.
- **`ModuleNotFoundError` on backend start** — the virtual environment isn't
  activated, or `pip install -r requirements.txt` didn't complete.
- **Frontend TypeScript errors mentioning `node:path` / `node:url`** — this
  was hit and fixed during development by adding `@types/node` as a
  devDependency; it's already in `frontend/package.json`, so a fresh
  `npm install` should not reproduce it.
