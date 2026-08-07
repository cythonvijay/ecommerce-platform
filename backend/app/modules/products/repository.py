from typing import Optional, Sequence, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, joinedload

from app.common.repository.base import BaseRepository
from app.modules.products.models import Product


class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: Session):
        super().__init__(db, Product)

    def get_by_slug(self, slug: str) -> Optional[Product]:
        stmt = (
            select(Product)
            .options(joinedload(Product.images), joinedload(Product.inventory), joinedload(Product.category))
            .where(Product.slug == slug)
        )
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def get_with_relations(self, product_id: int) -> Optional[Product]:
        stmt = (
            select(Product)
            .options(joinedload(Product.images), joinedload(Product.inventory), joinedload(Product.category))
            .where(Product.id == product_id)
        )
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def search(
        self,
        skip: int,
        limit: int,
        category_id: Optional[int] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        brand: Optional[str] = None,
        sort: str = "newest",
        active_only: bool = True,
    ) -> Tuple[Sequence[Product], int]:
        stmt = select(Product).options(joinedload(Product.images), joinedload(Product.inventory))
        count_stmt = select(func.count(func.distinct(Product.id))).select_from(Product)

        conditions = []
        if active_only:
            conditions.append(Product.is_active.is_(True))
        if category_id:
            conditions.append(Product.category_id == category_id)
        if search:
            like = f"%{search}%"
            conditions.append(or_(Product.name.ilike(like), Product.description.ilike(like), Product.brand.ilike(like)))
        if min_price is not None:
            conditions.append(Product.price >= min_price)
        if max_price is not None:
            conditions.append(Product.price <= max_price)
        if brand:
            conditions.append(Product.brand == brand)

        for c in conditions:
            stmt = stmt.where(c)
            count_stmt = count_stmt.where(c)

        if sort == "price_asc":
            stmt = stmt.order_by(Product.price.asc())
        elif sort == "price_desc":
            stmt = stmt.order_by(Product.price.desc())
        elif sort == "rating":
            stmt = stmt.order_by(Product.rating_avg.desc())
        else:
            stmt = stmt.order_by(Product.created_at.desc())

        stmt = stmt.offset(skip).limit(limit)

        items = self.db.execute(stmt).unique().scalars().all()
        total = self.db.execute(count_stmt).scalar_one()
        return items, total
