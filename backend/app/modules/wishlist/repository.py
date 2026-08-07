from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.common.repository.base import BaseRepository
from app.modules.wishlist.models import WishlistItem
from app.modules.products.models import Product


class WishlistRepository(BaseRepository[WishlistItem]):
    def __init__(self, db: Session):
        super().__init__(db, WishlistItem)

    def list_for_user(self, user_id: int) -> Sequence[WishlistItem]:
        stmt = (
            select(WishlistItem)
            .options(
                joinedload(WishlistItem.product).joinedload(Product.images),
                joinedload(WishlistItem.product).joinedload(Product.inventory),
            )
            .where(WishlistItem.user_id == user_id)
        )
        return self.db.execute(stmt).unique().scalars().all()

    def get_by_user_product(self, user_id: int, product_id: int) -> Optional[WishlistItem]:
        stmt = select(WishlistItem).where(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
        return self.db.execute(stmt).scalar_one_or_none()
