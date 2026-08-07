from pydantic import BaseModel, Field, ConfigDict


class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str
    alt_text: str | None
    is_primary: bool


class ProductImageCreate(BaseModel):
    url: str
    alt_text: str | None = None
    is_primary: bool = False


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None
    price: float = Field(gt=0)
    compare_at_price: float | None = None
    category_id: int
    brand: str | None = None
    initial_quantity: int = Field(default=0, ge=0)
    images: list[ProductImageCreate] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    compare_at_price: float | None = None
    category_id: int | None = None
    brand: str | None = None
    is_active: bool | None = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: str | None
    price: float
    compare_at_price: float | None
    category_id: int
    brand: str | None
    is_active: bool
    rating_avg: float
    rating_count: int
    images: list[ProductImageOut] = []
    in_stock: bool = True
    stock_quantity: int = 0


class ProductListParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=12, ge=1, le=100)
    category_id: int | None = None
    search: str | None = None
    min_price: float | None = None
    max_price: float | None = None
    brand: str | None = None
    sort: str = "newest"  # newest | price_asc | price_desc | rating


class PaginatedProducts(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    page_size: int
    pages: int
