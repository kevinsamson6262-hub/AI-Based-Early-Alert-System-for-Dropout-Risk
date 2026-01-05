from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional
import uuid
from datetime import datetime, timezone
import pandas as pd
import io
from ml_model import DropoutPredictor

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

predictor = DropoutPredictor()
predictor.load_model()

class StudentData(BaseModel):
    student_id: Optional[str] = None
    age: int
    attendance_percentage: float
    average_marks: float
    absences_per_month: int
    family_income_level: str
    parents_education_level: str
    distance_to_school_km: float
    health_issues: str

class AlertRequest(BaseModel):
    student_id: str
    risk_level: str
    phone_number: str
    message: str

class InterventionCreate(BaseModel):
    student_id: str
    intervention_type: str
    notes: Optional[str] = None

class InterventionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    student_id: str
    intervention_type: str
    notes: Optional[str] = None
    created_at: str

@api_router.get("/")
async def root():
    return {"message": "AI Dropout Risk Predictor API"}

@api_router.post("/dataset/generate")
async def generate_dataset(n_samples: int = 150):
    """Generate synthetic student dataset"""
    try:
        df = predictor.generate_synthetic_data(n_samples)
        
        students_data = df.to_dict('records')
        await db.students.delete_many({})
        await db.students.insert_many(students_data)
        
        return {
            "message": f"Generated {n_samples} student records",
            "sample_data": df.head(5).to_dict('records'),
            "total_records": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/model/train")
async def train_model():
    """Train the ML model on current dataset"""
    try:
        students = await db.students.find({}, {"_id": 0}).to_list(1000)
        
        if not students:
            raise HTTPException(status_code=400, detail="No dataset available. Please generate or upload data first.")
        
        df = pd.DataFrame(students)
        
        metrics = predictor.train_model(df)
        predictor.save_model()
        
        return {
            "message": "Model trained successfully",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/predict")
async def predict_risk(student: StudentData):
    """Predict dropout risk for a student"""
    try:
        if predictor.model is None:
            raise HTTPException(status_code=400, detail="Model not trained yet. Please train the model first.")
        
        prediction = predictor.predict_single(student.model_dump())
        
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/predict/batch")
async def predict_batch():
    """Predict risk for all students in database"""
    try:
        if predictor.model is None:
            raise HTTPException(status_code=400, detail="Model not trained yet")
        
        students = await db.students.find({}, {"_id": 0}).to_list(1000)
        
        predictions = []
        for student in students:
            pred = predictor.predict_single(student)
            predictions.append({**student, **pred})
        
        await db.predictions.delete_many({})
        await db.predictions.insert_many(predictions)
        
        return {
            "message": "Batch prediction completed",
            "total_predictions": len(predictions),
            "predictions": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/students")
async def get_students():
    """Get all students with predictions"""
    try:
        predictions = await db.predictions.find({}, {"_id": 0}).to_list(1000)
        
        if not predictions:
            students = await db.students.find({}, {"_id": 0}).to_list(1000)
            return {
                "students": students,
                "has_predictions": False
            }
        
        return {
            "students": predictions,
            "has_predictions": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/students/{student_id}")
async def get_student(student_id: str):
    """Get specific student details"""
    try:
        student = await db.predictions.find_one({"student_id": student_id}, {"_id": 0})
        
        if not student:
            student = await db.students.find_one({"student_id": student_id}, {"_id": 0})
        
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        interventions = await db.interventions.find({"student_id": student_id}, {"_id": 0}).to_list(100)
        
        return {
            "student": student,
            "interventions": interventions
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/model/metrics")
async def get_model_metrics():
    """Get model performance metrics"""
    try:
        if predictor.model is None:
            raise HTTPException(status_code=400, detail="Model not trained yet")
        
        return {
            "accuracy": predictor.accuracy,
            "confusion_matrix": predictor.confusion_matrix,
            "feature_importance": predictor.feature_importance
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/alerts/send")
async def send_alert(alert: AlertRequest):
    """Simulate sending an alert"""
    try:
        alert_doc = {
            "id": str(uuid.uuid4()),
            "student_id": alert.student_id,
            "risk_level": alert.risk_level,
            "phone_number": alert.phone_number,
            "message": alert.message,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "status": "sent"
        }
        
        await db.alerts.insert_one(alert_doc)
        
        return {
            "message": "Alert sent successfully (simulated)",
            "alert": {k: v for k, v in alert_doc.items() if k != '_id'}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/alerts")
async def get_alerts():
    """Get all sent alerts"""
    try:
        alerts = await db.alerts.find({}, {"_id": 0}).to_list(1000)
        return {"alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/interventions")
async def create_intervention(intervention: InterventionCreate):
    """Create an intervention record"""
    try:
        intervention_doc = {
            "id": str(uuid.uuid4()),
            "student_id": intervention.student_id,
            "intervention_type": intervention.intervention_type,
            "notes": intervention.notes,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.interventions.insert_one(intervention_doc)
        
        return {
            "message": "Intervention recorded",
            "intervention": {k: v for k, v in intervention_doc.items() if k != '_id'}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/interventions/{student_id}")
async def get_interventions(student_id: str):
    """Get interventions for a student"""
    try:
        interventions = await db.interventions.find({"student_id": student_id}, {"_id": 0}).to_list(100)
        return {"interventions": interventions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/stats")
async def get_stats():
    """Get overall statistics"""
    try:
        predictions = await db.predictions.find({}, {"_id": 0}).to_list(1000)
        
        if not predictions:
            return {
                "total_students": 0,
                "risk_distribution": {"High": 0, "Medium": 0, "Low": 0},
                "has_data": False
            }
        
        df = pd.DataFrame(predictions)
        
        risk_counts = df['predicted_risk'].value_counts().to_dict() if 'predicted_risk' in df.columns else df['dropout_risk'].value_counts().to_dict()
        
        return {
            "total_students": len(predictions),
            "risk_distribution": risk_counts,
            "has_data": True,
            "average_attendance": float(df['attendance_percentage'].mean()) if 'attendance_percentage' in df.columns else 0,
            "average_marks": float(df['average_marks'].mean()) if 'average_marks' in df.columns else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
