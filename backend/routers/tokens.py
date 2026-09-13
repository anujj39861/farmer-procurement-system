from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.all_models import Token, User, Centre
from backend.schemas.all_schemas import TokenCreate, TokenDetailResponse
from backend.services.queue_service import generate_token_for_farmer, update_queue_positions

router = APIRouter(prefix="/api/tokens", tags=["Tokens"])

@router.post("", response_model=TokenDetailResponse)
def create_token(tok_in: TokenCreate, db: Session = Depends(get_db)):
    farmer_id = tok_in.farmer_id or 1
    token = generate_token_for_farmer(db, tok_in.centre_id, farmer_id, tok_in.booking_id)
    
    farmer = db.query(User).filter(User.id == token.farmer_id).first()
    res_dict = {
        "id": token.id,
        "token_number": token.token_number,
        "token_code": token.token_code,
        "centre_id": token.centre_id,
        "farmer_id": token.farmer_id,
        "status": token.status,
        "position": token.position,
        "estimated_wait_min": token.estimated_wait_min,
        "delay_risk": token.delay_risk,
        "created_at": token.created_at,
        "farmer_name": farmer.name if farmer else None,
        "farmer_phone": farmer.phone if farmer else None
    }
    return TokenDetailResponse(**res_dict)

@router.get("/farmer/{farmer_id}", response_model=list[TokenDetailResponse])
def get_farmer_tokens(farmer_id: int, db: Session = Depends(get_db)):
    tokens = db.query(Token).filter(Token.farmer_id == farmer_id).order_by(Token.id.asc()).all()
    res_list = []
    for token in tokens:
        farmer = db.query(User).filter(User.id == token.farmer_id).first()
        res_dict = {
            "id": token.id,
            "token_number": token.token_number,
            "token_code": token.token_code,
            "centre_id": token.centre_id,
            "farmer_id": token.farmer_id,
            "status": token.status,
            "position": token.position,
            "estimated_wait_min": token.estimated_wait_min,
            "delay_risk": token.delay_risk,
            "created_at": token.created_at,
            "farmer_name": farmer.name if farmer else None,
            "farmer_phone": farmer.phone if farmer else None
        }
        res_list.append(TokenDetailResponse(**res_dict))
    return res_list

@router.get("/{token_id}", response_model=TokenDetailResponse)
def get_token(token_id: int, db: Session = Depends(get_db)):
    token = db.query(Token).filter(Token.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    farmer = db.query(User).filter(User.id == token.farmer_id).first()
    res_dict = {
        "id": token.id,
        "token_number": token.token_number,
        "token_code": token.token_code,
        "centre_id": token.centre_id,
        "farmer_id": token.farmer_id,
        "status": token.status,
        "position": token.position,
        "estimated_wait_min": token.estimated_wait_min,
        "delay_risk": token.delay_risk,
        "created_at": token.created_at,
        "farmer_name": farmer.name if farmer else None,
        "farmer_phone": farmer.phone if farmer else None
    }
    return TokenDetailResponse(**res_dict)
