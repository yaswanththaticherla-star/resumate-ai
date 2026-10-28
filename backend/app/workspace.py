from sqlalchemy.orm import Session
from app import models

def get_workspace_user(db: Session) -> models.User:
    """
    Returns the single-user workspace identity for local operation without authentication.
    Resolves alex.morgan@resumate.ai, user ID 1, or the first available user.
    If the database is empty, seeds the default user profile so foreign keys never fail.
    """
    user = db.query(models.User).filter(models.User.email == "alex.morgan@resumate.ai").first()
    if not user:
        user = db.query(models.User).filter(models.User.id == 1).first()
    if not user:
        user = db.query(models.User).first()
    if not user:
        user = models.User(
            email="alex.morgan@resumate.ai",
            full_name="Alex Morgan",
            headline="Senior Full-Stack Software Engineer",
            hashed_password="local_workspace_user",
            theme_preference="system",
            default_template="ats_classic"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

