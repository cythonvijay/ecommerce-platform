import math
from sqlalchemy.orm import Session

from app.common.utils.security_utils import slugify
from app.modules.products.models import Product, ProductImage
from app.modules.products.repository import ProductRepository
from app.modules.products.schemas import ProductCreate, ProductUpdate, ProductListParams, ProductOut
from app.modules.products.exceptions import ProductNotFoundError
from app.modules.inventory.models import Inventory


class ProductService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ProductRepository(db)

    def _to_out(self, product: Product) -> ProductOut:
        qty = product.inventory.available if product.inventory else 0
        return ProductOut(
            id=product.id,
            name=product.name,
            slug=product.slug,
            description=product.description,
            price=float(product.price),
            compare_at_price=float(product.compare_at_price) if product.compare_at_price else None,
            category_id=product.category_id,
            brand=product.brand,
            is_active=product.is_active,
            rating_avg=float(product.rating_avg),
            rating_count=product.rating_count,
            images=list(product.images),
            in_stock=qty > 0,
            stock_quantity=qty,
        )

    def list_products(self, params: ProductListParams, active_only: bool = True) -> dict:
        skip = (params.page - 1) * params.page_size
        items, total = self.repo.search(
            skip=skip,
            limit=params.page_size,
            category_id=params.category_id,
            search=params.search,
            min_price=params.min_price,
            max_price=params.max_price,
            brand=params.brand,
            sort=params.sort,
            active_only=active_only,
        )
        return {
            "items": [self._to_out(p) for p in items],
            "total": total,
            "page": params.page,
            "page_size": params.page_size,
            "pages": max(math.ceil(total / params.page_size), 1),
        }

    def get(self, product_id: int) -> ProductOut:
        product = self.repo.get_with_relations(product_id)
        if not product:
            raise ProductNotFoundError()
        return self._to_out(product)

    def get_by_slug(self, slug: str) -> ProductOut:
        product = self.repo.get_by_slug(slug)
        if not product:
            raise ProductNotFoundError()
        return self._to_out(product)

    def get_raw(self, product_id: int) -> Product:
        product = self.repo.get_with_relations(product_id)
        if not product:
            raise ProductNotFoundError()
        return product

    def create(self, payload: ProductCreate) -> ProductOut:
        slug_base = slugify(payload.name)
        slug = slug_base
        i = 1
        while self.repo.get_by_slug(slug):
            i += 1
            slug = f"{slug_base}-{i}"

        product = Product(
            name=payload.name,
            slug=slug,
            description=payload.description,
            price=payload.price,
            compare_at_price=payload.compare_at_price,
            category_id=payload.category_id,
            brand=payload.brand,
        )
        self.db.add(product)
        self.db.flush()

        for img in payload.images:
            self.db.add(ProductImage(product_id=product.id, url=img.url, alt_text=img.alt_text, is_primary=img.is_primary))

        self.db.add(Inventory(product_id=product.id, quantity=payload.initial_quantity))
        self.db.commit()
        return self.get(product.id)

    def update(self, product_id: int, payload: ProductUpdate) -> ProductOut:
        product = self.get_raw(product_id)
        data = payload.model_dump(exclude_unset=True)
        if "name" in data and data["name"]:
            data["slug"] = slugify(data["name"])
        for key, value in data.items():
            setattr(product, key, value)
        self.db.commit()
        return self.get(product_id)

    def delete(self, product_id: int) -> None:
        product = self.get_raw(product_id)
        self.db.delete(product)
        self.db.commit()
