"""
Create (or promote) an admin user interactively.

Usage:
    python scripts/create_admin.py
"""
import sys
import os
import getpass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db import all_models  # noqa: F401
from app.core.constants import RoleName
from app.core.security import hash_password
from app.modules.auth.models import Role, User
from app.modules.cart.models import Cart


def run():
    db = SessionLocal()
    try:
        email = input("Admin email: ").strip()
        full_name = input("Full name: ").strip() or "Admin User"
        password = getpass.getpass("Password: ")

        admin_role = db.query(Role).filter(Role.name == RoleName.ADMIN.value).first()
        if not admin_role:
            admin_role = Role(name=RoleName.ADMIN.value)
            db.add(admin_role)
            db.flush()

        user = db.query(User).filter(User.email == email).first()
        if user:
            user.role_id = admin_role.id
            user.hashed_password = hash_password(password)
            db.commit()
            print(f"Existing user '{email}' promoted to admin and password updated.")
            return

        user = User(
            full_name=full_name,
            email=email,
            hashed_password=hash_password(password),
            is_active=True,
            role_id=admin_role.id,
        )
        db.add(user)
        db.flush()
        db.add(Cart(user_id=user.id))
        db.commit()
        print(f"Admin user '{email}' created.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
