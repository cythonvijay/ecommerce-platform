import math
import uuid
from sqlalchemy.orm import Session

from app.core.constants import OrderStatus, PaymentStatus, PaymentMethod
from app.modules.orders.models import Order, OrderItem
from app.modules.orders.repository import OrderRepository
from app.modules.orders.schemas import CheckoutRequest
from app.modules.orders.exceptions import (
    OrderNotFoundError,
    OrderNotOwnedError,
    EmptyCartError,
    InvalidOrderStatusTransitionError,
)
from app.modules.cart.repository import CartRepository
from app.modules.addresses.repository import AddressRepository
from app.modules.addresses.exceptions import AddressNotFoundError
from app.modules.payments.models import Payment

VALID_TRANSITIONS = {
    OrderStatus.PENDING.value: {OrderStatus.CONFIRMED.value, OrderStatus.CANCELLED.value},
    OrderStatus.CONFIRMED.value: {OrderStatus.SHIPPED.value, OrderStatus.CANCELLED.value},
    OrderStatus.SHIPPED.value: {OrderStatus.DELIVERED.value},
    OrderStatus.DELIVERED.value: set(),
    OrderStatus.CANCELLED.value: set(),
}

SHIPPING_FEE_FLAT = 49.0
FREE_SHIPPING_THRESHOLD = 999.0


class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = OrderRepository(db)
        self.carts = CartRepository(db)
        self.addresses = AddressRepository(db)

    def checkout(self, user_id: int, payload: CheckoutRequest) -> Order:
        cart = self.carts.get_by_user(user_id)
        if not cart or not cart.items:
            raise EmptyCartError()

        address = self.addresses.get(payload.address_id)
        if not address or address.user_id != user_id:
            raise AddressNotFoundError()

        subtotal = sum(float(item.product.price) * item.quantity for item in cart.items)
        shipping_fee = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_FEE_FLAT
        total = subtotal + shipping_fee

        order = Order(
            order_number=f"ORD-{uuid.uuid4().hex[:10].upper()}",
            user_id=user_id,
            address_id=address.id,
            status=OrderStatus.PENDING.value,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            total=total,
        )
        self.db.add(order)
        self.db.flush()

        for item in cart.items:
            self.db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=item.product_id,
                    product_name=item.product.name,
                    unit_price=item.product.price,
                    quantity=item.quantity,
                    line_total=float(item.product.price) * item.quantity,
                )
            )
            if item.product.inventory:
                item.product.inventory.quantity = max(item.product.inventory.quantity - item.quantity, 0)

        self.db.add(
            Payment(
                order_id=order.id,
                method=payload.payment_method,
                status=PaymentStatus.PAID.value if payload.payment_method != PaymentMethod.COD.value else PaymentStatus.PENDING.value,
                amount=total,
            )
        )

        for item in list(cart.items):
            self.db.delete(item)

        self.db.commit()
        return self.repo.get_with_items(order.id)

    def get_for_user(self, order_id: int, user_id: int) -> Order:
        order = self.repo.get_with_items(order_id)
        if not order:
            raise OrderNotFoundError()
        if order.user_id != user_id:
            raise OrderNotOwnedError()
        return order

    def list_for_user(self, user_id: int, page: int, page_size: int) -> dict:
        skip = (page - 1) * page_size
        items, total = self.repo.list_for_user(user_id, skip, page_size)
        return self._paginate(items, total, page, page_size)

    def list_all(self, page: int, page_size: int, status: str | None = None) -> dict:
        skip = (page - 1) * page_size
        items, total = self.repo.list_all(skip, page_size, status)
        return self._paginate(items, total, page, page_size)

    def _paginate(self, items, total, page, page_size) -> dict:
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": max(math.ceil(total / page_size), 1) if page_size else 1,
        }

    def get_any(self, order_id: int) -> Order:
        order = self.repo.get_with_items(order_id)
        if not order:
            raise OrderNotFoundError()
        return order

    def update_status(self, order_id: int, new_status: str) -> Order:
        order = self.get_any(order_id)
        allowed = VALID_TRANSITIONS.get(order.status, set())
        if new_status not in allowed:
            raise InvalidOrderStatusTransitionError(
                f"Cannot transition order from '{order.status}' to '{new_status}'"
            )
        order.status = new_status
        self.db.commit()
        self.db.refresh(order)
        return order
