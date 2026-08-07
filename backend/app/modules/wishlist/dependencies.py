from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.wishlist.service import WishlistService


def get_wishlist_service(db: Session = Depends(get_db)) -> WishlistService:
    return WishlistService(db)
