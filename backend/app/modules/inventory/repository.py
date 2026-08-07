from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.repository.base import BaseRepository
from app.modules.inventory.models import Inventory


class InventoryRepository(BaseRepository[Inventory]):
    def __init__(self, db: Session):
        super().__init__(db, Inventory)

    def get_by_product(self, product_id: int) -> Optional[Inventory]:
        stmt = select(Inventory).where(Inventory.product_id == product_id)
        return self.db.execute(stmt).scalar_one_or_none()
