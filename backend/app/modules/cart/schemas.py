from pydantic import BaseModel, ConfigDict, Field

from app.modules.products.schemas import ProductOut


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product: ProductOut
    quantity: int
    line_total: float


class CartOut(BaseModel):
    items: list[CartItemOut]
    subtotal: float
    item_count: int
