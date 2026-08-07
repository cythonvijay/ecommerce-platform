from fastapi import APIRouter, Depends, Query

from app.modules.auth.dependencies import require_admin
from app.modules.users.dependencies import get_user_admin_service
from app.modules.users.schemas import PaginatedUsers, UserStatusUpdate, UserAdminOut
from app.modules.users.service import UserAdminService

router = APIRouter(prefix="/users", tags=["Users (Admin)"], dependencies=[Depends(require_admin)])


@router.get("", response_model=PaginatedUsers)
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: UserAdminService = Depends(get_user_admin_service),
):
    result = service.list_all(page, page_size)
    result["items"] = [
        UserAdminOut(
            id=u.id, full_name=u.full_name, email=u.email, phone=u.phone,
            is_active=u.is_active, role=u.role.name, created_at=u.created_at,
        )
        for u in result["items"]
    ]
    return result


@router.put("/{user_id}/status", response_model=UserAdminOut)
def update_user_status(user_id: int, payload: UserStatusUpdate, service: UserAdminService = Depends(get_user_admin_service)):
    u = service.set_active(user_id, payload.is_active)
    return UserAdminOut(
        id=u.id, full_name=u.full_name, email=u.email, phone=u.phone,
        is_active=u.is_active, role=u.role.name, created_at=u.created_at,
    )
