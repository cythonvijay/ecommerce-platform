from app.core.exceptions import NotFoundError, ConflictError


class CategoryNotFoundError(NotFoundError):
    detail = "Category not found"


class CategoryNameExistsError(ConflictError):
    detail = "A category with this name already exists"
