from sqlalchemy.orm import Session

from app.modules.cart.models import Cart, CartItem
from app.modules.cart.repository import CartRepository
from app.modules.cart.schemas import CartOut, CartItemOut, CartItemAdd
from app.modules.cart.exceptions import CartItemNotFoundError, InsufficientStockForCartError
from app.modules.products.repository import ProductRepository
from app.modules.products.exceptions import ProductNotFoundError
from app.modules.products.service import ProductService


class CartService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CartRepository(db)
        self.products = ProductRepository(db)

    def _get_or_create_cart(self, user_id: int) -> Cart:
        cart = self.repo.get_by_user(user_id)
        if not cart:
            cart = Cart(user_id=user_id)
            self.db.add(cart)
            self.db.commit()
            cart = self.repo.get_by_user(user_id)
        return cart

    def _to_out(self, cart: Cart) -> CartOut:
        product_service = ProductService(self.db)
        items_out = []
        subtotal = 0.0
        for item in cart.items:
            product_out = product_service._to_out(item.product)
            line_total = float(item.product.price) * item.quantity
            subtotal += line_total
            items_out.append(CartItemOut(id=item.id, product=product_out, quantity=item.quantity, line_total=line_total))
        return CartOut(items=items_out, subtotal=round(subtotal, 2), item_count=sum(i.quantity for i in cart.items))

    def get_cart(self, user_id: int) -> CartOut:
        cart = self._get_or_create_cart(user_id)
        return self._to_out(cart)

    def add_item(self, user_id: int, payload: CartItemAdd) -> CartOut:
        product = self.products.get(payload.product_id)
        if not product:
            raise ProductNotFoundError()
        if product.inventory and product.inventory.available < payload.quantity:
            raise InsufficientStockForCartError()

        cart = self._get_or_create_cart(user_id)
        existing = self.repo.get_item(cart.id, payload.product_id)
        if existing:
            existing.quantity += payload.quantity
        else:
            self.db.add(CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity))
        self.db.commit()

        cart = self.repo.get_by_user(user_id)
        return self._to_out(cart)

    def update_item(self, user_id: int, item_id: int, quantity: int) -> CartOut:
        cart = self._get_or_create_cart(user_id)
        item = next((i for i in cart.items if i.id == item_id), None)
        if not item:
            raise CartItemNotFoundError()
        if item.product.inventory and item.product.inventory.available + item.quantity < quantity:
            raise InsufficientStockForCartError()
        item.quantity = quantity
        self.db.commit()
        cart = self.repo.get_by_user(user_id)
        return self._to_out(cart)

    def remove_item(self, user_id: int, item_id: int) -> CartOut:
        cart = self._get_or_create_cart(user_id)
        item = next((i for i in cart.items if i.id == item_id), None)
        if not item:
            raise CartItemNotFoundError()
        self.db.delete(item)
        self.db.commit()
        cart = self.repo.get_by_user(user_id)
        return self._to_out(cart)

    def clear(self, user_id: int) -> None:
        cart = self._get_or_create_cart(user_id)
        for item in list(cart.items):
            self.db.delete(item)
        self.db.commit()
