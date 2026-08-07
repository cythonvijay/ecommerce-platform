from typing import Optional, Sequence, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload

from app.common.repository.base import BaseRepository
from app.modules.orders.models import Order


class OrderRepository(BaseRepository[Order]):
    def __init__(self, db: Session):
        super().__init__(db, Order)

    def get_with_items(self, order_id: int) -> Optional[Order]:
        stmt = select(Order).options(joinedload(Order.items)).where(Order.id == order_id)
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def list_for_user(self, user_id: int, skip: int, limit: int) -> Tuple[Sequence[Order], int]:
        stmt = (
            select(Order)
            .options(joinedload(Order.items))
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        count_stmt = select(func.count()).select_from(Order).where(Order.user_id == user_id)
        items = self.db.execute(stmt).unique().scalars().all()
        total = self.db.execute(count_stmt).scalar_one()
        return items, total

    def list_all(self, skip: int, limit: int, status: Optional[str] = None) -> Tuple[Sequence[Order], int]:
        stmt = select(Order).options(joinedload(Order.items)).order_by(Order.created_at.desc())
        count_stmt = select(func.count()).select_from(Order)
        if status:
            stmt = stmt.where(Order.status == status)
            count_stmt = count_stmt.where(Order.status == status)
        stmt = stmt.offset(skip).limit(limit)
        items = self.db.execute(stmt).unique().scalars().all()
        total = self.db.execute(count_stmt).scalar_one()
        return items, total
