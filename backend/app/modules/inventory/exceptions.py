from app.core.exceptions import NotFoundError, BadRequestError


class InventoryNotFoundError(NotFoundError):
    detail = "Inventory record not found"


class InsufficientStockError(BadRequestError):
    detail = "Insufficient stock available"
