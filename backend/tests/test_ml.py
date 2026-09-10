from fastapi.testclient import TestClient
from backend.main import app

def test_weighing_and_correction_flow():
    with TestClient(app) as client:
        resp = client.post("/api/weighing", json={
            "token_id": 43,
            "scale_id": "SCALE-TEST-01",
            "gross_weight_kg": 620.0,
            "tare_weight_kg": 20.0
        })
        assert resp.status_code == 200

def test_ml_eta():
    with TestClient(app) as client:
        resp = client.post("/api/ml/eta/predict", json={
            "queue_length": 10,
            "active_staff": 4,
            "time_of_day_hour": 11,
            "expected_qty_kg": 500.0
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "ml_predicted_eta_min" in data
        assert "delay_risk" in data

def test_ml_anomaly():
    with TestClient(app) as client:
        resp = client.post("/api/ml/anomaly/check", json={
            "operator_id": 2,
            "token_id": 1,
            "processing_time_sec": 15.0,
            "weight_kg": 5000.0,
            "corrections_count": 3
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["is_anomaly"] == True

def test_nlp_complaint():
    with TestClient(app) as client:
        resp = client.post("/api/ml/nlp/classify", json={
            "complaint_text": "Kanta operator ne weight galat likha hai"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["suggested_category"] in ["Weight", "General", "Quality", "Payment", "Queue"]
