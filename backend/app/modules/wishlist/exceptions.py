from app.core.exceptions import NotFoundError, ConflictError


class WishlistItemNotFoundError(NotFoundError):
    detail = "Wishlist item not found"


class AlreadyInWishlistError(ConflictError):
    detail = "Product already in wishlist"
