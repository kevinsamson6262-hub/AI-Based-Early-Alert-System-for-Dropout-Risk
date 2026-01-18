from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from sms_service import send_sms
import pandas as pd
import json
import os
import uuid

# Firebase
import firebase_admin
from firebase_admin import credentials, firestore

from ml_model import DropoutPredictor
import math

def clean_nan(value):
    if isinstance(value, float) and math.isnan(value):
        return 0.0
    return value

def clean_dict(obj):
    if isinstance(obj, dict):
        return {k: clean_dict(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [clean_dict(v) for v in obj]
    return clean_nan(obj)

# -------------------------------------------------
# INIT
# -------------------------------------------------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

cred = credentials.Certificate(ROOT_DIR / "serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()
api_router = APIRouter(prefix="/api")

MODEL_PATH = ROOT_DIR / "dropout_model.pkl"
predictor = DropoutPredictor()
predictor.load_model(str(MODEL_PATH))

MODEL_METRICS = None

# -------------------------------------------------
# SCHEMA
# -------------------------------------------------
class StudentData(BaseModel):
    phone_number: Optional[str] = None
    student_id: Optional[str] = None
    age: int
    attendance_percentage: float
    average_marks: float
    absences_per_month: int
    distance_to_school_km: float
    family_income_level: str
    parents_education_level: str
    health_issues: str
    child_labor: int = 0
    has_sibling_dropout: int = 0

# -------------------------------------------------
# DATASET GENERATION
# -------------------------------------------------
@api_router.post("/dataset/generate")
async def generate_dataset(n_samples: int = 150):
    df = predictor.generate_synthetic_data(n_samples)

    for _, row in df.iterrows():
        record = row.to_dict()
        record["created_at"] = datetime.now(timezone.utc).isoformat()

        # SAVE ONLY FOR TRAINING
        db.collection("training_students").document(
            record["student_id"]
        ).set(record)

    return {
        "message": "Training dataset generated",
        "total_students": n_samples
    }

# -------------------------------------------------
# TRAIN MODEL
# -------------------------------------------------
@api_router.post("/model/train")
async def train_model():
    global MODEL_METRICS

    docs = db.collection("training_students").stream()
    students = [doc.to_dict() for doc in docs]

    if not students:
        raise HTTPException(400, "No training data found")

    df = pd.DataFrame(students)

    raw_metrics = predictor.train_model(df)

    # 🔥 CLEAN EVERYTHING (deep clean)
    MODEL_METRICS = clean_dict(raw_metrics)

    predictor.save_model(str(MODEL_PATH))

    return Response(
        content=json.dumps({
            "message": "Model trained successfully",
            "metrics": MODEL_METRICS
        }),
        media_type="application/json"
    )

@api_router.get("/alerts")
async def get_alerts():
    alerts_ref = db.collection("alerts").stream()

    alerts = []
    for doc in alerts_ref:
        data = doc.to_dict()
        data["id"] = doc.id   # needed for React key
        alerts.append(data)

    return {
        "total": len(alerts),
        "alerts": alerts
    }

# -------------------------------------------------
# GET MODEL METRICS
# -------------------------------------------------
@api_router.get("/model/metrics")
async def get_model_metrics():
    if MODEL_METRICS is None:
        raise HTTPException(404, "Model has not been trained yet")

    return Response(
        content=json.dumps(clean_dict(MODEL_METRICS)),
        media_type="application/json"
    )

@api_router.get("/students")
async def get_students():
    predictions = {
        doc.id: doc.to_dict()
        for doc in db.collection("predictions").stream()
    }

    students = [doc.to_dict() for doc in db.collection("students").stream()]
    merged = []

    for s in students:
        sid = s.get("student_id")
        if sid in predictions:
            merged.append({**s, **predictions[sid]})
        else:
            merged.append(s)

    # 🔥 CLEAN NaN VALUES
    cleaned_students = []
    for s in merged:
        cleaned_students.append({
            k: clean_nan(v) for k, v in s.items()
        })

    return {
        "total_students": len(cleaned_students),
        "students": cleaned_students
    }

# -------------------------------------------------
# ADD STUDENT (MANUAL)
# -------------------------------------------------
@api_router.post("/students")
async def add_student(student: StudentData):
    try:
        student_id = student.student_id or f"STU{uuid.uuid4().hex[:6]}"

        record = {
            **student.model_dump(),
            "student_id": student_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        db.collection("students").document(student_id).set(record)

        return {
            "message": "Student added successfully",
            "student_id": student_id
        }

    except Exception as e:
        print("❌ Add student error:", e)
        raise HTTPException(status_code=500, detail="Failed to add student")

@api_router.get("/students/{student_id}")
async def get_student_detail(student_id: str):
    # Get student base data
    student_doc = db.collection("students").document(student_id).get()
    if not student_doc.exists:
        raise HTTPException(status_code=404, detail="Student not found")

    student = student_doc.to_dict()

    # Get prediction (if exists)
    pred_doc = db.collection("predictions").document(student_id).get()
    if pred_doc.exists:
        student.update(pred_doc.to_dict())

    # Get interventions
    interventions = [
        doc.to_dict()
        for doc in db.collection("interventions")
        .where("student_id", "==", student_id)
        .stream()
    ]

    return {
        "student": student,
        "interventions": interventions
    }


@api_router.get("/stats")
async def get_stats():
    # Prefer predictions if available
    predictions = [doc.to_dict() for doc in db.collection("predictions").stream()]

    if predictions:
        df = pd.DataFrame(predictions)

        risk_counts = df["predicted_risk"].value_counts().to_dict()

        return Response(
            content=json.dumps({
                "total_students": len(df),
                "risk_distribution": {
                    "High": risk_counts.get("High", 0),
                    "Medium": risk_counts.get("Medium", 0),
                    "Low": risk_counts.get("Low", 0)
                },
                "average_attendance": float(df["attendance_percentage"].mean()),
                "average_marks": float(df["average_marks"].mean()),
                "has_predictions": True
            }),
            media_type="application/json"
        )

    # Fallback → students only
    students = [doc.to_dict() for doc in db.collection("students").stream()]

    if not students:
        return Response(
            content=json.dumps({
                "total_students": 0,
                "risk_distribution": {"High": 0, "Medium": 0, "Low": 0},
                "average_attendance": 0,
                "average_marks": 0,
                "has_predictions": False
            }),
            media_type="application/json"
        )

    df = pd.DataFrame(students)

    return Response(
        content=json.dumps({
            "total_students": len(df),
            "risk_distribution": {"High": 0, "Medium": 0, "Low": 0},
            "average_attendance": float(df["attendance_percentage"].mean()),
            "average_marks": float(df["average_marks"].mean()),
            "has_predictions": False
        }),
        media_type="application/json"
    )
# -------------------------------------------------
# SINGLE PREDICTION
# -------------------------------------------------
@api_router.post("/predict")
async def predict(student: StudentData):
    if predictor.model is None:
        raise HTTPException(400, "Model not trained")

    result = predictor.predict_single(student.model_dump())

    return Response(
        content=json.dumps(result),
        media_type="application/json"
    )

# -------------------------------------------------
# BATCH PREDICTION (GENERATE BUTTON)
# -------------------------------------------------
@api_router.post("/predict/batch")
async def predict_batch():
    if predictor.model is None:
        raise HTTPException(400, "Model not trained")

    students = [doc.to_dict() for doc in db.collection("students").stream()]

    if not students:
        raise HTTPException(400, "No students found")

    for s in students:
        result = predictor.predict_single(s)

        record = {
            **s,
            **result,
            "predicted_at": datetime.now(timezone.utc).isoformat()
        }

        db.collection("predictions").document(s["student_id"]).set(record)

    return {
        "message": "Predictions generated",
        "total_predictions": len(students)
    }

class AlertData(BaseModel):
    student_id: str
    risk_level: str
    phone_number: str
    message: str


@api_router.post("/alerts/send")
async def send_alert(alert: dict):
    alert["created_at"] = datetime.now(timezone.utc).isoformat()

    # Send SMS via Twilio
    sms_result = send_sms(
        alert["phone_number"],
        alert["message"]
    )

    # Save alert + SMS status
    alert["sms_status"] = sms_result["status"]
    alert["sms_sid"] = sms_result["sid"]

    db.collection("alerts").add(alert)

    return {
        "status": "success",
        "sms": sms_result
    }


class InterventionData(BaseModel):
    student_id: str
    intervention_type: str
    notes: Optional[str] = None


@api_router.post("/interventions")
async def create_intervention(intervention: InterventionData):
    try:
        record = {
            **intervention.dict(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        db.collection("interventions").add(record)

        return {"message": "Intervention recorded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/training/count")
async def training_count():
    count = len(list(db.collection("training_students").stream()))
    return {"count": count}
# -------------------------------------------------
# APP CONFIG
# -------------------------------------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
