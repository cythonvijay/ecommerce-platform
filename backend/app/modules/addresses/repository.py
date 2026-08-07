from typing import Sequence
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.repository.base import BaseRepository
from app.modules.addresses.models import Address


class AddressRepository(BaseRepository[Address]):
    def __init__(self, db: Session):
        super().__init__(db, Address)

    def list_for_user(self, user_id: int) -> Sequence[Address]:
        stmt = select(Address).where(Address.user_id == user_id).order_by(Address.is_default.desc(), Address.id.desc())
        return self.db.execute(stmt).scalars().all()
