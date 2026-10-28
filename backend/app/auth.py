from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from app import models
from app.workspace import get_workspace_user

def get_current_user(db: Session = Depends(get_db)) -> models.User:
    """
    Unauthenticated Workspace Identity: returns the workspace owner.
    Does not require tokens or login.
    """
    return get_workspace_user(db)


