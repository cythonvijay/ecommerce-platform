from app.core.exceptions import NotFoundError


class UserNotFoundError(NotFoundError):
    detail = "User not found"
