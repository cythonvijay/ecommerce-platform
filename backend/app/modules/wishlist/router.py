from typing import List
from fastapi import APIRouter, Depends, status

from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.wishlist.dependencies import get_wishlist_service
from app.modules.wishlist.schemas import WishlistAdd, WishlistItemOut
from app.modules.wishlist.service import WishlistService

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=List[WishlistItemOut])
def list_wishlist(current_user: User = Depends(get_current_user), service: WishlistService = Depends(get_wishlist_service)):
    return service.list_for_user(current_user.id)


@router.post("", response_model=WishlistItemOut, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(payload: WishlistAdd, current_user: User = Depends(get_current_user), service: WishlistService = Depends(get_wishlist_service)):
    return service.add(current_user.id, payload.product_id)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(item_id: int, current_user: User = Depends(get_current_user), service: WishlistService = Depends(get_wishlist_service)):
    service.remove(current_user.id, item_id)
    return None
