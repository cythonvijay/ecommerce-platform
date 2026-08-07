from typing import Sequence
from sqlalchemy.orm import Session

from app.modules.inventory.models import Inventory
from app.modules.inventory.repository import InventoryRepository
from app.modules.inventory.schemas import InventoryAdjust
from app.modules.inventory.exceptions import InventoryNotFoundError, InsufficientStockError


class InventoryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = InventoryRepository(db)

    def list_all(self, skip: int = 0, limit: int = 50) -> Sequence[Inventory]:
        return self.repo.list(skip, limit)

    def get_by_product(self, product_id: int) -> Inventory:
        inv = self.repo.get_by_product(product_id)
        if not inv:
            raise InventoryNotFoundError()
        return inv

    def adjust(self, product_id: int, payload: InventoryAdjust) -> Inventory:
        inv = self.get_by_product(product_id)
        inv.quantity = payload.quantity
        if payload.low_stock_threshold is not None:
            inv.low_stock_threshold = payload.low_stock_threshold
        self.db.commit()
        self.db.refresh(inv)
        return inv

    def reserve(self, product_id: int, quantity: int) -> None:
        inv = self.get_by_product(product_id)
        if inv.available < quantity:
            raise InsufficientStockError()
        inv.reserved_quantity += quantity
        inv.quantity -= quantity
        self.db.commit()
