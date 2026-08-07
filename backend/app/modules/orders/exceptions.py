from app.core.exceptions import NotFoundError, BadRequestError, ForbiddenError


class OrderNotFoundError(NotFoundError):
    detail = "Order not found"


class OrderNotOwnedError(ForbiddenError):
    detail = "This order does not belong to you"


class EmptyCartError(BadRequestError):
    detail = "Cannot checkout with an empty cart"


class InvalidOrderStatusTransitionError(BadRequestError):
    detail = "Invalid order status transition"
