from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models.all_models import ProcurementRecord
from backend.schemas.all_schemas import ProcurementCreate, ProcurementResponse
from backend.services.procurement_service import confirm_procurement

router = APIRouter(prefix="/api/procurement", tags=["Procurement"])

@router.post("", response_model=ProcurementResponse)
def create_procurement(p_in: ProcurementCreate, operator_id: int = 2, db: Session = Depends(get_db)):
    try:
        proc = confirm_procurement(db, token_id=p_in.token_id, operator_id=operator_id)
        return proc
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{procurement_id}", response_model=ProcurementResponse)
def get_procurement(procurement_id: int, db: Session = Depends(get_db)):
    proc = db.query(ProcurementRecord).filter(ProcurementRecord.id == procurement_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement record not found")
    return proc

@router.get("/token/{token_id}", response_model=ProcurementResponse)
def get_procurement_by_token(token_id: int, db: Session = Depends(get_db)):
    proc = db.query(ProcurementRecord).filter(ProcurementRecord.token_id == token_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement record not found for token")
    return proc
