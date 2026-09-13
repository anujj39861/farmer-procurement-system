from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models.all_models import Token, QueueEvent, User
from backend.schemas.all_schemas import TokenDetailResponse, QueueStatusPatch
from backend.services.queue_service import update_queue_positions

router = APIRouter(prefix="/api/queue", tags=["Queue"])

@router.get("/{centre_id}", response_model=List[TokenDetailResponse])
def get_centre_queue(centre_id: int, status: str = None, mandi: str = None, db: Session = Depends(get_db)):
    update_queue_positions(db, centre_id)
    query = db.query(Token).filter(Token.centre_id == centre_id)
    if mandi and mandi != "all":
        query = query.filter(Token.mandi_name == mandi)
    if status:
        query = query.filter(Token.status == status)
    else:
        query = query.filter(Token.status.in_(["waiting", "in_quality", "in_weighing", "in_procurement"]))
    
    tokens = query.order_by(Token.position.asc()).all()
    res_list = []
    for t in tokens:
        farmer = db.query(User).filter(User.id == t.farmer_id).first()
        res_dict = {
            "id": t.id,
            "token_number": t.token_number,
            "token_code": t.token_code,
            "centre_id": t.centre_id,
            "farmer_id": t.farmer_id,
            "mandi_name": t.mandi_name,
            "status": t.status,
            "position": t.position,
            "estimated_wait_min": t.estimated_wait_min,
            "delay_risk": t.delay_risk,
            "created_at": t.created_at,
            "farmer_name": farmer.name if farmer else None,
            "farmer_phone": farmer.phone if farmer else None
        }
        res_list.append(TokenDetailResponse(**res_dict))
    return res_list

@router.patch("/{token_id}")
def update_token_queue_status(token_id: int, patch: QueueStatusPatch, operator_id: int = 2, db: Session = Depends(get_db)):
    token = db.query(Token).filter(Token.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")

    token.status = patch.status
    if patch.status == "in_quality":
        token.position = 0
    
    event = QueueEvent(
        token_id=token_id,
        stage=patch.status,
        actor_id=operator_id,
        notes=patch.notes or f"Status updated to {patch.status}"
    )
    db.add(event)
    db.commit()
    
    update_queue_positions(db, token.centre_id)
    return {"message": "Queue status updated successfully", "token_id": token_id, "new_status": token.status}
