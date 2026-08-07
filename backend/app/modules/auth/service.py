from sqlalchemy.orm import Session

from app.core.constants import RoleName
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.modules.auth.models import User, Role
from app.modules.auth.repository import UserRepository, RoleRepository
from app.modules.auth.schemas import RegisterRequest, LoginRequest, ChangePasswordRequest
from app.modules.auth.exceptions import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    InvalidTokenError,
    UserNotFoundError,
    IncorrectPasswordError,
)
from app.modules.cart.models import Cart


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.roles = RoleRepository(db)

    def register(self, payload: RegisterRequest) -> User:
        if self.users.get_by_email(payload.email):
            raise EmailAlreadyRegisteredError()

        customer_role = self.roles.get_by_name(RoleName.CUSTOMER.value)
        if not customer_role:
            customer_role = self.roles.create(Role(name=RoleName.CUSTOMER.value))

        user = User(
            full_name=payload.full_name,
            email=payload.email,
            hashed_password=hash_password(payload.password),
            phone=payload.phone,
            role_id=customer_role.id,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # every user gets an empty cart on registration
        self.db.add(Cart(user_id=user.id))
        self.db.commit()

        return self.users.get_with_role(user.id)

    def authenticate(self, payload: LoginRequest) -> User:
        user = self.users.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise InvalidCredentialsError()
        if not user.is_active:
            raise InvalidCredentialsError("Account is deactivated")
        return user

    def issue_tokens(self, user: User) -> dict:
        access = create_access_token(str(user.id), extra={"role": user.role.name})
        refresh = create_refresh_token(str(user.id))
        return {"access_token": access, "refresh_token": refresh}

    def refresh_access_token(self, refresh_token: str) -> str:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise InvalidTokenError()
        user = self.users.get_with_role(int(payload["sub"]))
        if not user or not user.is_active:
            raise InvalidTokenError()
        return create_access_token(str(user.id), extra={"role": user.role.name})

    def change_password(self, user: User, payload: ChangePasswordRequest) -> None:
        if not verify_password(payload.current_password, user.hashed_password):
            raise IncorrectPasswordError()
        user.hashed_password = hash_password(payload.new_password)
        self.db.commit()

    def get_profile(self, user_id: int) -> User:
        user = self.users.get_with_role(user_id)
        if not user:
            raise UserNotFoundError()
        return user

    def update_profile(self, user: User, full_name: str | None, phone: str | None) -> User:
        if full_name is not None:
            user.full_name = full_name
        if phone is not None:
            user.phone = phone
        self.db.commit()
        self.db.refresh(user)
        return user
