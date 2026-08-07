from typing import List
from fastapi import APIRouter, Depends

from app.modules.auth.dependencies import require_admin
from app.modules.inventory.dependencies import get_inventory_service
from app.modules.inventory.schemas import InventoryOut, InventoryAdjust
from app.modules.inventory.service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"], dependencies=[Depends(require_admin)])


@router.get("", response_model=List[InventoryOut])
def list_inventory(service: InventoryService = Depends(get_inventory_service)):
    items = service.list_all(limit=1000)
    return [InventoryOut(**{**i.__dict__, "available": i.available}) for i in items]


@router.get("/{product_id}", response_model=InventoryOut)
def get_inventory(product_id: int, service: InventoryService = Depends(get_inventory_service)):
    inv = service.get_by_product(product_id)
    return InventoryOut(**{**inv.__dict__, "available": inv.available})


@router.put("/{product_id}", response_model=InventoryOut)
def adjust_inventory(product_id: int, payload: InventoryAdjust, service: InventoryService = Depends(get_inventory_service)):
    inv = service.adjust(product_id, payload)
    return InventoryOut(**{**inv.__dict__, "available": inv.available})
