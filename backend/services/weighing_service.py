from sqlalchemy.orm import Session
from datetime import datetime
from backend.models.all_models import WeighingRecord, Token, AuditLog, QueueEvent
from backend.ml.anomaly_model import anomaly_detector

def record_weight(db: Session, token_id: int, operator_id: int, scale_id: str, gross_kg: float, tare_kg: float) -> WeighingRecord:
    net_kg = max(0.0, gross_kg - tare_kg)
    
    # Create or update weighing record
    rec = db.query(WeighingRecord).filter(WeighingRecord.token_id == token_id).first()
    if not rec:
        rec = WeighingRecord(
            token_id=token_id,
            operator_id=operator_id,
            scale_id=scale_id,
            gross_weight_kg=gross_kg,
            tare_weight_kg=tare_kg,
            net_weight_kg=net_kg,
            is_locked=True
        )
        db.add(rec)
    else:
        rec.operator_id = operator_id
        rec.scale_id = scale_id
        rec.gross_weight_kg = gross_kg
        rec.tare_weight_kg = tare_kg
        rec.net_weight_kg = net_kg
        rec.is_locked = True

    token = db.query(Token).filter(Token.id == token_id).first()
    if token:
        token.status = "in_procurement"

    # Queue event
    evt = QueueEvent(token_id=token_id, stage="weighing_end", actor_id=operator_id, notes=f"Net weight locked: {net_kg} kg")
    db.add(evt)

    # Audit log
    audit = AuditLog(
        actor_id=operator_id,
        actor_role="operator",
        entity_type="weighing",
        entity_id=str(token_id),
        action="CREATE_WEIGHT",
        new_value=f"Gross:{gross_kg}kg, Net:{net_kg}kg",
        reason="Initial scale reading entry locked"
    )
    db.add(audit)
    db.commit()
    db.refresh(rec)
    return rec

def request_weight_correction(db: Session, token_id: int, operator_id: int, requested_net_kg: float, reason: str, evidence_url: str = None) -> WeighingRecord:
    rec = db.query(WeighingRecord).filter(WeighingRecord.token_id == token_id).first()
    if not rec:
        raise ValueError("Weighing record not found")

    old_net = rec.net_weight_kg
    rec.correction_requested = True
    rec.requested_net_weight_kg = requested_net_kg
    rec.correction_reason = reason
    rec.correction_evidence_url = evidence_url
    rec.correction_status = "pending"

    # Audit log
    audit = AuditLog(
        actor_id=operator_id,
        actor_role="operator",
        entity_type="weighing",
        entity_id=str(token_id),
        action="CORRECTION_REQUEST",
        old_value=f"{old_net} kg",
        new_value=f"{requested_net_kg} kg",
        reason=reason
    )
    db.add(audit)
    db.commit()
    db.refresh(rec)
    return rec

def supervisor_approve_correction(db: Session, token_id: int, supervisor_id: int, approve: bool, notes: str = None) -> WeighingRecord:
    rec = db.query(WeighingRecord).filter(WeighingRecord.token_id == token_id).first()
    if not rec:
        raise ValueError("Weighing record not found")

    old_net = rec.net_weight_kg
    if approve:
        rec.correction_status = "approved"
        new_net = rec.requested_net_weight_kg
        rec.net_weight_kg = new_net
        rec.gross_weight_kg = new_net + rec.tare_weight_kg
        action_name = "CORRECTION_APPROVED"
    else:
        rec.correction_status = "rejected"
        new_net = old_net
        action_name = "CORRECTION_REJECTED"

    rec.supervisor_id = supervisor_id
    rec.supervisor_notes = notes

    # Audit log retention of old, new, actor, supervisor, reason
    audit = AuditLog(
        actor_id=supervisor_id,
        actor_role="supervisor",
        entity_type="weighing",
        entity_id=str(token_id),
        action=action_name,
        old_value=f"{old_net} kg",
        new_value=f"{new_net} kg",
        reason=f"Correction Reason: {rec.correction_reason} | Supervisor Notes: {notes or 'N/A'}"
    )
    db.add(audit)
    db.commit()
    db.refresh(rec)
    return rec
