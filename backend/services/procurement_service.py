from sqlalchemy.orm import Session
from datetime import datetime
from backend.models.all_models import (
    ProcurementRecord, Token, QualityRecord, WeighingRecord, Lot, Booking, AuditLog, QueueEvent
)
from backend.utils.qr_generator import generate_qr_data_url

MSP_RATES = {
    "Wheat": 22.75,
    "Paddy": 21.83,
    "Maize": 20.90,
    "Mustard": 56.50,
    "Pulse": 66.00
}

def confirm_procurement(db: Session, token_id: int, operator_id: int) -> ProcurementRecord:
    token = db.query(Token).filter(Token.id == token_id).first()
    if not token:
        raise ValueError("Token not found")

    quality = db.query(QualityRecord).filter(QualityRecord.token_id == token_id).first()
    if not quality or quality.decision != "Pass":
        raise ValueError("Quality inspection not completed or rejected")

    weighing = db.query(WeighingRecord).filter(WeighingRecord.token_id == token_id).first()
    if not weighing or not weighing.is_locked:
        raise ValueError("Weighing record missing or not locked")

    booking = db.query(Booking).filter(Booking.id == token.booking_id).first()
    crop_type = booking.expected_crop if booking else "Wheat"
    rate = MSP_RATES.get(crop_type, 22.75)
    total_amt = round(weighing.net_weight_kg * rate, 2)

    today_str = datetime.utcnow().strftime("%Y%m%d")
    lot_num = f"LOT-{token.centre_id}-{today_str}-{token.token_number:03d}"

    qr_payload = {
        "lot_number": lot_num,
        "token_code": token.token_code,
        "centre_id": token.centre_id,
        "farmer_id": token.farmer_id,
        "crop": crop_type,
        "grade": quality.grade,
        "verified_weight_kg": weighing.net_weight_kg,
        "total_amount": total_amt,
        "procured_at": datetime.utcnow().isoformat()
    }
    qr_data_url = generate_qr_data_url(qr_payload)

    proc = ProcurementRecord(
        token_id=token_id,
        centre_id=token.centre_id,
        farmer_id=token.farmer_id,
        crop_type=crop_type,
        verified_weight_kg=weighing.net_weight_kg,
        grade=quality.grade,
        rate_per_kg=rate,
        total_amount=total_amt,
        lot_number=lot_num,
        qr_code_url=qr_data_url,
        payment_status="completed"
    )
    db.add(proc)

    # Update Lot entity or create lot
    lot = db.query(Lot).filter(Lot.lot_number == lot_num).first()
    if not lot:
        lot = Lot(
            lot_number=lot_num,
            centre_id=token.centre_id,
            crop_type=crop_type,
            total_weight_kg=weighing.net_weight_kg,
            bags_count=int(weighing.net_weight_kg / 50.0) + 1,
            warehouse_bay="Bay-1A",
            qr_code_data=qr_data_url,
            status="in_storage"
        )
        db.add(lot)
    else:
        lot.total_weight_kg += weighing.net_weight_kg
        lot.bags_count += int(weighing.net_weight_kg / 50.0) + 1

    token.status = "completed"
    token.completed_at = datetime.utcnow()

    # Queue event
    evt = QueueEvent(
        token_id=token_id,
        stage="procurement_done",
        actor_id=operator_id,
        notes=f"Procurement confirmed. Lot {lot_num} created."
    )
    db.add(evt)

    # Audit log
    audit = AuditLog(
        actor_id=operator_id,
        actor_role="operator",
        entity_type="procurement",
        entity_id=str(token_id),
        action="CONFIRM_PROCUREMENT",
        new_value=f"Lot:{lot_num}, Wt:{weighing.net_weight_kg}kg, Amt:Rs.{total_amt}",
        reason="Final procurement record locked & QR generated"
    )
    db.add(audit)

    db.commit()
    db.refresh(proc)
    return proc
