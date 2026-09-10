from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models.all_models import Lot, StorageRecord

router = APIRouter(prefix="/api/lots", tags=["Lots"])

@router.get("")
def list_lots(centre_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Lot)
    if centre_id:
        query = query.filter(Lot.centre_id == centre_id)
    return query.all()

@router.get("/{lot_number}")
def get_lot(lot_number: str, db: Session = Depends(get_db)):
    lot = db.query(Lot).filter(Lot.lot_number == lot_number).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return lot
