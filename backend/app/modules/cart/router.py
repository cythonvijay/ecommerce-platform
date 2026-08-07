from fastapi import APIRouter, Depends, status

from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.cart.dependencies import get_cart_service
from app.modules.cart.schemas import CartOut, CartItemAdd, CartItemUpdate
from app.modules.cart.service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=CartOut)
def get_cart(current_user: User = Depends(get_current_user), service: CartService = Depends(get_cart_service)):
    return service.get_cart(current_user.id)


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_item(payload: CartItemAdd, current_user: User = Depends(get_current_user), service: CartService = Depends(get_cart_service)):
    return service.add_item(current_user.id, payload)


@router.put("/items/{item_id}", response_model=CartOut)
def update_item(
    item_id: int,
    payload: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    service: CartService = Depends(get_cart_service),
):
    return service.update_item(current_user.id, item_id, payload.quantity)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(item_id: int, current_user: User = Depends(get_current_user), service: CartService = Depends(get_cart_service)):
    return service.remove_item(current_user.id, item_id)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(current_user: User = Depends(get_current_user), service: CartService = Depends(get_cart_service)):
    service.clear(current_user.id)
    return None
