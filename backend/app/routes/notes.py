from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db
from ..dependencies import get_current_user


router = APIRouter(tags=["Notes"])


@router.post(
    "/applications/{application_id}/notes",
    response_model=schemas.NoteRead,
    status_code=201,
)
def create_note(
    application_id: int,
    payload: schemas.NoteCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if crud.get_owned_application(db, application_id, user.id) is None:
        raise HTTPException(status_code=404, detail="Application not found")
    note = models.Note(application_id=application_id, content=payload.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/applications/{application_id}/notes", response_model=list[schemas.NoteRead])
def list_notes(
    application_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if crud.get_owned_application(db, application_id, user.id) is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return list(
        db.scalars(
            select(models.Note)
            .where(models.Note.application_id == application_id)
            .order_by(models.Note.created_at.desc(), models.Note.id.desc())
        ).all()
    )


@router.put("/notes/{note_id}", response_model=schemas.NoteRead)
def edit_note(
    note_id: int,
    payload: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    note = db.scalar(
        select(models.Note)
        .join(models.Application)
        .where(models.Note.id == note_id, models.Application.user_id == user.id)
    )
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    note.content = payload.content
    db.commit()
    db.refresh(note)
    return note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    note = db.scalar(
        select(models.Note)
        .join(models.Application)
        .where(models.Note.id == note_id, models.Application.user_id == user.id)
    )
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()