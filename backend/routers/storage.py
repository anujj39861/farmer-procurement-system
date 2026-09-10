from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.all_models import StorageRecord

router = APIRouter(prefix="/api/storage", tags=["Storage"])

@router.get("")
def list_storage_records(db: Session = Depends(get_db)):
    return db.query(StorageRecord).all()
