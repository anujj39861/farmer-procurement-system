import os
import pickle

CAT_MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_models", "complaint_cat_model.pkl")
PRIO_MODEL_PATH = os.path.join(os.path.dirname(__file__), "saved_models", "complaint_prio_model.pkl")

class ComplaintClassifier:
    def __init__(self):
        self.cat_model = None
        self.prio_model = None
        self.load_models()

    def load_models(self):
        if os.path.exists(CAT_MODEL_PATH):
            with open(CAT_MODEL_PATH, "rb") as f:
                self.cat_model = pickle.load(f)
        if os.path.exists(PRIO_MODEL_PATH):
            with open(PRIO_MODEL_PATH, "rb") as f:
                self.prio_model = pickle.load(f)

    def classify(self, text: str) -> dict:
        category = "General"
        priority = "Medium"

        if not text or len(text.strip()) == 0:
            return {"suggested_category": category, "suggested_priority": priority}

        text_lower = text.lower()
        # Heuristic keywords override/fallback
        if any(w in text_lower for w in ["payment", "paisai", "paisa", "bank", "money", "credit", "account"]):
            category = "Payment"
            priority = "High"
        elif any(w in text_lower for w in ["weight", "kanta", "scale", "wazan", "weighting", "kg"]):
            category = "Weight"
            priority = "High"
        elif any(w in text_lower for w in ["quality", "moisture", "grain", "grade", "reject"]):
            category = "Quality"
            priority = "Medium"
        elif any(w in text_lower for w in ["queue", "line", "token", "wait", "delay"]):
            category = "Queue"
            priority = "Medium"

        if self.cat_model and self.prio_model:
            try:
                ml_cat = self.cat_model.predict([text])[0]
                ml_prio = self.prio_model.predict([text])[0]
                category = ml_cat
                priority = ml_prio
            except Exception:
                pass

        return {
            "suggested_category": category,
            "suggested_priority": priority
        }

complaint_classifier = ComplaintClassifier()
