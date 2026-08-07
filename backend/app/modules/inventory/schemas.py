from pydantic import BaseModel, ConfigDict, Field


class InventoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    quantity: int
    reserved_quantity: int
    low_stock_threshold: int
    available: int


class InventoryAdjust(BaseModel):
    quantity: int = Field(ge=0)
    low_stock_threshold: int | None = Field(default=None, ge=0)
