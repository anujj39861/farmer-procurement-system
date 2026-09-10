from sqlalchemy.orm import Session
from datetime import datetime
from backend.models.all_models import Token, QueueEvent, Booking, Centre
from backend.ml.eta_model import eta_predictor

def generate_token_for_farmer(db: Session, centre_id: int, farmer_id: int, booking_id: int = None) -> Token:
    # Count today's tokens for center
    today_count = db.query(Token).filter(Token.centre_id == centre_id).count()
    token_num = today_count + 1
    today_str = datetime.utcnow().strftime("%Y%m%d")
    token_code = f"T-{today_str}-{token_num:03d}"
    
    # Calculate initial position in queue
    waiting_count = db.query(Token).filter(
        Token.centre_id == centre_id,
        Token.status == "waiting"
    ).count()

    centre = db.query(Centre).filter(Centre.id == centre_id).first()
    active_staff = centre.active_counters if centre else 4
    
    eta_res = eta_predictor.predict(queue_length=waiting_count + 1, active_staff=active_staff)

    token = Token(
        booking_id=booking_id,
        centre_id=centre_id,
        farmer_id=farmer_id,
        token_number=token_num,
        token_code=token_code,
        status="waiting",
        position=waiting_count + 1,
        estimated_wait_min=eta_res["ml_predicted_eta_min"],
        delay_risk=eta_res["delay_risk"]
    )
    db.add(token)
    db.commit()
    db.refresh(token)

    # Record event
    event = QueueEvent(
        token_id=token.id,
        stage="arrived",
        actor_id=farmer_id,
        notes="Smart Token Generated"
    )
    db.add(event)

    if booking_id:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if booking:
            booking.status = "checked_in"
    db.commit()

    return token

def update_queue_positions(db: Session, centre_id: int):
    waiting_tokens = db.query(Token).filter(
        Token.centre_id == centre_id,
        Token.status == "waiting"
    ).order_by(Token.id.asc()).all()

    centre = db.query(Centre).filter(Centre.id == centre_id).first()
    active_staff = centre.active_counters if centre else 4

    for idx, token in enumerate(waiting_tokens):
        token.position = idx + 1
        eta_res = eta_predictor.predict(queue_length=token.position, active_staff=active_staff)
        token.estimated_wait_min = eta_res["ml_predicted_eta_min"]
        token.delay_risk = eta_res["delay_risk"]
    db.commit()
