"""Import hub: importing this module registers every ORM model on
Base.metadata. Required by Alembic autogenerate and used once at app
startup. Must be imported AFTER app.db.base has fully loaded, so it lives
in its own module rather than at the bottom of base.py (which would cause
a circular import since models import Base from base.py)."""
from app.modules.auth.models import Role, User  # noqa: F401
from app.modules.categories.models import Category  # noqa: F401
from app.modules.products.models import Product, ProductImage  # noqa: F401
from app.modules.inventory.models import Inventory  # noqa: F401
from app.modules.addresses.models import Address  # noqa: F401
from app.modules.orders.models import Order, OrderItem  # noqa: F401
from app.modules.payments.models import Payment  # noqa: F401
from app.modules.reviews.models import Review  # noqa: F401
from app.modules.wishlist.models import WishlistItem  # noqa: F401
from app.modules.cart.models import Cart, CartItem  # noqa: F401
