from app.core.exceptions import NotFoundError, BadRequestError


class CartNotFoundError(NotFoundError):
    detail = "Cart not found"


class CartItemNotFoundError(NotFoundError):
    detail = "Cart item not found"


class InsufficientStockForCartError(BadRequestError):
    detail = "Not enough stock available for the requested quantity"
