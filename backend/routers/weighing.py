from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.all_models import WeighingRecord
from backend.schemas.all_schemas import (
    WeighingCreate, WeightCorrectionRequest, WeightCorrectionDecision, WeighingResponse
)
from backend.services.weighing_service import (
    record_weight, request_weight_correction, supervisor_approve_correction
)

router = APIRouter(prefix="/api/weighing", tags=["Weighing"])

@router.post("", response_model=WeighingResponse)
def submit_weight(w_in: WeighingCreate, operator_id: int = 2, db: Session = Depends(get_db)):
    rec = record_weight(
        db=db,
        token_id=w_in.token_id,
        operator_id=operator_id,
        scale_id=w_in.scale_id,
        gross_kg=w_in.gross_weight_kg,
        tare_kg=w_in.tare_weight_kg
    )
    return rec

@router.get("/{token_id}", response_model=WeighingResponse)
def get_weight_by_token(token_id: int, db: Session = Depends(get_db)):
    rec = db.query(WeighingRecord).filter(WeighingRecord.token_id == token_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Weighing record not found")
    return rec

@router.post("/{token_id}/correct", response_model=WeighingResponse)
def request_correction(token_id: int, corr_in: WeightCorrectionRequest, operator_id: int = 2, db: Session = Depends(get_db)):
    try:
        rec = request_weight_correction(
            db=db,
            token_id=token_id,
            operator_id=operator_id,
            requested_net_kg=corr_in.requested_net_weight_kg,
            reason=corr_in.reason,
            evidence_url=corr_in.evidence_url
        )
        return rec
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{token_id}/verify", response_model=WeighingResponse)
def supervisor_verify_correction(token_id: int, dec_in: WeightCorrectionDecision, supervisor_id: int = 4, db: Session = Depends(get_db)):
    try:
        rec = supervisor_approve_correction(
            db=db,
            token_id=token_id,
            supervisor_id=supervisor_id,
            approve=dec_in.approve,
            notes=dec_in.supervisor_notes
        )
        return rec
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/pending/corrections")
def list_pending_corrections(db: Session = Depends(get_db)):
    recs = db.query(WeighingRecord).filter(WeighingRecord.correction_status == "pending").all()
    return recs
