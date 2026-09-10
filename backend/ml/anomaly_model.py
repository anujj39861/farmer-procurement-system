import os
import pickle
import pandas as pd

MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_models", "anomaly_model.pkl")

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, "rb") as f:
                self.model = pickle.load(f)

    def evaluate(self, processing_time_sec: float, weight_kg: float, corrections_count: int = 0) -> dict:
        flags = []
        is_anomalous = False
        anomaly_score = 0.0

        # Heuristic rules
        if processing_time_sec < 30:
            flags.append("Abnormally fast processing time (< 30s)")
            is_anomalous = True
        elif processing_time_sec > 1800:
            flags.append("Unusually prolonged transaction time (> 30 min)")
            is_anomalous = True

        if weight_kg < 50 or weight_kg > 4000:
            flags.append(f"Extreme weight reading: {weight_kg} kg")
            is_anomalous = True

        if corrections_count >= 2:
            flags.append(f"Multiple weight corrections ({corrections_count}) on single transaction")
            is_anomalous = True

        # ML model check
        if self.model is not None:
            try:
                X = pd.DataFrame([{
                    "processing_time_sec": processing_time_sec,
                    "weight_kg": weight_kg,
                    "corrections_count": corrections_count
                }])
                pred = self.model.predict(X)[0] # -1 for anomaly, 1 for normal
                score = float(self.model.score_samples(X)[0])
                anomaly_score = round(abs(score), 3)
                if pred == -1:
                    is_anomalous = True
                    if "ML Isolation Forest flagged unusual pattern" not in flags:
                        flags.append("ML Isolation Forest flagged unusual operational pattern")
            except Exception:
                pass

        risk_level = "HIGH_RISK" if (len(flags) >= 2 or corrections_count >= 2) else ("SUSPICIOUS" if is_anomalous else "NORMAL")

        return {
            "is_anomaly": is_anomalous,
            "risk_level": risk_level,
            "anomaly_score": anomaly_score,
            "flags": flags
        }

anomaly_detector = AnomalyDetector()
