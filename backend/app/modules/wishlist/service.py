from typing import Sequence
from sqlalchemy.orm import Session

from app.modules.wishlist.models import WishlistItem
from app.modules.wishlist.repository import WishlistRepository
from app.modules.wishlist.schemas import WishlistItemOut
from app.modules.wishlist.exceptions import WishlistItemNotFoundError, AlreadyInWishlistError
from app.modules.products.repository import ProductRepository
from app.modules.products.service import ProductService
from app.modules.products.exceptions import ProductNotFoundError


class WishlistService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = WishlistRepository(db)
        self.products = ProductRepository(db)
        self.product_service = ProductService(db)

    def _to_out(self, item: WishlistItem) -> WishlistItemOut:
        return WishlistItemOut(id=item.id, product=self.product_service._to_out(item.product))

    def list_for_user(self, user_id: int) -> list[WishlistItemOut]:
        return [self._to_out(i) for i in self.repo.list_for_user(user_id)]

    def add(self, user_id: int, product_id: int) -> WishlistItemOut:
        if not self.products.get(product_id):
            raise ProductNotFoundError()
        if self.repo.get_by_user_product(user_id, product_id):
            raise AlreadyInWishlistError()
        item = WishlistItem(user_id=user_id, product_id=product_id)
        item = self.repo.create(item)
        return self._to_out(item)

    def remove(self, user_id: int, item_id: int) -> None:
        item = self.repo.get(item_id)
        if not item or item.user_id != user_id:
            raise WishlistItemNotFoundError()
        self.repo.delete(item)
