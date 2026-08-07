from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    total_products: int
    total_users: int
    pending_orders: int
    low_stock_products: int
    recent_orders: list[dict]
