from typing import Sequence
from sqlalchemy.orm import Session

from app.modules.addresses.models import Address
from app.modules.addresses.repository import AddressRepository
from app.modules.addresses.schemas import AddressCreate, AddressUpdate
from app.modules.addresses.exceptions import AddressNotFoundError, AddressNotOwnedError


class AddressService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AddressRepository(db)

    def list_for_user(self, user_id: int) -> Sequence[Address]:
        return self.repo.list_for_user(user_id)

    def _get_owned(self, address_id: int, user_id: int) -> Address:
        address = self.repo.get(address_id)
        if not address:
            raise AddressNotFoundError()
        if address.user_id != user_id:
            raise AddressNotOwnedError()
        return address

    def create(self, user_id: int, payload: AddressCreate) -> Address:
        if payload.is_default:
            for addr in self.repo.list_for_user(user_id):
                addr.is_default = False
        address = Address(user_id=user_id, **payload.model_dump())
        return self.repo.create(address)

    def update(self, address_id: int, user_id: int, payload: AddressUpdate) -> Address:
        address = self._get_owned(address_id, user_id)
        data = payload.model_dump(exclude_unset=True)
        if data.get("is_default"):
            for addr in self.repo.list_for_user(user_id):
                addr.is_default = False
        return self.repo.update(address, data)

    def delete(self, address_id: int, user_id: int) -> None:
        address = self._get_owned(address_id, user_id)
        self.repo.delete(address)
