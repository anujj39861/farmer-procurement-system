from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.all_models import Token, WeighingRecord, ProcurementRecord, Centre, MLPredictionLog
from backend.schemas.all_schemas import ETAPredictionRequest, AnomalyCheckRequest, ComplaintNLPRequest
from backend.ml.eta_model import eta_predictor
from backend.ml.anomaly_model import anomaly_detector
from backend.ml.complaint_classifier import complaint_classifier

router = APIRouter(prefix="/api/ml", tags=["ML"])

@router.post("/eta/predict")
def predict_eta(req: ETAPredictionRequest):
    res = eta_predictor.predict(
        queue_length=req.queue_length,
        active_staff=req.active_staff,
        hour_of_day=req.time_of_day_hour,
        expected_qty_kg=req.expected_qty_kg
    )
    return res

@router.get("/eta/{token_id}")
def get_token_eta(token_id: int, db: Session = Depends(get_db)):
    token = db.query(Token).filter(Token.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    
    centre = db.query(Centre).filter(Centre.id == token.centre_id).first()
    staff = centre.active_counters if centre else 4
    
    waiting_cnt = db.query(Token).filter(
        Token.centre_id == token.centre_id,
        Token.status == "waiting",
        Token.id <= token_id
    ).count()

    res = eta_predictor.predict(queue_length=waiting_cnt, active_staff=staff)
    return {
        "token_id": token_id,
        "token_code": token.token_code,
        "position": token.position,
        "eta_details": res
    }

@router.post("/anomaly/check")
def check_anomaly(req: AnomalyCheckRequest, db: Session = Depends(get_db)):
    res = anomaly_detector.evaluate(
        processing_time_sec=req.processing_time_sec,
        weight_kg=req.weight_kg,
        corrections_count=req.corrections_count
    )
    
    # Log ML prediction
    log = MLPredictionLog(
        token_id=req.token_id,
        model_name="Anomaly_Detector",
        input_features=f"proc_time:{req.processing_time_sec}s, weight:{req.weight_kg}kg, corrections:{req.corrections_count}",
        prediction_result=f"risk_level:{res['risk_level']}, is_anomaly:{res['is_anomaly']}",
        confidence_score=res['anomaly_score']
    )
    db.add(log)
    db.commit()

    return res

@router.get("/risk/{procurement_id}")
def get_procurement_risk(procurement_id: int, db: Session = Depends(get_db)):
    proc = db.query(ProcurementRecord).filter(ProcurementRecord.id == procurement_id).first()
    if not proc:
        raise HTTPException(status_code=404, detail="Procurement record not found")
    
    weighing = db.query(WeighingRecord).filter(WeighingRecord.token_id == proc.token_id).first()
    corr_cnt = 1 if (weighing and weighing.correction_requested) else 0

    res = anomaly_detector.evaluate(
        processing_time_sec=300.0,
        weight_kg=proc.verified_weight_kg,
        corrections_count=corr_cnt
    )
    return {
        "procurement_id": procurement_id,
        "lot_number": proc.lot_number,
        "risk_evaluation": res
    }

@router.post("/nlp/classify")
def classify_complaint_nlp(req: ComplaintNLPRequest):
    return complaint_classifier.classify(req.complaint_text)
