from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.all_models import (
    Token, ProcurementRecord, QualityRecord, WeighingRecord, Issue, Centre, AuditLog
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db)):
    total_tokens = db.query(Token).count()
    completed_procurements = db.query(ProcurementRecord).count()
    
    total_weight = db.query(ProcurementRecord.verified_weight_kg).all()
    sum_weight_kg = sum(w[0] for w in total_weight) if total_weight else 0.0

    total_payout = db.query(ProcurementRecord.total_amount).all()
    sum_payout = sum(p[0] for p in total_payout) if total_payout else 0.0

    pending_corrections = db.query(WeighingRecord).filter(WeighingRecord.correction_status == "pending").count()
    rejected_quality = db.query(QualityRecord).filter(QualityRecord.decision == "Reject").count()
    open_issues = db.query(Issue).filter(Issue.status == "open").count()

    waiting_tokens = db.query(Token).filter(Token.status == "waiting").all()
    avg_wait = sum(t.estimated_wait_min for t in waiting_tokens) / len(waiting_tokens) if waiting_tokens else 0.0

    return {
        "total_tokens_generated": total_tokens,
        "completed_procurements": completed_procurements,
        "total_procured_weight_kg": round(sum_weight_kg, 1),
        "total_disbursed_payout_inr": round(sum_payout, 2),
        "pending_weight_corrections": pending_corrections,
        "rejected_quality_cases": rejected_quality,
        "open_issues_count": open_issues,
        "avg_queue_wait_min": round(avg_wait, 1)
    }

@router.get("/charts")
def get_chart_data(db: Session = Depends(get_db)):
    # Centre wise procurement volume
    centres = db.query(Centre).all()
    centre_data = []
    for c in centres:
        procs = db.query(ProcurementRecord).filter(ProcurementRecord.centre_id == c.id).all()
        vol = sum(p.verified_weight_kg for p in procs)
        tokens_cnt = db.query(Token).filter(Token.centre_id == c.id).count()
        centre_data.append({
            "centre_id": c.id,
            "centre_name": c.name,
            "district": c.district,
            "tokens_count": tokens_cnt,
            "total_procured_kg": round(vol, 1)
        })

    # Status distribution
    statuses = ["waiting", "in_quality", "in_weighing", "in_procurement", "completed", "rejected"]
    status_dist = {}
    for s in statuses:
        status_dist[s] = db.query(Token).filter(Token.status == s).count()

    # Fraud / Anomaly flags summary
    audits_flagged = db.query(AuditLog).filter(AuditLog.action.in_(["CORRECTION_REQUEST", "FLAG_ANOMALY"])).count()

    return {
        "centre_analytics": centre_data,
        "queue_status_distribution": status_dist,
        "suspicious_events_count": audits_flagged
    }
