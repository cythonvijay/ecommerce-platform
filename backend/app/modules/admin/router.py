from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import require_admin
from app.modules.admin.schemas import DashboardStats
from app.modules.admin.service import AdminDashboardService

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"], dependencies=[Depends(require_admin)])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(db: Session = Depends(get_db)):
    return AdminDashboardService(db).get_stats()
