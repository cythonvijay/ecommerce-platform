from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.constants import OrderStatus
from app.modules.orders.models import Order
from app.modules.products.models import Product
from app.modules.inventory.models import Inventory
from app.modules.auth.models import User
from app.modules.admin.schemas import DashboardStats


class AdminDashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_stats(self) -> DashboardStats:
        total_revenue = self.db.execute(
            select(func.coalesce(func.sum(Order.total), 0)).where(Order.status != OrderStatus.CANCELLED.value)
        ).scalar_one()
        total_orders = self.db.execute(select(func.count()).select_from(Order)).scalar_one()
        total_products = self.db.execute(select(func.count()).select_from(Product)).scalar_one()
        total_users = self.db.execute(select(func.count()).select_from(User)).scalar_one()
        pending_orders = self.db.execute(
            select(func.count()).select_from(Order).where(Order.status == OrderStatus.PENDING.value)
        ).scalar_one()
        low_stock = self.db.execute(
            select(func.count()).select_from(Inventory).where(Inventory.quantity <= Inventory.low_stock_threshold)
        ).scalar_one()

        recent = self.db.execute(select(Order).order_by(Order.created_at.desc()).limit(5)).scalars().all()
        recent_orders = [
            {"order_number": o.order_number, "status": o.status, "total": float(o.total)} for o in recent
        ]

        return DashboardStats(
            total_revenue=float(total_revenue),
            total_orders=total_orders,
            total_products=total_products,
            total_users=total_users,
            pending_orders=pending_orders,
            low_stock_products=low_stock,
            recent_orders=recent_orders,
        )
