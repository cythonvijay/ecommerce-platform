# Architecture

## 1. Architectural Style

**Modular Monolith with Microservice-Ready Boundaries.**

The backend deploys as a single FastAPI application today, but is internally
decomposed into vertical, self-contained **modules** (`backend/app/modules/*`)
that each own their own models, schemas, repository, service, and router.
No module imports another module's `repository.py` or `models.py` directly —
cross-module interaction happens only through a module's `service.py`, the
same seam a future network call (REST/gRPC/message queue) would sit behind.

This means:
- Today: `orders/service.py` calls `inventory/service.py` in-process.
- Tomorrow: `orders/service.py` calls the Inventory Service over HTTP/gRPC,
  with everything else in the Order module unchanged.

## 2. Layered Architecture (per module)

```
Router (FastAPI)  →  Service (business logic)  →  Repository (data access)  →  SQLAlchemy Model  →  PostgreSQL
        ↑                     ↑
   Pydantic Schemas     Dependency Injection
   (I/O contracts)      (via FastAPI Depends)
```

| Layer | Responsibility | Must NOT do |
|---|---|---|
| **Router** | HTTP concerns only: parse request, call service, return schema, set status code | Contain business rules or raw SQL |
| **Service** | Business logic, orchestration, transaction boundaries, calls other modules' services | Know about HTTP (no `Request`/`Response`), no direct SQL |
| **Repository** | CRUD + queries against one SQLAlchemy model via the generic `Repository[T]` base | Contain business rules |
| **Schemas** | Pydantic models defining request/response contracts, decoupled from ORM models | Be reused as ORM models |

This is the classic **Repository Pattern + Service Layer**, chosen specifically
so business logic never leaks into routes (a hard requirement) and so the
data layer can be swapped (e.g., a module moves to its own database) without
touching business logic.

## 3. SOLID in Practice

- **S**ingle Responsibility — one module = one bounded context = one reason to change.
- **O**pen/Closed — new payment providers/notification channels implement an interface
  (`app/cache/cache_interface.py`, future `PaymentProvider` protocol) without modifying callers.
- **L**iskov Substitution — `Repository[T]` generic base guarantees any module repository
  is substitutable wherever the base contract is expected.
- **I**nterface Segregation — services depend on narrow interfaces (e.g., `CacheInterface`),
  not concrete Redis clients.
- **D**ependency Inversion — routers depend on services, services depend on repository/cache
  **abstractions**, injected via FastAPI's `Depends()`, never instantiated inline.

## 4. Dependency Injection

FastAPI's `Depends()` is used throughout:
```
router.py        → Depends(get_current_user), Depends(get_product_service)
dependencies.py   → factory functions that construct Service(Repository(db_session))
db/session.py     → Depends(get_db) yields a scoped SQLAlchemy session per request
```
This keeps services unit-testable (inject a fake repository) without a DI framework.

## 5. Request Flow (example: `GET /api/v1/products/{id}`)

```
Client
  → Nginx (future)
    → FastAPI app (main.py)
      → CORS / Logging / RateLimit middleware (app/common/middleware)
        → api/v1/router.py  (aggregator)
          → modules/products/router.py
            → Depends: get_product_service → ProductService(ProductRepository(db), cache)
            → service.get_product_by_id(id)
                → cache.get(...) [cache-aside, Redis interface]  → hit? return
                → repository.get(id) → SQLAlchemy → PostgreSQL
                → cache.set(...)
            → returns Pydantic ProductOut schema
      → global exception handlers translate domain exceptions → HTTP errors
  ← JSON response
```

## 6. Error Handling & Logging Strategy

- Domain exceptions (`modules/*/exceptions.py`, e.g. `ProductNotFoundError`) are
  raised in services and mapped centrally in `app/common/exceptions/handlers.py`
  to consistent HTTP responses (`app/common/schemas/response.py` error envelope).
- Structured logging (`app/core/logging.py`) with request correlation IDs
  (`app/common/middleware/logging.py`) — JSON-formatted so it's ready to ship
  to CloudWatch/ELK and to back Grafana log panels later.

## 7. Security Architecture

- Passwords hashed with bcrypt/argon2 via `app/core/security.py`.
- JWT access + refresh tokens; refresh rotation handled in the `auth` module.
- RBAC enforced via FastAPI dependencies (`require_role("ADMIN")`) checked
  **in `dependencies.py`**, not scattered across route bodies.
- Input validation entirely through Pydantic schemas at the router boundary.
- Rate limiting exposed as a pluggable interface (`core/rate_limit.py`) —
  in-memory now, Redis-backed later, without changing call sites.
- CORS configured centrally from environment variables (`core/config.py`).
- All secrets/config loaded via environment variables (`.env`, never hardcoded),
  validated at startup by a `pydantic-settings` `Settings` object.

## 8. API Design

- REST, versioned under `/api/v1/`.
- One router per module, mounted in `api/v1/router.py`.
- OpenAPI/Swagger auto-generated by FastAPI at `/docs` and `/redoc`.
- See `docs/API_DESIGN.md` for conventions and the full planned endpoint map.

## 9. Frontend Architecture

Feature-based structure mirroring backend module boundaries
(`frontend/src/features/<feature>/{api,components,hooks,types}`), so a
frontend engineer working on "orders" only touches `features/orders/*`.

- `api/axiosClient.ts` — single Axios instance with JWT + refresh-token interceptors.
- `store/` — lightweight global state (auth, cart) decoupled from server data.
- `routes/` — `ProtectedRoute` / `AdminRoute` guards enforce auth & RBAC client-side
  (server-side RBAC is the real boundary; this is UX only).
- `pages/` — thin route targets that compose feature components; no business logic.

## 10. Why This Enables Painless DevOps Later

| DevOps concern | Enabled by |
|---|---|
| Dockerize per-service | Each module has zero cross-module import of internals — clean container boundary |
| K8s / Helm multi-service | `infra/kubernetes`, `infra/helm` scaffolding already mirrors module names |
| CI per module | `backend/tests/{unit,integration}` structured so a module's tests can be selected/split |
| Horizontal scaling | Stateless services (session in JWT, cache in Redis, not in-process memory) |
| Observability | Structured JSON logs + a natural place to add `/metrics` (Prometheus) in `core/` |
| Config per environment | All config already externalized via env vars (12-factor) |
| Async messaging later | `notifications` module is the natural RabbitMQ consumer boundary |

See `docs/MICROSERVICES_ROADMAP.md` and `docs/DEPLOYMENT_ROADMAP.md` for the
concrete extraction and deployment path.
