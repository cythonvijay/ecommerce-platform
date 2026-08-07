from typing import List
from fastapi import APIRouter, Depends, status

from app.modules.auth.dependencies import get_current_user
from app.modules.auth.models import User
from app.modules.reviews.dependencies import get_review_service
from app.modules.reviews.schemas import ReviewCreate, ReviewOut
from app.modules.reviews.service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/product/{product_id}", response_model=List[ReviewOut])
def list_reviews(product_id: int, service: ReviewService = Depends(get_review_service)):
    return service.list_for_product(product_id)


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(payload: ReviewCreate, current_user: User = Depends(get_current_user), service: ReviewService = Depends(get_review_service)):
    return service.create(current_user.id, payload)
