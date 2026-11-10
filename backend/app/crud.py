from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import models, schemas


def get_owned_application(
    db: Session, application_id: int, user_id: int
) -> models.Application | None:
    return db.scalar(
        select(models.Application).where(
            models.Application.id == application_id,
            models.Application.user_id == user_id,
        )
    )


def create_application(
    db: Session, payload: schemas.ApplicationCreate, user_id: int
) -> models.Application:
    application = models.Application(**payload.model_dump(), user_id=user_id)
    db.add(application)
    db.flush()
    db.add(
        models.StatusHistory(
            application_id=application.id,
            old_status=None,
            new_status=application.status,
        )
    )
    db.commit()
    db.refresh(application)
    return application


def update_application(
    db: Session, application: models.Application, changes: dict
) -> models.Application:
    old_status = application.status
    for key, value in changes.items():
        setattr(application, key, value)
    if application.status != old_status:
        db.add(
            models.StatusHistory(
                application_id=application.id,
                old_status=old_status,
                new_status=application.status,
            )
        )
    db.commit()
    db.refresh(application)
    return application


def dashboard_stats(db: Session, user_id: int) -> dict[str, int]:
    total = db.scalar(
        select(func.count(models.Application.id)).where(
            models.Application.user_id == user_id
        )
    ) or 0
    counts = dict(
        db.execute(
            select(models.Application.status, func.count(models.Application.id))
            .where(models.Application.user_id == user_id)
            .group_by(models.Application.status)
        ).all()
    )
    return {
        "total_applications": total,
        "interviews": counts.get("Interview", 0),
        "offers": counts.get("Offer", 0),
        "rejected": counts.get("Rejected", 0),
    }


def applications_per_week(db: Session, user_id: int, weeks: int = 12) -> list[dict]:
    today = date.today()
    start = today - timedelta(days=7 * weeks)
    rows = db.execute(
        select(models.Application.date_applied, func.count(models.Application.id))
        .where(
            models.Application.user_id == user_id,
            models.Application.date_applied >= start,
        )
        .group_by(models.Application.date_applied)
        .order_by(models.Application.date_applied)
    ).all()
    grouped: dict[date, int] = {}
    for applied_date, count in rows:
        week_start = applied_date - timedelta(days=applied_date.weekday())
        grouped[week_start] = grouped.get(week_start, 0) + count
    return [{"week_start": key, "count": value} for key, value in sorted(grouped.items())]