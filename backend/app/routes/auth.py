from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.workspace import get_workspace_user

router = APIRouter(prefix="/api/auth", tags=["workspace"])

@router.get("/me", response_model=schemas.UserOut)
def get_current_profile(db: Session = Depends(get_db)):
    """Return the active workspace user profile."""
    return get_workspace_user(db)

@router.put("/profile", response_model=schemas.UserOut)
def update_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db)
):
    """Update active workspace user profile."""
    current_user = get_workspace_user(db)
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name.strip()
    if user_update.headline is not None:
        current_user.headline = user_update.headline.strip()
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url.strip() if user_update.avatar_url else None
    if user_update.theme_preference is not None:
        current_user.theme_preference = user_update.theme_preference
    if user_update.default_template is not None:
        current_user.default_template = user_update.default_template

    db.commit()
    db.refresh(current_user)
    return current_user


