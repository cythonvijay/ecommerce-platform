from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.common.repository.base import BaseRepository
from app.modules.cart.models import Cart, CartItem
from app.modules.products.models import Product


class CartRepository(BaseRepository[Cart]):
    def __init__(self, db: Session):
        super().__init__(db, Cart)

    def get_by_user(self, user_id: int) -> Optional[Cart]:
        stmt = (
            select(Cart)
            .options(
                joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.images),
                joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.inventory),
            )
            .where(Cart.user_id == user_id)
        )
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def get_item(self, cart_id: int, product_id: int) -> Optional[CartItem]:
        stmt = select(CartItem).where(CartItem.cart_id == cart_id, CartItem.product_id == product_id)
        return self.db.execute(stmt).scalar_one_or_none()
