# Database Design (PostgreSQL)

Normalized (3NF) relational schema. Full DDL and Alembic migrations are
generated in **Step 4**; this document is the design contract that Step 4
implements exactly.

## Entity-Relationship Diagram

```mermaid
erDiagram
    ROLES ||--o{ USERS : "has"
    USERS ||--o{ ADDRESSES : "owns"
    USERS ||--o{ ORDERS : "places"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ WISHLISTS : "owns"
    USERS ||--o{ REFRESH_TOKENS : "holds"

    CATEGORIES ||--o{ CATEGORIES : "parent_of"
    CATEGORIES ||--o{ PRODUCTS : "classifies"

    PRODUCTS ||--o{ PRODUCT_IMAGES : "has"
    PRODUCTS ||--|| INVENTORY : "tracked_by"
    PRODUCTS ||--o{ REVIEWS : "receives"
    PRODUCTS ||--o{ ORDER_ITEMS : "sold_as"
    PRODUCTS ||--o{ WISHLIST_ITEMS : "saved_as"

    WISHLISTS ||--o{ WISHLIST_ITEMS : "contains"

    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--|| PAYMENTS : "settled_by"
    ORDERS }o--|| ADDRESSES : "ships_to"
    ORDERS }o--|| ADDRESSES : "bills_to"
    ORDERS }o--o| COUPONS : "applies"

    ROLES {
        uuid id PK
        varchar name UK "ADMIN, CUSTOMER"
        varchar description
        timestamptz created_at
    }

    USERS {
        uuid id PK
        uuid role_id FK
        varchar email UK
        varchar hashed_password
        varchar first_name
        varchar last_name
        varchar phone
        boolean is_active
        boolean is_verified
        timestamptz created_at
        timestamptz updated_at
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        timestamptz expires_at
        boolean revoked
        timestamptz created_at
    }

    ADDRESSES {
        uuid id PK
        uuid user_id FK
        varchar label "Home, Work"
        varchar full_name
        varchar phone
        varchar line1
        varchar line2
        varchar city
        varchar state
        varchar postal_code
        varchar country
        boolean is_default
        timestamptz created_at
    }

    CATEGORIES {
        uuid id PK
        uuid parent_id FK "nullable, self-referencing"
        varchar name
        varchar slug UK
        text description
        boolean is_active
        timestamptz created_at
    }

    PRODUCTS {
        uuid id PK
        uuid category_id FK
        varchar sku UK
        varchar name
        varchar slug UK
        text description
        numeric price
        numeric discount_price
        boolean is_active
        numeric avg_rating "denormalized, updated on review write"
        integer review_count "denormalized"
        timestamptz created_at
        timestamptz updated_at
    }

    PRODUCT_IMAGES {
        uuid id PK
        uuid product_id FK
        varchar url
        varchar alt_text
        integer display_order
        boolean is_primary
    }

    INVENTORY {
        uuid id PK
        uuid product_id FK UK "1:1 with product"
        integer quantity_available
        integer quantity_reserved
        integer reorder_threshold
        timestamptz updated_at
    }

    ORDERS {
        uuid id PK
        uuid user_id FK
        uuid shipping_address_id FK
        uuid billing_address_id FK
        uuid coupon_id FK "nullable"
        varchar status "PENDING, PAID, SHIPPED, DELIVERED, CANCELLED"
        numeric subtotal
        numeric discount_total
        numeric shipping_total
        numeric tax_total
        numeric grand_total
        timestamptz created_at
        timestamptz updated_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        varchar product_name_snapshot
        numeric unit_price_snapshot
        integer quantity
        numeric line_total
    }

    PAYMENTS {
        uuid id PK
        uuid order_id FK UK "1:1 with order"
        varchar provider "STRIPE, RAZORPAY, COD"
        varchar provider_reference
        varchar status "INITIATED, SUCCEEDED, FAILED, REFUNDED"
        numeric amount
        varchar currency
        timestamptz created_at
        timestamptz updated_at
    }

    REVIEWS {
        uuid id PK
        uuid product_id FK
        uuid user_id FK
        integer rating "1-5"
        varchar title
        text comment
        boolean is_verified_purchase
        timestamptz created_at
    }

    WISHLISTS {
        uuid id PK
        uuid user_id FK UK "1:1 default wishlist per user"
        timestamptz created_at
    }

    WISHLIST_ITEMS {
        uuid id PK
        uuid wishlist_id FK
        uuid product_id FK
        timestamptz added_at
    }

    COUPONS {
        uuid id PK
        varchar code UK
        varchar discount_type "PERCENTAGE, FIXED"
        numeric discount_value
        numeric min_order_value
        integer usage_limit
        integer usage_count
        timestamptz valid_from
        timestamptz valid_until
        boolean is_active
    }
```

## Design Notes

- **UUID primary keys** everywhere — avoids leaking sequential IDs, and is the
  standard choice once services (and their own DBs) are split later, since
  auto-increment integers collide across databases while UUIDs don't.
- **`INVENTORY` is a separate table from `PRODUCTS`** (1:1) on purpose: it's
  the exact seam the future **Inventory Service** owns. Splitting later means
  moving one table, not carving fields out of `PRODUCTS`.
- **`PAYMENTS` is separate from `ORDERS`** (1:1) for the same reason — the
  future **Payment Service** owns this table and nothing else.
- **`ORDER_ITEMS` snapshots product name/price** at time of purchase
  (`product_name_snapshot`, `unit_price_snapshot`) so historical orders remain
  accurate even if a product is later renamed, repriced, or deleted.
- **`CATEGORIES` is self-referencing** via `parent_id` to support a category
  tree (e.g., Electronics → Laptops → Gaming Laptops) with a single table.
- **`ADDRESSES` is reused for both shipping and billing** on an order via two
  FKs (`shipping_address_id`, `billing_address_id`) rather than duplicating
  address data per order.
- **`avg_rating` / `review_count` on `PRODUCTS`** are intentional denormalization
  for fast product-listing reads; they're recalculated by the Reviews module's
  service layer on write (not by a DB trigger), keeping the logic visible and
  testable in Python.
- **`REFRESH_TOKENS`** is a dedicated table (not just a JWT claim) so refresh
  tokens can be individually revoked (logout, "sign out other devices").
- All tables include `created_at`/`updated_at` (`timestamptz`) for auditability.

## Indexing Plan (applied in Step 4 migrations)

| Table | Index | Reason |
|---|---|---|
| `products` | `(category_id)`, `(slug)`, `(sku)`, GIN on `name`/`description` | Category browse, slug lookup, full-text search |
| `orders` | `(user_id, created_at desc)` | Order history pagination |
| `order_items` | `(order_id)`, `(product_id)` | Order detail fetch, product sales aggregation |
| `reviews` | `(product_id, created_at desc)` | Product page review list |
| `inventory` | `(product_id)` UNIQUE | Enforce 1:1, fast stock lookup |
| `coupons` | `(code)` UNIQUE | Checkout validation lookup |
| `wishlist_items` | `(wishlist_id, product_id)` UNIQUE | Prevent duplicate saves |

## Caching Plan (Redis, wired in later steps)

| Data | Key pattern | Invalidation |
|---|---|---|
| Product detail | `product:{id}` | On product update/delete (Products module) |
| Category tree | `categories:tree` | On category CRUD |
| Session/JWT blacklist | `token:blacklist:{jti}` | On logout / refresh rotation |
| Cart (guest, pre-login) | `cart:{session_id}` | TTL-based |
