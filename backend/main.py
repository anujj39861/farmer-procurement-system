import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base, SessionLocal
from backend.models.all_models import (
    User, Centre, Schedule, Booking, Token, QueueEvent, QualityRecord,
    WeighingRecord, ProcurementRecord, Lot, AuditLog, Issue, IssueMessage
)
from backend.routers import (
    auth, centres, schedules, tokens, queue, quality,
    weighing, procurement, lots, storage, issues, audit, analytics, notifications, ml
)
from backend.ml.train import train_eta_model, train_anomaly_model, train_complaint_classifier
from backend.services.weighing_service import record_weight
from backend.services.procurement_service import confirm_procurement
import hashlib

def hash_password(password: str) -> str:
    salt = "kisan_procurement_salt_2026"
    return hashlib.sha256((password + salt).encode()).hexdigest()

# Create tables if not exist
Base.metadata.create_all(bind=engine, checkfirst=True)

app = FastAPI(
    title="Farmer Procurement Issue Resolution System",
    description="Delay Reduction + Fraud Reduction + Transparency + AI/ML",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(centres.router)
app.include_router(schedules.router)
app.include_router(tokens.router)
app.include_router(queue.router)
app.include_router(quality.router)
app.include_router(weighing.router)
app.include_router(procurement.router)
app.include_router(lots.router)
app.include_router(storage.router)
app.include_router(issues.router)
app.include_router(audit.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(ml.router)

@app.on_event("startup")
def startup_seed_and_train():
    # 1. Train ML models if missing
    saved_model_dir = os.path.join(os.path.dirname(__file__), "ml", "saved_models")
    if not os.path.exists(os.path.join(saved_model_dir, "eta_model.pkl")):
        print("Training ML Models on Startup...")
        train_eta_model()
        train_anomaly_model()
        train_complaint_classifier()

    # 2. Seed Database if empty
    db = SessionLocal()
    try:
        if db.query(Centre).count() == 0:
            print("Seeding Initial Database Records...")
            # Create Centres
            c1 = Centre(
                name="Central Wheat Procurement Mandi - Karnal",
                district="Karnal, Haryana",
                address="GT Road, Sector 3, Karnal",
                lat=29.6857,
                lng=76.9905,
                capacity_per_day=150,
                active_counters=5,
                avg_processing_time_min=4.5
            )
            c2 = Centre(
                name="Kisan Food Grains Collection Hub - Ludhiana",
                district="Ludhiana, Punjab",
                address="Ferozepur Road, Ludhiana",
                lat=30.9010,
                lng=75.8573,
                capacity_per_day=200,
                active_counters=6,
                avg_processing_time_min=4.0
            )
            c3 = Centre(
                name="State Agriculture Procurement Centre - Bareilly",
                district="Bareilly, UP",
                address="Station Road, Bareilly",
                lat=28.3670,
                lng=79.4304,
                capacity_per_day=120,
                active_counters=3,
                avg_processing_time_min=6.0
            )
            db.add_all([c1, c2, c3])
            db.commit()

            # Create Users
            pass_hash = hash_password("farmer123")
            u_farmer = User(name="Ramesh Kumar (Farmer)", phone="9876543210", hashed_password=pass_hash, role="farmer")
            u_operator = User(name="Suresh Verma (Scale Operator)", phone="9876543211", hashed_password=pass_hash, role="operator", centre_id=c1.id)
            u_quality = User(name="Anil Sharma (Quality Inspector)", phone="9876543212", hashed_password=pass_hash, role="quality", centre_id=c1.id)
            u_supervisor = User(name="Vikram Singh (Centre Supervisor)", phone="9876543213", hashed_password=pass_hash, role="supervisor", centre_id=c1.id)
            u_admin = User(name="Admin Officer", phone="9876543214", hashed_password=pass_hash, role="admin")

            db.add_all([u_farmer, u_operator, u_quality, u_supervisor, u_admin])
            db.commit()

            # Create Schedules
            s1 = Schedule(centre_id=c1.id, date="2026-09-08", total_slots=50, booked_slots=5, crop_type="Wheat")
            s2 = Schedule(centre_id=c2.id, date="2026-09-08", total_slots=60, booked_slots=2, crop_type="Paddy")
            db.add_all([s1, s2])
            db.commit()

            # Create Bookings & Tokens
            b1 = Booking(schedule_id=s1.id, centre_id=c1.id, farmer_id=u_farmer.id, time_slot="09:00 - 10:00 AM", expected_crop="Wheat", expected_qty_kg=500.0, status="checked_in")
            db.add(b1)
            db.commit()

            t1 = Token(booking_id=b1.id, centre_id=c1.id, farmer_id=u_farmer.id, token_number=42, token_code="T-20260908-042", status="in_weighing", position=1, estimated_wait_min=15.0, delay_risk="Low")
            t2 = Token(booking_id=None, centre_id=c1.id, farmer_id=u_farmer.id, token_number=43, token_code="T-20260908-043", status="waiting", position=2, estimated_wait_min=25.0, delay_risk="Low")
            t3 = Token(booking_id=None, centre_id=c1.id, farmer_id=u_farmer.id, token_number=44, token_code="T-20260908-044", status="waiting", position=3, estimated_wait_min=35.0, delay_risk="Medium")
            db.add_all([t1, t2, t3])
            db.commit()

            # Quality Record for t1
            q1 = QualityRecord(token_id=t1.id, inspector_id=u_quality.id, moisture_pct=11.5, foreign_matter_pct=0.8, damaged_grains_pct=0.2, grade="Grade A", decision="Pass", evidence_notes="Clean dry wheat grains.")
            db.add(q1)
            db.commit()

            # Weight Record for t1 (with sample correction request)
            w1 = WeighingRecord(token_id=t1.id, operator_id=u_operator.id, scale_id="SCALE-KARNAL-01", gross_weight_kg=520.0, tare_weight_kg=20.0, net_weight_kg=500.0, is_locked=True, correction_requested=True, requested_net_weight_kg=515.0, correction_reason="Tare bag scale calibration offset correction", correction_status="pending")
            db.add(w1)
            db.commit()

            # Create Sample Audit Trail
            aud1 = AuditLog(actor_id=u_operator.id, actor_role="operator", entity_type="weighing", entity_id=str(t1.id), action="CORRECTION_REQUEST", old_value="500.0 kg", new_value="515.0 kg", reason="Tare bag scale calibration offset correction")
            db.add(aud1)

            # Create Sample Issue
            iss1 = Issue(farmer_id=u_farmer.id, token_id=t1.id, centre_id=c1.id, subject="Weighing scale calibration inquiry", description="Kanta scale tare calculation was showing 5kg difference.", category="Weight", priority="High", ai_suggested_category="Weight", ai_suggested_priority="High", status="open")
            db.add(iss1)
            db.commit()

            print("Seed Data successfully initialized!")
    finally:
        db.close()

@app.get("/api/health")
@app.get("/api/status")
def health_status():
    return {
        "system": "Farmer Procurement Issue Resolution System",
        "status": "Online",
        "docs": "/docs",
        "features": [
            "Smart Token & Slot Scheduling",
            "Anti-Manipulation Weight Lock & Correction Workflow",
            "Unique Lot QR Generation",
            "AI/ML ETA Prediction, Anomaly Detection & NLP Complaint Classifier",
            "Role-Based Access Control (Farmer, Operator, Quality, Supervisor, Admin)"
        ]
    }

# Serve Frontend SPA if frontend/dist exists
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path in ["docs", "redoc", "openapi.json"] or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return health_status()
