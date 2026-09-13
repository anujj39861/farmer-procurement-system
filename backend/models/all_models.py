from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # farmer, operator, quality, supervisor, admin
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    centre = relationship("Centre", back_populates="staff")
    bookings = relationship("Booking", back_populates="farmer")
    tokens = relationship("Token", back_populates="farmer")
    issues = relationship("Issue", foreign_keys="Issue.farmer_id", back_populates="farmer")


class Centre(Base):
    __tablename__ = "centres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    district = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    capacity_per_day = Column(Integer, default=100)
    active_counters = Column(Integer, default=4)
    avg_processing_time_min = Column(Float, default=5.0)
    open_time = Column(String(10), default="08:00")
    close_time = Column(String(10), default="17:00")
    is_active = Column(Boolean, default=True)

    staff = relationship("User", back_populates="centre")
    schedules = relationship("Schedule", back_populates="centre")
    bookings = relationship("Booking", back_populates="centre")
    tokens = relationship("Token", back_populates="centre")
    lots = relationship("Lot", back_populates="centre")


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=False)
    date = Column(String(20), nullable=False)  # YYYY-MM-DD
    total_slots = Column(Integer, default=50)
    booked_slots = Column(Integer, default=0)
    crop_type = Column(String(50), default="Wheat")
    max_qty_kg = Column(Float, default=1000.0)

    centre = relationship("Centre", back_populates="schedules")
    bookings = relationship("Booking", back_populates="schedule")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id"), nullable=False)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    time_slot = Column(String(20), nullable=False)  # e.g., 09:00-10:00
    expected_crop = Column(String(50), nullable=False)
    expected_qty_kg = Column(Float, nullable=False)
    status = Column(String(30), default="booked")  # booked, checked_in, cancelled, completed
    created_at = Column(DateTime, default=datetime.utcnow)

    schedule = relationship("Schedule", back_populates="bookings")
    centre = relationship("Centre", back_populates="bookings")
    farmer = relationship("User", back_populates="bookings")
    token = relationship("Token", back_populates="booking", uselist=False)


class Token(Base):
    __tablename__ = "tokens"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mandi_name = Column(String(100), nullable=True, default="Karnal Mandi")
    token_number = Column(Integer, nullable=False)
    token_code = Column(String(30), unique=True, index=True, nullable=False)  # e.g. T-20260908-042
    status = Column(String(30), default="waiting")  # waiting, in_quality, in_weighing, in_procurement, completed, rejected, cancelled
    position = Column(Integer, default=1)
    estimated_wait_min = Column(Float, default=30.0)
    delay_risk = Column(String(20), default="Low")  # Low, Medium, High
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    booking = relationship("Booking", back_populates="token")
    centre = relationship("Centre", back_populates="tokens")
    farmer = relationship("User", back_populates="tokens")
    events = relationship("QueueEvent", back_populates="token")
    quality_record = relationship("QualityRecord", back_populates="token", uselist=False)
    weighing_record = relationship("WeighingRecord", back_populates="token", uselist=False)
    procurement_record = relationship("ProcurementRecord", back_populates="token", uselist=False)


class QueueEvent(Base):
    __tablename__ = "queue_events"

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("tokens.id"), nullable=False)
    stage = Column(String(30), nullable=False)  # arrived, quality_start, quality_end, weighing_start, weighing_end, procurement_done
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    token = relationship("Token", back_populates="events")


class QualityRecord(Base):
    __tablename__ = "quality_records"

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("tokens.id"), nullable=False, unique=True)
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    moisture_pct = Column(Float, nullable=False)
    foreign_matter_pct = Column(Float, nullable=False)
    damaged_grains_pct = Column(Float, default=0.0)
    grade = Column(String(10), nullable=False)  # Grade A, Grade B, Grade C, Rejected
    decision = Column(String(20), nullable=False)  # Pass, Reject, Dispute
    evidence_notes = Column(Text, nullable=True)
    evidence_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    token = relationship("Token", back_populates="quality_record")


class WeighingRecord(Base):
    __tablename__ = "weighing_records"

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("tokens.id"), nullable=False, unique=True)
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    scale_id = Column(String(50), default="SCALE-01")
    gross_weight_kg = Column(Float, nullable=False)
    tare_weight_kg = Column(Float, default=0.0)
    net_weight_kg = Column(Float, nullable=False)
    weighing_slip_url = Column(String(255), nullable=True)
    is_locked = Column(Boolean, default=True)
    
    # Anti-Manipulation / Correction Request fields
    correction_requested = Column(Boolean, default=False)
    requested_net_weight_kg = Column(Float, nullable=True)
    correction_reason = Column(Text, nullable=True)
    correction_evidence_url = Column(String(255), nullable=True)
    correction_status = Column(String(20), default="none")  # none, pending, approved, rejected
    supervisor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    supervisor_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    token = relationship("Token", back_populates="weighing_record")


class ProcurementRecord(Base):
    __tablename__ = "procurement_records"

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("tokens.id"), nullable=False, unique=True)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_type = Column(String(50), nullable=False)
    verified_weight_kg = Column(Float, nullable=False)
    grade = Column(String(10), nullable=False)
    rate_per_kg = Column(Float, default=22.75)  # MSP rate e.g. 22.75 INR/kg
    total_amount = Column(Float, nullable=False)
    lot_number = Column(String(50), unique=True, nullable=False)
    qr_code_url = Column(Text, nullable=False)
    payment_status = Column(String(20), default="processing")  # processing, completed, on_hold
    created_at = Column(DateTime, default=datetime.utcnow)

    token = relationship("Token", back_populates="procurement_record")


class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    lot_number = Column(String(50), unique=True, index=True, nullable=False)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=False)
    crop_type = Column(String(50), nullable=False)
    total_weight_kg = Column(Float, default=0.0)
    bags_count = Column(Integer, default=0)
    warehouse_bay = Column(String(50), default="Bay-1A")
    status = Column(String(30), default="in_storage")  # in_storage, dispatch_ready, in_transit, delivered
    qr_code_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    centre = relationship("Centre", back_populates="lots")
    storage_records = relationship("StorageRecord", back_populates="lot")


class StorageRecord(Base):
    __tablename__ = "storage_records"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=False)
    warehouse_name = Column(String(100), default="Central Silo Depot")
    stack_number = Column(String(50), default="Stack-04")
    temperature_c = Column(Float, default=24.5)
    humidity_pct = Column(Float, default=55.0)
    inspected_at = Column(DateTime, default=datetime.utcnow)

    lot = relationship("Lot", back_populates="storage_records")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True)
    actor_name = Column(String(100), nullable=True)
    actor_role = Column(String(30), nullable=False)
    entity_type = Column(String(50), nullable=False)  # weighing, quality, token, issue, user
    entity_id = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)  # CREATE, UPDATE, CORRECTION_REQUEST, APPROVED, REJECTED, FLAG_ANOMALY
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_id = Column(Integer, ForeignKey("tokens.id"), nullable=True)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=True)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="General")  # Payment, Weight, Quality, Queue, Staff
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    ai_suggested_category = Column(String(50), nullable=True)
    ai_suggested_priority = Column(String(20), nullable=True)
    status = Column(String(30), default="open")  # open, investigating, resolved, rejected
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer = relationship("User", foreign_keys=[farmer_id], back_populates="issues")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    messages = relationship("IssueMessage", back_populates="issue")


class IssueMessage(Base):
    __tablename__ = "issue_messages"

    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_role = Column(String(30), nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    issue = relationship("Issue", back_populates="messages")


class MLPredictionLog(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, nullable=True)
    centre_id = Column(Integer, nullable=True)
    model_name = Column(String(50), nullable=False)  # ETA_Model, Anomaly_Detector, Complaint_NLP
    input_features = Column(Text, nullable=False)
    prediction_result = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
