from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from backend.database import get_db
from backend.models.all_models import Schedule, Booking, Centre
from backend.schemas.all_schemas import ScheduleCreate, BookingCreate, BookingResponse

router = APIRouter(prefix="/api/schedules", tags=["Schedules"])

@router.get("")
def get_schedules(centre_id: int = None, date: str = None, db: Session = Depends(get_db)):
    query = db.query(Schedule)
    if centre_id:
        query = query.filter(Schedule.centre_id == centre_id)
    if date:
        query = query.filter(Schedule.date == date)
    return query.all()

@router.post("")
def create_schedule(sched_in: ScheduleCreate, db: Session = Depends(get_db)):
    sched = Schedule(**sched_in.dict())
    db.add(sched)
    db.commit()
    db.refresh(sched)
    return sched

@router.post("/bookings", response_model=BookingResponse)
def book_slot(booking_in: BookingCreate, farmer_id: int = 1, db: Session = Depends(get_db)):
    sched = db.query(Schedule).filter(Schedule.id == booking_in.schedule_id).first()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
    if sched.booked_slots >= sched.total_slots:
        raise HTTPException(status_code=400, detail="Schedule fully booked")

    sched.booked_slots += 1
    booking = Booking(
        schedule_id=sched.id,
        centre_id=sched.centre_id,
        farmer_id=farmer_id,
        time_slot=booking_in.time_slot,
        expected_crop=booking_in.expected_crop,
        expected_qty_kg=booking_in.expected_qty_kg,
        status="booked"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking
