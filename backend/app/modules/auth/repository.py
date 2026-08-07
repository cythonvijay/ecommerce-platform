from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.common.repository.base import BaseRepository
from app.modules.auth.models import User, Role


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(db, User)

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).options(joinedload(User.role)).where(User.email == email)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_with_role(self, user_id: int) -> Optional[User]:
        stmt = select(User).options(joinedload(User.role)).where(User.id == user_id)
        return self.db.execute(stmt).scalar_one_or_none()


class RoleRepository(BaseRepository[Role]):
    def __init__(self, db: Session):
        super().__init__(db, Role)

    def get_by_name(self, name: str) -> Optional[Role]:
        stmt = select(Role).where(Role.name == name)
        return self.db.execute(stmt).scalar_one_or_none()
