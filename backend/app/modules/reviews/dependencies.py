from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.reviews.service import ReviewService


def get_review_service(db: Session = Depends(get_db)) -> ReviewService:
    return ReviewService(db)
