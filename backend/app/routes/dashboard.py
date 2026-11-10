from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import crud, models
from ..database import get_db
from ..dependencies import get_current_user


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def stats(
    db: Session = Depends(get_db), user: models.User = Depends(get_current_user)
):
    return crud.dashboard_stats(db, user.id)


@router.get("/status-breakdown")
def status_breakdown(
    db: Session = Depends(get_db), user: models.User = Depends(get_current_user)
):
    rows = db.execute(
        select(models.Application.status, func.count(models.Application.id))
        .where(models.Application.user_id == user.id)
        .group_by(models.Application.status)
        .order_by(models.Application.status)
    ).all()
    return [{"status": status, "count": count} for status, count in rows]


@router.get("/applications-per-week")
def applications_weekly(
    weeks: int = Query(default=12, ge=1, le=104),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return crud.applications_per_week(db, user.id, weeks)