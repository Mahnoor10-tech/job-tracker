from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from ..database import PROJECT_ROOT
from ..dependencies import get_current_user
from ..models import User


router = APIRouter(prefix="/uploads", tags=["Uploads"])
UPLOAD_DIR = PROJECT_ROOT / "backend" / "uploads"
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


async def store_pdf(file: UploadFile, user: User, category: str) -> dict[str, str]:
    if Path(file.filename or "").suffix.lower() != ".pdf":
        raise HTTPException(status_code=415, detail="Only PDF files are accepted")
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="PDF must be 5 MB or smaller")
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="Uploaded file is not a valid PDF")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{user.id}-{category}-{uuid4().hex}.pdf"
    (UPLOAD_DIR / filename).write_bytes(content)
    return {"filename": filename, "message": "PDF uploaded successfully"}


@router.post("/resume", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    return await store_pdf(file, user, "resume")


@router.post("/cover-letter", status_code=status.HTTP_201_CREATED)
async def upload_cover_letter(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    return await store_pdf(file, user, "cover-letter")
