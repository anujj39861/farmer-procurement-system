import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

def train_eta_model():
    print("Training ETA Prediction Model...")
    np.random.seed(42)
    n_samples = 1000
    
    queue_length = np.random.randint(1, 40, size=n_samples)
    active_staff = np.random.randint(1, 8, size=n_samples)
    hour_of_day = np.random.randint(8, 18, size=n_samples)
    expected_qty_kg = np.random.uniform(100, 2000, size=n_samples)
    
    # Target wait time in minutes = (queue_length / active_staff) * 4.5 + hour penalty + noise
    hour_penalty = np.where((hour_of_day >= 11) & (hour_of_day <= 14), 8.0, 2.0)
    qty_penalty = (expected_qty_kg / 500.0) * 1.5
    
    wait_time = (queue_length / active_staff) * 5.0 + hour_penalty + qty_penalty + np.random.normal(0, 2, size=n_samples)
    wait_time = np.clip(wait_time, 2.0, 180.0)
    
    X = pd.DataFrame({
        "queue_length": queue_length,
        "active_staff": active_staff,
        "hour_of_day": hour_of_day,
        "expected_qty_kg": expected_qty_kg
    })
    y = wait_time
    
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    with open(os.path.join(MODEL_DIR, "eta_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    print("ETA Model saved!")

def train_anomaly_model():
    print("Training Anomaly / Fraud Detection Model...")
    np.random.seed(42)
    n_normal = 900
    n_outliers = 100
    
    # Normal data
    proc_time_norm = np.random.normal(300, 60, size=n_normal) # ~5 min
    weight_norm = np.random.normal(600, 150, size=n_normal)
    corrections_norm = np.random.poisson(0.1, size=n_normal)
    
    # Outlier / fraudulent pattern data
    proc_time_out = np.random.choice([15, 20, 1200, 1500], size=n_outliers) # super fast or extremely slow
    weight_out = np.random.choice([50, 4500, 5000], size=n_outliers) # weird weights
    corrections_out = np.random.randint(2, 6, size=n_outliers) # repeated edits
    
    proc_time = np.concatenate([proc_time_norm, proc_time_out])
    weight = np.concatenate([weight_norm, weight_out])
    corrections = np.concatenate([corrections_norm, corrections_out])
    
    X = pd.DataFrame({
        "processing_time_sec": proc_time,
        "weight_kg": weight,
        "corrections_count": corrections
    })
    
    model = IsolationForest(contamination=0.1, random_state=42)
    model.fit(X)
    
    with open(os.path.join(MODEL_DIR, "anomaly_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    print("Anomaly Model saved!")

def train_complaint_classifier():
    print("Training Complaint NLP Classifier...")
    data = [
        ("Mera payment pichle 5 din se credit nahi hua hai", "Payment", "High"),
        ("Payment delayed by 3 days after procurement receipt", "Payment", "High"),
        ("Money not received in bank account", "Payment", "High"),
        ("Scale operator ne wrong weight register kar diya", "Weight", "High"),
        ("Weighing machine calculation mismatch by 40 kg", "Weight", "High"),
        ("Kanta operator weight ghata kar likh raha hai", "Weight", "High"),
        ("Wheat quality pass hone ke bawajood rejected dikha raha hai", "Quality", "Medium"),
        ("Quality inspector moisture content wrong measure kar raha hai", "Quality", "Medium"),
        ("Grain sample testing delay in lab", "Quality", "Medium"),
        ("Token number #42 par line moving nahi ho rahi hai", "Queue", "Low"),
        ("Queue is too slow and token delay is 2 hours", "Queue", "Medium"),
        ("Centre counters missing staff", "Staff", "Low"),
        ("Operator misbehaving at counter number 2", "Staff", "Medium"),
        ("Token skipped without calling", "Queue", "Medium"),
    ] * 10
    
    df = pd.DataFrame(data, columns=["text", "category", "priority"])
    
    cat_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=200)),
        ("clf", LogisticRegression())
    ])
    cat_pipeline.fit(df["text"], df["category"])
    
    prio_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(max_features=200)),
        ("clf", LogisticRegression())
    ])
    prio_pipeline.fit(df["text"], df["priority"])
    
    with open(os.path.join(MODEL_DIR, "complaint_cat_model.pkl"), "wb") as f:
        pickle.dump(cat_pipeline, f)
        
    with open(os.path.join(MODEL_DIR, "complaint_prio_model.pkl"), "wb") as f:
        pickle.dump(prio_pipeline, f)
    print("Complaint Classifier saved!")

if __name__ == "__main__":
    train_eta_model()
    train_anomaly_model()
    train_complaint_classifier()
