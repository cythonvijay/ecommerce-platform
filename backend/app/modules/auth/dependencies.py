from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.constants import RoleName
from app.core.exceptions import ForbiddenError
from app.core.security import decode_token
from app.db.session import get_db
from app.modules.auth.exceptions import InvalidTokenError, UserNotFoundError
from app.modules.auth.models import User
from app.modules.auth.repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=True)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise InvalidTokenError()
    user = UserRepository(db).get_with_role(int(payload["sub"]))
    if not user or not user.is_active:
        raise UserNotFoundError()
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role.name != RoleName.ADMIN.value:
        raise ForbiddenError("Admin privileges required")
    return user
