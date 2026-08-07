from app.core.exceptions import NotFoundError, ConflictError


class ReviewNotFoundError(NotFoundError):
    detail = "Review not found"


class AlreadyReviewedError(ConflictError):
    detail = "You have already reviewed this product"
