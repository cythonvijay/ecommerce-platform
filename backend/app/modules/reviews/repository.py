from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.repository.base import BaseRepository
from app.modules.reviews.models import Review


class ReviewRepository(BaseRepository[Review]):
    def __init__(self, db: Session):
        super().__init__(db, Review)

    def list_for_product(self, product_id: int) -> Sequence[Review]:
        stmt = select(Review).where(Review.product_id == product_id).order_by(Review.created_at.desc())
        return self.db.execute(stmt).scalars().all()

    def get_by_user_product(self, user_id: int, product_id: int) -> Optional[Review]:
        stmt = select(Review).where(Review.user_id == user_id, Review.product_id == product_id)
        return self.db.execute(stmt).scalar_one_or_none()
