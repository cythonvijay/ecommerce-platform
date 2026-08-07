from app.core.exceptions import NotFoundError, ForbiddenError


class AddressNotFoundError(NotFoundError):
    detail = "Address not found"


class AddressNotOwnedError(ForbiddenError):
    detail = "This address does not belong to you"
