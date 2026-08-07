from typing import Sequence
from sqlalchemy.orm import Session

from app.common.utils.security_utils import slugify
from app.modules.categories.models import Category
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import CategoryCreate, CategoryUpdate
from app.modules.categories.exceptions import CategoryNotFoundError, CategoryNameExistsError


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CategoryRepository(db)

    def list_categories(self) -> Sequence[Category]:
        return self.repo.list_active()

    def get(self, category_id: int) -> Category:
        category = self.repo.get(category_id)
        if not category:
            raise CategoryNotFoundError()
        return category

    def get_by_slug(self, slug: str) -> Category:
        category = self.repo.get_by_slug(slug)
        if not category:
            raise CategoryNotFoundError()
        return category

    def create(self, payload: CategoryCreate) -> Category:
        if self.repo.get_by_name(payload.name):
            raise CategoryNameExistsError()
        category = Category(
            name=payload.name,
            slug=slugify(payload.name),
            description=payload.description,
            parent_id=payload.parent_id,
        )
        return self.repo.create(category)

    def update(self, category_id: int, payload: CategoryUpdate) -> Category:
        category = self.get(category_id)
        data = payload.model_dump(exclude_unset=True)
        if "name" in data and data["name"]:
            data["slug"] = slugify(data["name"])
        return self.repo.update(category, data)

    def delete(self, category_id: int) -> None:
        category = self.get(category_id)
        self.repo.delete(category)
