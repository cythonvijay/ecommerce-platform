from typing import Sequence
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.modules.reviews.models import Review
from app.modules.reviews.repository import ReviewRepository
from app.modules.reviews.schemas import ReviewCreate
from app.modules.reviews.exceptions import AlreadyReviewedError
from app.modules.products.repository import ProductRepository
from app.modules.products.exceptions import ProductNotFoundError


class ReviewService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReviewRepository(db)
        self.products = ProductRepository(db)

    def list_for_product(self, product_id: int) -> Sequence[Review]:
        return self.repo.list_for_product(product_id)

    def create(self, user_id: int, payload: ReviewCreate) -> Review:
        product = self.products.get(payload.product_id)
        if not product:
            raise ProductNotFoundError()
        if self.repo.get_by_user_product(user_id, payload.product_id):
            raise AlreadyReviewedError()

        review = Review(user_id=user_id, product_id=payload.product_id, rating=payload.rating, title=payload.title, comment=payload.comment)
        self.db.add(review)
        self.db.commit()

        # recompute aggregate rating
        stmt = select(func.avg(Review.rating), func.count(Review.id)).where(Review.product_id == payload.product_id)
        avg_rating, count = self.db.execute(stmt).one()
        product.rating_avg = round(float(avg_rating or 0), 2)
        product.rating_count = count
        self.db.commit()
        self.db.refresh(review)
        return review
