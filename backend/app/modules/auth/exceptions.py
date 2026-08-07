from app.core.exceptions import BadRequestError, UnauthorizedError, ConflictError, NotFoundError


class EmailAlreadyRegisteredError(ConflictError):
    detail = "An account with this email already exists"


class InvalidCredentialsError(UnauthorizedError):
    detail = "Invalid email or password"


class InvalidTokenError(UnauthorizedError):
    detail = "Invalid or expired token"


class UserNotFoundError(NotFoundError):
    detail = "User not found"


class IncorrectPasswordError(BadRequestError):
    detail = "Current password is incorrect"
