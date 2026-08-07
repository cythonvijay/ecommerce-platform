"""
Seed the database with demo data:
- roles (admin, customer)
- 1 admin user, 1 customer user
- 5 categories
- 20 products (with images + inventory)

Usage:
    python scripts/seed_db.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db import all_models  # noqa: F401
from app.core.constants import RoleName
from app.core.security import hash_password
from app.common.utils.security_utils import slugify
from app.modules.auth.models import Role, User
from app.modules.categories.models import Category
from app.modules.products.models import Product, ProductImage
from app.modules.inventory.models import Inventory
from app.modules.cart.models import Cart

CATEGORIES = [
    ("Electronics", "Phones, laptops, gadgets and accessories"),
    ("Fashion", "Apparel, footwear and accessories"),
    ("Home & Kitchen", "Furniture, decor and kitchen essentials"),
    ("Books", "Fiction, non-fiction and academic titles"),
    ("Sports & Fitness", "Equipment, apparel and gear for an active life"),
]

PRODUCTS = [
    # (name, category_index, price, brand, description)
    ("Wireless Bluetooth Headphones", 0, 2499.00, "SoundWave", "Over-ear wireless headphones with active noise cancellation and 30-hour battery life."),
    ("Smartphone 128GB", 0, 18999.00, "Nexora", "6.5-inch AMOLED display, triple camera system, 128GB storage."),
    ("Laptop Backpack", 0, 1299.00, "TravelPro", "Water-resistant backpack with padded laptop compartment, fits up to 15.6 inch laptops."),
    ("Smartwatch Series 5", 0, 4999.00, "Nexora", "Fitness tracking smartwatch with heart-rate monitor and 7-day battery life."),
    ("Portable Bluetooth Speaker", 0, 1899.00, "SoundWave", "Compact waterproof speaker with 12-hour playtime."),

    ("Men's Cotton T-Shirt", 1, 499.00, "UrbanFit", "Breathable 100% cotton crew-neck t-shirt, available in multiple colors."),
    ("Women's Denim Jacket", 1, 1799.00, "UrbanFit", "Classic fit denim jacket with button closure."),
    ("Running Shoes", 1, 2299.00, "StrideMax", "Lightweight running shoes with breathable mesh upper and cushioned sole."),
    ("Leather Wallet", 1, 899.00, "Craftline", "Genuine leather bifold wallet with card slots and coin pocket."),
    ("Sunglasses UV400", 1, 699.00, "Craftline", "Polarized UV400 protection sunglasses with lightweight frame."),

    ("Non-Stick Frying Pan", 2, 999.00, "HomeChef", "28cm non-stick frying pan, induction compatible."),
    ("Ceramic Dinner Set (16 pcs)", 2, 2499.00, "HomeChef", "16-piece ceramic dinnerware set for 4."),
    ("Memory Foam Pillow", 2, 799.00, "Restwell", "Contoured memory foam pillow for neck support."),
    ("LED Desk Lamp", 2, 1099.00, "BrightHome", "Adjustable LED desk lamp with 3 brightness modes and USB charging port."),
    ("Cotton Bedsheet Set", 2, 1499.00, "Restwell", "Queen-size 100% cotton bedsheet set with 2 pillow covers."),

    ("The Silent Ocean (Novel)", 3, 349.00, "Penview Press", "A gripping literary fiction novel about family and the sea."),
    ("Modern Web Development Guide", 3, 899.00, "TechBooks", "A practical, project-based guide to building modern web applications."),
    ("Atlas of the World", 3, 1299.00, "GlobeMedia", "Comprehensive world atlas with political and physical maps."),

    ("Yoga Mat", 4, 799.00, "FlexFit", "6mm thick non-slip yoga mat with carry strap."),
    ("Adjustable Dumbbell Set", 4, 3499.00, "FlexFit", "Pair of adjustable dumbbells, 2kg-20kg per hand."),
]

IMAGE_BASE = "https://picsum.photos/seed"


def run():
    db = SessionLocal()
    try:
        # Roles
        roles = {}
        for role_name in (RoleName.ADMIN.value, RoleName.CUSTOMER.value):
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name)
                db.add(role)
                db.flush()
            roles[role_name] = role
        db.commit()

        # Users
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin = User(
                full_name="Admin User",
                email="admin@example.com",
                hashed_password=hash_password("Admin@123"),
                is_active=True,
                role_id=roles[RoleName.ADMIN.value].id,
            )
            db.add(admin)
            db.flush()
            db.add(Cart(user_id=admin.id))

        customer = db.query(User).filter(User.email == "customer@example.com").first()
        if not customer:
            customer = User(
                full_name="Demo Customer",
                email="customer@example.com",
                hashed_password=hash_password("Customer@123"),
                is_active=True,
                role_id=roles[RoleName.CUSTOMER.value].id,
            )
            db.add(customer)
            db.flush()
            db.add(Cart(user_id=customer.id))
        db.commit()

        # Categories
        category_objs = []
        for name, description in CATEGORIES:
            cat = db.query(Category).filter(Category.name == name).first()
            if not cat:
                cat = Category(name=name, slug=slugify(name), description=description)
                db.add(cat)
                db.flush()
            category_objs.append(cat)
        db.commit()

        # Products
        created = 0
        for name, cat_idx, price, brand, description in PRODUCTS:
            slug = slugify(name)
            existing = db.query(Product).filter(Product.slug == slug).first()
            if existing:
                continue
            product = Product(
                name=name,
                slug=slug,
                description=description,
                price=price,
                compare_at_price=round(price * 1.15, 2),
                category_id=category_objs[cat_idx].id,
                brand=brand,
                is_active=True,
            )
            db.add(product)
            db.flush()

            db.add(ProductImage(
                product_id=product.id,
                url=f"{IMAGE_BASE}/{slug}/600/600",
                alt_text=name,
                is_primary=True,
                sort_order=0,
            ))
            db.add(Inventory(product_id=product.id, quantity=50, low_stock_threshold=5))
            created += 1

        db.commit()
        print(f"Seed complete. Categories: {len(category_objs)}, Products created: {created}, "
              f"Admin: admin@example.com / Admin@123, Customer: customer@example.com / Customer@123")
    finally:
        db.close()


if __name__ == "__main__":
    run()
