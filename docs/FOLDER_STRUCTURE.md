# Folder Structure

Every directory below has a single, stated responsibility. Backend module
packages already contain `__init__.py` docstrings and stub files describing
what will be implemented in later steps — nothing here is arbitrary scaffolding.

## Top Level

```
ecommerce-platform/
├── frontend/            React 19 + Vite + TypeScript SPA
├── backend/             FastAPI modular monolith
├── database/            SQL init scripts, seed data, ERD assets
├── docs/                Architecture & process documentation (this file lives here)
├── scripts/             Cross-cutting local-dev automation
├── infra/               Empty scaffolding: docker, kubernetes, helm, terraform, monitoring, jenkins, rabbitmq
├── .github/workflows/   Empty scaffolding: GitHub Actions CI/CD
├── .gitignore
└── README.md
```

---

## backend/ — FastAPI Modular Monolith

```
backend/
├── app/
│   ├── main.py                     # FastAPI app factory: middleware, exception handlers, v1 router
│   ├── core/                       # Cross-cutting, framework-level concerns
│   │   ├── config.py               #   Settings loaded from env vars (single source of truth)
│   │   ├── security.py             #   Password hashing, JWT encode/decode
│   │   ├── logging.py              #   Structured JSON logging config
│   │   ├── exceptions.py           #   Base exception classes
│   │   ├── constants.py            #   Enums: roles, order status, payment status
│   │   └── rate_limit.py           #   Rate-limit interface (in-memory now, Redis later)
│   │
│   ├── db/                         # Database engine/session lifecycle
│   │   ├── base.py                 #   Declarative Base + model import hub (for Alembic autogenerate)
│   │   └── session.py              #   Engine, SessionLocal, get_db dependency
│   │
│   ├── cache/                      # Redis abstraction (prepared, not yet wired everywhere)
│   │   ├── redis_client.py         #   Redis connection singleton
│   │   └── cache_interface.py      #   Abstract cache interface (services depend on this, not Redis)
│   │
│   ├── common/                     # Shared building blocks used by every module
│   │   ├── repository/base.py      #   Generic Repository[T] CRUD base class
│   │   ├── schemas/pagination.py   #   Reusable Page / PaginationParams
│   │   ├── schemas/response.py     #   Standard success/error response envelope
│   │   ├── exceptions/handlers.py  #   Global exception → HTTP mapping
│   │   ├── middleware/logging.py   #   Request logging + correlation ID
│   │   ├── middleware/rate_limit.py#   Rate-limit middleware hook
│   │   └── utils/security_utils.py #   Token/slug/SKU helpers
│   │
│   ├── api/v1/
│   │   └── router.py               # Aggregates every module router under /api/v1 (today's "Gateway")
│   │
│   └── modules/                    # ⭐ Vertical slices = future microservice boundaries
│       ├── auth/          → Auth Service        (register, login, JWT, refresh, RBAC primitives)
│       ├── users/         → User Service         (profile, roles)
│       ├── products/      → Product Service      (catalog CRUD, search/filter)
│       ├── categories/    → Product Service       (category subdomain)
│       ├── inventory/     → Inventory Service     (stock levels, reservations)
│       ├── orders/        → Order Service         (cart→order, lifecycle, order items)
│       ├── payments/      → Payment Service       (payment intents, provider abstraction)
│       ├── reviews/       → Reviews Service       (ratings/reviews)
│       ├── wishlist/      → Wishlist Service      (saved products)
│       ├── coupons/       → Promotions Service    (discount codes)
│       ├── addresses/     → (Users/Orders)        (shipping/billing addresses)
│       ├── notifications/ → Notification Service  (future RabbitMQ consumer)
│       ├── admin/         → composition-only       (dashboard endpoints, no owned tables)
│       └── analytics/     → composition-only       (sales reporting queries)
│
│       Each "owns tables" module (auth..notifications) has the identical
│       vertical slice:
│       ├── models.py         SQLAlchemy ORM models
│       ├── schemas.py        Pydantic request/response contracts
│       ├── repository.py     Data access (extends common Repository base)
│       ├── service.py        Business logic / use cases
│       ├── router.py         FastAPI endpoints (thin controller)
│       ├── dependencies.py   DI providers (service/repo factories, permission checks)
│       └── exceptions.py     Domain-specific exceptions
│
├── alembic/
│   ├── env.py                      # Migration environment, wired to Settings + Base metadata
│   └── versions/                   # Generated migration scripts (Step 4)
│
├── tests/
│   ├── unit/                       # Service/repository tests, DB & cache mocked
│   ├── integration/                # Real test-DB + API client, per module
│   └── fixtures/                   # Shared pytest fixtures/factories
│
├── scripts/
│   ├── seed_db.py                  # Seed demo data
│   └── create_admin.py             # Bootstrap first admin user
│
├── logs/                           # Local log output (gitignored)
├── requirements.txt                # Python deps — Step 3
├── .env.example                    # Env var template — Step 3
├── alembic.ini                     # Alembic config — Step 4
└── pytest.ini
```

**Full file listing (148 files):** every `models.py`/`schemas.py`/`repository.py`/
`service.py`/`router.py`/`dependencies.py`/`exceptions.py` already exists as a
documented stub inside each of the 14 module folders — see the repo tree via
`find backend -type f` or the project archive.

---

## frontend/ — React 19 + Vite + TypeScript

```
frontend/
├── index.html
├── vite.config.ts / tsconfig.json / tailwind.config.js / postcss.config.js
├── package.json
├── .env.example
├── public/
└── src/
    ├── main.tsx                 # Mounts <App/> with providers (Router, Auth, Query client)
    ├── App.tsx                  # Root component + route outlet
    ├── styles/index.css         # Tailwind entry
    │
    ├── config/
    │   ├── env.ts                # Typed Vite env var access
    │   └── constants.ts          # Frontend-wide constants
    │
    ├── api/
    │   ├── axiosClient.ts        # Axios instance: JWT header + refresh-token interceptor
    │   └── endpoints.ts          # Central endpoint path map (mirrors backend /api/v1)
    │
    ├── store/
    │   ├── authStore.ts          # Global auth state
    │   └── cartStore.ts          # Global cart state
    │
    ├── routes/
    │   ├── AppRoutes.tsx         # Route table (guest / customer / admin)
    │   ├── ProtectedRoute.tsx    # Auth guard
    │   └── AdminRoute.tsx        # Role guard
    │
    ├── layouts/
    │   ├── MainLayout.tsx        # Public/customer shell (header/footer/nav)
    │   ├── AuthLayout.tsx        # Centered auth-page shell
    │   └── AdminLayout.tsx       # Admin shell (sidebar + header)
    │
    ├── components/
    │   ├── common/                Button, Input, Pagination, Spinner
    │   ├── layout/                Navbar, Footer
    │   └── ui/                    Modal, other primitives
    │
    ├── hooks/                    # Global hooks: useAuth, useDebounce
    ├── types/                    # Shared API/pagination TS types
    │
    ├── pages/                    # Thin route targets, compose feature components
    │   ├── HomePage.tsx, CategoriesPage.tsx, ProductListingPage.tsx,
    │   │   ProductDetailsPage.tsx, SearchPage.tsx
    │   ├── LoginPage.tsx, RegisterPage.tsx, ForgotPasswordPage.tsx, ResetPasswordPage.tsx
    │   ├── ProfilePage.tsx, WishlistPage.tsx, CartPage.tsx, CheckoutPage.tsx,
    │   │   AddressesPage.tsx, OrderHistoryPage.tsx, OrderDetailsPage.tsx
    │   ├── NotFoundPage.tsx
    │   └── admin/                 AdminDashboardPage, AdminProductsPage, AdminCategoriesPage,
    │                               AdminInventoryPage, AdminOrdersPage, AdminUsersPage,
    │                               AdminAnalyticsPage
    │
    └── features/                 # ⭐ Mirrors backend module boundaries
        ├── auth/ products/ categories/ cart/ wishlist/ checkout/
        ├── orders/ addresses/ reviews/ profile/ admin/ search/
        │
        │   Each feature folder has the identical slice:
        │   ├── api/<feature>Api.ts        Axios calls to backend /api/v1/<feature>
        │   ├── hooks/use<Feature>.ts      React hooks encapsulating feature state
        │   ├── components/                Feature-specific UI components
        │   └── types/<feature>.types.ts   TypeScript types for the feature
```

---

## database/

```
database/
├── init/
│   ├── 00_extensions.sql   # Enable uuid-ossp/pgcrypto
│   └── README.md
├── migrations/             # Mirrors backend/alembic/versions conceptually (SQL reference copies)
├── seeds/
│   ├── seed_roles.sql
│   ├── seed_categories.sql
│   └── seed_products.sql
└── erd/
    └── README.md           # Points to docs/DATABASE_ERD.md (Mermaid source of truth)
```

## infra/ (empty scaffolding — populated in the DevOps phase, after the app is complete)

```
infra/
├── docker/{frontend,backend,nginx}/       # Dockerfiles
├── docker-compose/                        # docker-compose.yml, docker-compose.prod.yml
├── kubernetes/base/ + overlays/{dev,staging,prod}/   # Kustomize manifests
├── helm/ecommerce-chart/                  # Helm chart
├── terraform/modules/ + environments/{dev,staging,prod}/  # AWS IaC
├── jenkins/                               # Jenkinsfile(s)
├── nginx/                                 # Standalone reverse-proxy config
├── monitoring/prometheus/ + grafana/dashboards/   # Observability config
└── rabbitmq/                              # Async messaging config

.github/workflows/                         # GitHub Actions (ci.yml, cd.yml)
```

Every `README.md` inside `infra/` states exactly what will be added there and
why, so the DevOps phase has zero ambiguity about where each artifact belongs.

## docs/

```
docs/
├── ARCHITECTURE.md              # Layers, patterns, request flow, security design
├── FOLDER_STRUCTURE.md          # This file
├── DATABASE_ERD.md              # Normalized schema + Mermaid ER diagram
├── MICROSERVICES_ROADMAP.md     # Module → standalone service extraction plan
├── DEPLOYMENT_ROADMAP.md        # Docker → Compose → CI → K8s → Helm → Terraform → Observability
└── API_DESIGN.md                # REST conventions, versioning, endpoint map
```
