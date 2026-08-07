from pydantic import BaseModel, ConfigDict

from app.modules.products.schemas import ProductOut


class WishlistAdd(BaseModel):
    product_id: int


class WishlistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product: ProductOut
