from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.cart.service import CartService


def get_cart_service(db: Session = Depends(get_db)) -> CartService:
    return CartService(db)
