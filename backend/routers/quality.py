from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.all_models import QualityRecord, Token, QueueEvent, AuditLog
from backend.schemas.all_schemas import QualityRecordCreate, QualityRecordResponse

router = APIRouter(prefix="/api/quality", tags=["Quality"])

@router.post("", response_model=QualityRecordResponse)
def submit_quality_inspection(q_in: QualityRecordCreate, inspector_id: int = 3, db: Session = Depends(get_db)):
    token = db.query(Token).filter(Token.id == q_in.token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")

    # Evaluate Grade & Decision
    if q_in.moisture_pct > 14.0 or q_in.foreign_matter_pct > 3.0:
        grade = "Rejected"
        decision = "Reject"
        token.status = "rejected"
    elif q_in.moisture_pct <= 12.0 and q_in.foreign_matter_pct <= 1.0:
        grade = "Grade A"
        decision = "Pass"
        token.status = "in_weighing"
    elif q_in.moisture_pct <= 13.5 and q_in.foreign_matter_pct <= 2.0:
        grade = "Grade B"
        decision = "Pass"
        token.status = "in_weighing"
    else:
        grade = "Grade C"
        decision = "Pass"
        token.status = "in_weighing"

    rec = db.query(QualityRecord).filter(QualityRecord.token_id == q_in.token_id).first()
    if not rec:
        rec = QualityRecord(
            token_id=q_in.token_id,
            inspector_id=inspector_id,
            moisture_pct=q_in.moisture_pct,
            foreign_matter_pct=q_in.foreign_matter_pct,
            damaged_grains_pct=q_in.damaged_grains_pct,
            grade=grade,
            decision=decision,
            evidence_notes=q_in.evidence_notes
        )
        db.add(rec)
    else:
        rec.inspector_id = inspector_id
        rec.moisture_pct = q_in.moisture_pct
        rec.foreign_matter_pct = q_in.foreign_matter_pct
        rec.damaged_grains_pct = q_in.damaged_grains_pct
        rec.grade = grade
        rec.decision = decision
        rec.evidence_notes = q_in.evidence_notes

    # Event & Audit
    evt = QueueEvent(
        token_id=q_in.token_id,
        stage="quality_end",
        actor_id=inspector_id,
        notes=f"Quality Grade: {grade}, Decision: {decision}"
    )
    db.add(evt)

    audit = AuditLog(
        actor_id=inspector_id,
        actor_role="quality",
        entity_type="quality",
        entity_id=str(q_in.token_id),
        action="QUALITY_INSPECT",
        new_value=f"Grade:{grade}, Moisture:{q_in.moisture_pct}%, ForeignMatter:{q_in.foreign_matter_pct}%",
        reason="Quality parameter testing completed"
    )
    db.add(audit)

    db.commit()
    db.refresh(rec)
    return rec

@router.get("/{token_id}", response_model=QualityRecordResponse)
def get_quality_by_token(token_id: int, db: Session = Depends(get_db)):
    rec = db.query(QualityRecord).filter(QualityRecord.token_id == token_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Quality record not found")
    return rec
