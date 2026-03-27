import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


async def save_upload_file(file: UploadFile, folder: str = "misc") -> str:
    """Save an uploaded file and return its relative URL path."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: {ALLOWED_IMAGE_TYPES}",
        )

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size is {settings.MAX_FILE_SIZE_MB}MB",
        )

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"

    upload_dir = Path(settings.UPLOAD_DIR) / folder
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / filename
    with open(file_path, "wb") as f:
        f.write(content)

    return f"/{settings.UPLOAD_DIR}/{folder}/{filename}"
