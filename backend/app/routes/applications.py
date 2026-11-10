from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db
from ..dependencies import get_current_user


router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=schemas.ApplicationRead, status_code=201)
def create_application(
    payload: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return crud.create_application(db, payload, user.id)


@router.get("", response_model=list[schemas.ApplicationRead])
def list_applications(
    status_filter: schemas.ApplicationStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, max_length=200),
    sort_by: str = Query(default="date_applied", pattern="^(date_applied|company|position|status)$"),
    descending: bool = True,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    statement = select(models.Application).where(models.Application.user_id == user.id)
    if status_filter:
        statement = statement.where(models.Application.status == status_filter)
    if search:
        term = f"%{search.strip()}%"
        statement = statement.where(
            models.Application.company.ilike(term)
            | models.Application.position.ilike(term)
        )
    sort_column = getattr(models.Application, sort_by)
    statement = statement.order_by(
        sort_column.desc() if descending else sort_column.asc()
    )
    return list(db.scalars(statement.offset(offset).limit(limit)).all())


@router.get("/{application_id}", response_model=schemas.ApplicationRead)
def read_application(
    application_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    application = crud.get_owned_application(db, application_id, user.id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.put("/{application_id}", response_model=schemas.ApplicationRead)
def edit_application(
    application_id: int,
    payload: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    application = crud.get_owned_application(db, application_id, user.id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    changes = payload.model_dump(exclude_unset=True)
    salary_min = changes.get("salary_min", application.salary_min)
    salary_max = changes.get("salary_max", application.salary_max)
    if (
        salary_min is not None
        and salary_max is not None
        and salary_max < salary_min
    ):
        raise HTTPException(
            status_code=422,
            detail="salary_max must be greater than or equal to salary_min",
        )
    return crud.update_application(
        db, application, changes
    )


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    application = crud.get_owned_application(db, application_id, user.id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(application)
    db.commit()


@router.get("/{application_id}/history", response_model=list[schemas.StatusHistoryRead])
def application_history(
    application_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    application = crud.get_owned_application(db, application_id, user.id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return list(
        db.scalars(
            select(models.StatusHistory)
            .where(models.StatusHistory.application_id == application_id)
            .order_by(models.StatusHistory.changed_at, models.StatusHistory.id)
        ).all()
    )