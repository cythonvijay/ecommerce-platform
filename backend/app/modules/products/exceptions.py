from app.core.exceptions import NotFoundError


class ProductNotFoundError(NotFoundError):
    detail = "Product not found"
