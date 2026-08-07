from fastapi import APIRouter, Depends, status, Query

from app.modules.auth.dependencies import get_current_user, require_admin
from app.modules.auth.models import User
from app.modules.orders.dependencies import get_order_service
from app.modules.orders.schemas import CheckoutRequest, OrderOut, PaginatedOrders, OrderStatusUpdate
from app.modules.orders.service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/checkout", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def checkout(payload: CheckoutRequest, current_user: User = Depends(get_current_user), service: OrderService = Depends(get_order_service)):
    return service.checkout(current_user.id, payload)


@router.get("", response_model=PaginatedOrders)
def list_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service),
):
    return service.list_for_user(current_user.id, page, page_size)


# --- Admin (declared before /{order_id} so "admin" is never parsed as an id) ---

@router.get("/admin/all", response_model=PaginatedOrders, dependencies=[Depends(require_admin)])
def admin_list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    service: OrderService = Depends(get_order_service),
):
    return service.list_all(page, page_size, status_filter)


@router.put("/admin/{order_id}/status", response_model=OrderOut, dependencies=[Depends(require_admin)])
def admin_update_status(order_id: int, payload: OrderStatusUpdate, service: OrderService = Depends(get_order_service)):
    return service.update_status(order_id, payload.status)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, current_user: User = Depends(get_current_user), service: OrderService = Depends(get_order_service)):
    return service.get_for_user(order_id, current_user.id)
