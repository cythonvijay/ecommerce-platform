import math
from sqlalchemy.orm import Session

from app.modules.auth.models import User
from app.modules.users.repository import AdminUserRepository
from app.modules.users.exceptions import UserNotFoundError


class UserAdminService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AdminUserRepository(db)

    def list_all(self, page: int, page_size: int) -> dict:
        skip = (page - 1) * page_size
        items, total = self.repo.list_all(skip, page_size)
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": max(math.ceil(total / page_size), 1),
        }

    def set_active(self, user_id: int, is_active: bool) -> User:
        user = self.repo.get(user_id)
        if not user:
            raise UserNotFoundError()
        user.is_active = is_active
        self.db.commit()
        self.db.refresh(user)
        return user
