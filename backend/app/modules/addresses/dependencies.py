from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.addresses.service import AddressService


def get_address_service(db: Session = Depends(get_db)) -> AddressService:
    return AddressService(db)
