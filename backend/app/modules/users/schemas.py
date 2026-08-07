from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class UserAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    is_active: bool
    role: str
    created_at: datetime


class UserStatusUpdate(BaseModel):
    is_active: bool


class PaginatedUsers(BaseModel):
    items: list[UserAdminOut]
    total: int
    page: int
    page_size: int
    pages: int
