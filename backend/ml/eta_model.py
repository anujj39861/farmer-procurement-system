import os
import pickle
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_models", "eta_model.pkl")

class ETAPredictor:
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, "rb") as f:
                self.model = pickle.load(f)

    def predict(self, queue_length: int, active_staff: int = 4, hour_of_day: int = 10, expected_qty_kg: float = 500.0) -> dict:
        # Rule-based fallback
        staff_count = max(1, active_staff)
        rule_eta = round((queue_length / staff_count) * 5.0, 1)

        if self.model is not None:
            try:
                X = pd.DataFrame([{
                    "queue_length": queue_length,
                    "active_staff": staff_count,
                    "hour_of_day": hour_of_day,
                    "expected_qty_kg": expected_qty_kg
                }])
                ml_eta = round(float(self.model.predict(X)[0]), 1)
            except Exception:
                ml_eta = rule_eta
        else:
            ml_eta = rule_eta

        # Determine risk level
        if ml_eta > 60:
            risk = "High"
        elif ml_eta > 30:
            risk = "Medium"
        else:
            risk = "Low"

        return {
            "rule_based_eta_min": rule_eta,
            "ml_predicted_eta_min": ml_eta,
            "delay_risk": risk
        }

eta_predictor = ETAPredictor()
