from typing import List
from fastapi import APIRouter, Depends, status

from app.modules.auth.dependencies import require_admin
from app.modules.categories.dependencies import get_category_service
from app.modules.categories.schemas import CategoryCreate, CategoryUpdate, CategoryOut
from app.modules.categories.service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryOut])
def list_categories(service: CategoryService = Depends(get_category_service)):
    return service.list_categories()


@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, service: CategoryService = Depends(get_category_service)):
    return service.get(category_id)


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_category(payload: CategoryCreate, service: CategoryService = Depends(get_category_service)):
    return service.create(payload)


@router.put("/{category_id}", response_model=CategoryOut, dependencies=[Depends(require_admin)])
def update_category(category_id: int, payload: CategoryUpdate, service: CategoryService = Depends(get_category_service)):
    return service.update(category_id, payload)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_category(category_id: int, service: CategoryService = Depends(get_category_service)):
    service.delete(category_id)
    return None
