from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.products.service import ProductService


def get_product_service(db: Session = Depends(get_db)) -> ProductService:
    return ProductService(db)
