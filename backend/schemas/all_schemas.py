from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

# --- Auth ---
class UserCreate(BaseModel):
    name: str
    phone: str
    password: str
    role: str = "farmer"  # farmer, operator, quality, supervisor, admin
    centre_id: Optional[int] = None
    email: Optional[str] = None

class UserLogin(BaseModel):
    phone: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    phone: str
    role: str
    centre_id: Optional[int] = None
    email: Optional[str] = None
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Centres ---
class CentreCreate(BaseModel):
    name: str
    district: str
    address: str
    lat: float
    lng: float
    capacity_per_day: int = 100
    active_counters: int = 4
    avg_processing_time_min: float = 5.0
    open_time: str = "08:00"
    close_time: str = "17:00"

class CentreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    district: str
    address: str
    lat: float
    lng: float
    capacity_per_day: int
    active_counters: int
    avg_processing_time_min: float
    open_time: str
    close_time: str
    is_active: bool

# --- Schedule & Booking ---
class ScheduleCreate(BaseModel):
    centre_id: int
    date: str
    total_slots: int = 50
    crop_type: str = "Wheat"
    max_qty_kg: float = 1000.0

class BookingCreate(BaseModel):
    schedule_id: int
    time_slot: str
    expected_crop: str
    expected_qty_kg: float

class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    schedule_id: int
    centre_id: int
    farmer_id: int
    time_slot: str
    expected_crop: str
    expected_qty_kg: float
    status: str
    created_at: datetime

# --- Tokens & Queue ---
class TokenCreate(BaseModel):
    centre_id: int
    booking_id: Optional[int] = None
    farmer_id: Optional[int] = None

class TokenDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    token_number: int
    token_code: str
    centre_id: int
    farmer_id: int
    status: str
    position: int
    estimated_wait_min: float
    delay_risk: str
    created_at: datetime
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None

class QueueStatusPatch(BaseModel):
    status: str  # in_quality, in_weighing, in_procurement, completed, rejected
    notes: Optional[str] = None

# --- Quality ---
class QualityRecordCreate(BaseModel):
    token_id: int
    moisture_pct: float
    foreign_matter_pct: float
    damaged_grains_pct: float = 0.0
    evidence_notes: Optional[str] = None

class QualityRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    token_id: int
    inspector_id: int
    moisture_pct: float
    foreign_matter_pct: float
    damaged_grains_pct: float
    grade: str
    decision: str
    evidence_notes: Optional[str]
    created_at: datetime

# --- Weighing ---
class WeighingCreate(BaseModel):
    token_id: int
    scale_id: str = "SCALE-01"
    gross_weight_kg: float
    tare_weight_kg: float = 0.0

class WeightCorrectionRequest(BaseModel):
    requested_net_weight_kg: float
    reason: str
    evidence_url: Optional[str] = None

class WeightCorrectionDecision(BaseModel):
    approve: bool
    supervisor_notes: Optional[str] = None

class WeighingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    token_id: int
    operator_id: int
    scale_id: str
    gross_weight_kg: float
    tare_weight_kg: float
    net_weight_kg: float
    is_locked: bool
    correction_requested: bool
    requested_net_weight_kg: Optional[float] = None
    correction_reason: Optional[str] = None
    correction_status: str
    created_at: datetime

# --- Procurement ---
class ProcurementCreate(BaseModel):
    token_id: int

class ProcurementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    token_id: int
    centre_id: int
    farmer_id: int
    crop_type: str
    verified_weight_kg: float
    grade: str
    rate_per_kg: float
    total_amount: float
    lot_number: str
    qr_code_url: str
    payment_status: str
    created_at: datetime

# --- Issues ---
class IssueCreate(BaseModel):
    token_id: Optional[int] = None
    centre_id: Optional[int] = None
    subject: str
    description: str

class IssueMessageCreate(BaseModel):
    message: str

class IssueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    farmer_id: int
    token_id: Optional[int] = None
    centre_id: Optional[int] = None
    subject: str
    description: str
    category: str
    priority: str
    ai_suggested_category: Optional[str] = None
    ai_suggested_priority: Optional[str] = None
    status: str
    created_at: datetime

# --- Audit Log ---
class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    actor_role: str
    entity_type: str
    entity_id: str
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: Optional[str] = None
    timestamp: datetime

# --- ML Requests ---
class ETAPredictionRequest(BaseModel):
    queue_length: int
    active_staff: int = 4
    time_of_day_hour: int = 10
    expected_qty_kg: float = 500.0

class AnomalyCheckRequest(BaseModel):
    operator_id: int
    token_id: int
    processing_time_sec: float
    weight_kg: float
    corrections_count: int = 0

class ComplaintNLPRequest(BaseModel):
    complaint_text: str
