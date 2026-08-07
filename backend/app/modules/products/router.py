from fastapi import APIRouter, Depends, status, Query

from app.modules.auth.dependencies import require_admin
from app.modules.products.dependencies import get_product_service
from app.modules.products.schemas import ProductCreate, ProductUpdate, ProductOut, ProductListParams, PaginatedProducts
from app.modules.products.service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=PaginatedProducts)
def list_products(
    params: ProductListParams = Depends(),
    service: ProductService = Depends(get_product_service),
):
    return service.list_products(params)


@router.get("/slug/{slug}", response_model=ProductOut)
def get_product_by_slug(slug: str, service: ProductService = Depends(get_product_service)):
    return service.get_by_slug(slug)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, service: ProductService = Depends(get_product_service)):
    return service.get(product_id)


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_product(payload: ProductCreate, service: ProductService = Depends(get_product_service)):
    return service.create(payload)


@router.put("/{product_id}", response_model=ProductOut, dependencies=[Depends(require_admin)])
def update_product(product_id: int, payload: ProductUpdate, service: ProductService = Depends(get_product_service)):
    return service.update(product_id, payload)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_product(product_id: int, service: ProductService = Depends(get_product_service)):
    service.delete(product_id)
    return None
