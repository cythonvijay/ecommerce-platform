from typing import Sequence, Tuple
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload

from app.common.repository.base import BaseRepository
from app.modules.auth.models import User


class AdminUserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(db, User)

    def list_all(self, skip: int, limit: int) -> Tuple[Sequence[User], int]:
        stmt = select(User).options(joinedload(User.role)).order_by(User.created_at.desc()).offset(skip).limit(limit)
        count_stmt = select(func.count()).select_from(User)
        items = self.db.execute(stmt).unique().scalars().all()
        total = self.db.execute(count_stmt).scalar_one()
        return items, total
