from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models.all_models import Centre, Token
from backend.schemas.all_schemas import CentreCreate, CentreResponse

router = APIRouter(prefix="/api/centres", tags=["Centres"])

@router.get("", response_model=List[CentreResponse])
def list_centres(db: Session = Depends(get_db)):
    return db.query(Centre).filter(Centre.is_active == True).all()

@router.get("/{centre_id}", response_model=CentreResponse)
def get_centre(centre_id: int, db: Session = Depends(get_db)):
    centre = db.query(Centre).filter(Centre.id == centre_id).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Centre not found")
    return centre

@router.post("", response_model=CentreResponse)
def create_centre(centre_in: CentreCreate, db: Session = Depends(get_db)):
    centre = Centre(**centre_in.dict())
    db.add(centre)
    db.commit()
    db.refresh(centre)
    return centre
