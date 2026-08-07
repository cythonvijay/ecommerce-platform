from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.users.service import UserAdminService


def get_user_admin_service(db: Session = Depends(get_db)) -> UserAdminService:
    return UserAdminService(db)
