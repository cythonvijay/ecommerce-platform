from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CheckoutRequest(BaseModel):
    address_id: int
    payment_method: str = "cod"  # card | upi | cod


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name: str
    unit_price: float
    quantity: int
    line_total: float


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    status: str
    subtotal: float
    shipping_fee: float
    total: float
    created_at: datetime
    items: list[OrderItemOut]


class OrderStatusUpdate(BaseModel):
    status: str


class PaginatedOrders(BaseModel):
    items: list[OrderOut]
    total: int
    page: int
    page_size: int
    pages: int
