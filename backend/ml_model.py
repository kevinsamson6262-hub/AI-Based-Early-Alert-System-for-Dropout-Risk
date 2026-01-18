import pandas as pd
import numpy as np
import os
import joblib
from typing import Dict

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report


class DropoutPredictor:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.feature_names = []

    # -------------------------------------------------
    # SYNTHETIC DATA
    # -------------------------------------------------
    def generate_synthetic_data(self, n_samples: int = 300) -> pd.DataFrame:
        np.random.seed(42)

        df = pd.DataFrame({
            "student_id": [f"STU{i:04d}" for i in range(n_samples)],
            "age": np.random.randint(12, 18, n_samples),
            "attendance_percentage": np.random.uniform(50, 100, n_samples),
            "average_marks": np.random.uniform(30, 95, n_samples),
            "absences_per_month": np.random.randint(0, 15, n_samples),
            "distance_to_school_km": np.random.uniform(0.5, 15, n_samples),
            "family_income_level": np.random.choice(["Low", "Medium", "High"], n_samples),
            "parents_education_level": np.random.choice(
                ["No Education", "Primary", "Secondary", "Higher"], n_samples
            ),
            "health_issues": np.random.choice(["Yes", "No"], n_samples),
            "child_labor": np.random.choice([0, 1], n_samples),
            "has_sibling_dropout": np.random.choice([0, 1], n_samples)
        })

        risk_score = (
            (df["attendance_percentage"] < 75) * 25 +
            (df["average_marks"] < 40) * 25 +
            (df["absences_per_month"] > 8) * 10 +
            (df["distance_to_school_km"] > 10) * 10 +
            (df["family_income_level"] == "Low") * 10 +
            df["child_labor"] * 20 +
            df["has_sibling_dropout"] * 15 +
            (df["health_issues"] == "Yes") * 10
        )

        df["dropout_risk"] = pd.cut(
            risk_score,
            bins=[0, 40, 70, 100],
            labels=["Low", "Medium", "High"]
        )

        return df

    # -------------------------------------------------
    # PREPROCESS
    # -------------------------------------------------
    def preprocess_data(self, df: pd.DataFrame, training: bool = True):
        df = df.copy()

        cat_cols = ["family_income_level", "parents_education_level", "health_issues"]
        for col in cat_cols:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df[col] = self.label_encoders[col].fit_transform(df[col])
            else:
                df[col] = self.label_encoders[col].transform(df[col])

        self.feature_names = [
            "age", "attendance_percentage", "average_marks",
            "absences_per_month", "distance_to_school_km",
            "family_income_level", "parents_education_level",
            "health_issues", "child_labor", "has_sibling_dropout"
        ]

        X = df[self.feature_names]

        # ✅ ONLY during training
        if training:
            if "dropout_risk" not in self.label_encoders:
                self.label_encoders["dropout_risk"] = LabelEncoder()
                y = self.label_encoders["dropout_risk"].fit_transform(df["dropout_risk"])
            else:
                y = self.label_encoders["dropout_risk"].transform(df["dropout_risk"])

            return X, y

        # ✅ during prediction
        return X, None

    # -------------------------------------------------
    # TRAIN MODEL
    # -------------------------------------------------
    def train_model(self, df: pd.DataFrame) -> Dict:
        X, y = self.preprocess_data(df)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        self.model = RandomForestClassifier(
            n_estimators=150,
            max_depth=10,
            random_state=42,
            class_weight="balanced"
        )

        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)

        # 🔥 FEATURE IMPORTANCE
        feature_importance = [
            {
                "feature": name,
                "importance": float(score)
            }
            for name, score in zip(
                self.feature_names,
                self.model.feature_importances_
            )
        ]

        # sort by importance (descending)
        feature_importance.sort(
            key=lambda x: x["importance"],
            reverse=True
        )

        return {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
            "classification_report": classification_report(
                y_test,
                y_pred,
                target_names=self.label_encoders["dropout_risk"].classes_,
                output_dict=True,
                zero_division=0
            ),
            "feature_importance": feature_importance
        }

    # -------------------------------------------------
    # PREDICT
    # -------------------------------------------------
    def predict_single(self, student: Dict) -> Dict:
        df = pd.DataFrame([student])

        X, _ = self.preprocess_data(df, training=False)

        prob = self.model.predict_proba(X)[0]
        idx = prob.argmax()

        risk = self.label_encoders["dropout_risk"].inverse_transform([idx])[0]

        return {
            "predicted_risk": risk,
            "confidence": float(prob[idx])
        }

    # -------------------------------------------------
    # SAVE / LOAD
    # -------------------------------------------------
    def save_model(self, path="dropout_model.pkl"):
        joblib.dump({
            "model": self.model,
            "label_encoders": self.label_encoders,
            "feature_names": self.feature_names
        }, path)

    def load_model(self, path="dropout_model.pkl"):
        if not os.path.exists(path):
            return False
        data = joblib.load(path)
        self.model = data["model"]
        self.label_encoders = data["label_encoders"]
        self.feature_names = data["feature_names"]
        return True
