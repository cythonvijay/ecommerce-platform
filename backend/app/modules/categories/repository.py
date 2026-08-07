from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.repository.base import BaseRepository
from app.modules.categories.models import Category


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: Session):
        super().__init__(db, Category)

    def get_by_slug(self, slug: str) -> Optional[Category]:
        stmt = select(Category).where(Category.slug == slug)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_name(self, name: str) -> Optional[Category]:
        stmt = select(Category).where(Category.name == name)
        return self.db.execute(stmt).scalar_one_or_none()

    def list_active(self) -> Sequence[Category]:
        stmt = select(Category).where(Category.is_active.is_(True)).order_by(Category.name)
        return self.db.execute(stmt).scalars().all()
