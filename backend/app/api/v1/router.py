"""Aggregates every module router under /api/v1."""
from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.categories.router import router as categories_router
from app.modules.products.router import router as products_router
from app.modules.inventory.router import router as inventory_router
from app.modules.addresses.router import router as addresses_router
from app.modules.cart.router import router as cart_router
from app.modules.wishlist.router import router as wishlist_router
from app.modules.orders.router import router as orders_router
from app.modules.reviews.router import router as reviews_router
from app.modules.users.router import router as users_router
from app.modules.admin.router import router as admin_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(categories_router)
api_router.include_router(products_router)
api_router.include_router(inventory_router)
api_router.include_router(addresses_router)
api_router.include_router(cart_router)
api_router.include_router(wishlist_router)
api_router.include_router(orders_router)
api_router.include_router(reviews_router)
api_router.include_router(users_router)
api_router.include_router(admin_router)
