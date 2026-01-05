import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib
from typing import Dict, List, Tuple
import os

class DropoutPredictor:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.feature_names = []
        self.feature_importance = []
        self.accuracy = 0.0
        self.confusion_matrix = []
        self.classification_report = {}
        
    def generate_synthetic_data(self, n_samples: int = 150) -> pd.DataFrame:
        """Generate synthetic student dataset"""
        np.random.seed(42)
        
        data = {
            'student_id': [f'STU{str(i).zfill(3)}' for i in range(1, n_samples + 1)],
            'age': np.random.randint(12, 18, n_samples),
            'attendance_percentage': np.random.uniform(40, 100, n_samples),
            'average_marks': np.random.uniform(30, 95, n_samples),
            'absences_per_month': np.random.randint(0, 15, n_samples),
            'family_income_level': np.random.choice(['Low', 'Medium', 'High'], n_samples, p=[0.4, 0.35, 0.25]),
            'parents_education_level': np.random.choice(['No Education', 'Primary', 'Secondary', 'Higher'], n_samples, p=[0.2, 0.3, 0.3, 0.2]),
            'distance_to_school_km': np.random.uniform(0.5, 15, n_samples),
            'health_issues': np.random.choice(['Yes', 'No'], n_samples, p=[0.25, 0.75])
        }
        
        df = pd.DataFrame(data)
        
        # Create dropout_risk based on rules
        def calculate_risk(row):
            risk_score = 0
            
            if row['attendance_percentage'] < 60:
                risk_score += 3
            elif row['attendance_percentage'] < 75:
                risk_score += 2
            elif row['attendance_percentage'] < 85:
                risk_score += 1
                
            if row['average_marks'] < 50:
                risk_score += 3
            elif row['average_marks'] < 65:
                risk_score += 2
            elif row['average_marks'] < 75:
                risk_score += 1
                
            if row['absences_per_month'] > 8:
                risk_score += 2
            elif row['absences_per_month'] > 5:
                risk_score += 1
                
            if row['family_income_level'] == 'Low':
                risk_score += 2
            elif row['family_income_level'] == 'Medium':
                risk_score += 1
                
            if row['parents_education_level'] in ['No Education', 'Primary']:
                risk_score += 1
                
            if row['distance_to_school_km'] > 10:
                risk_score += 1
                
            if row['health_issues'] == 'Yes':
                risk_score += 1
            
            if risk_score >= 7:
                return 'High'
            elif risk_score >= 4:
                return 'Medium'
            else:
                return 'Low'
        
        df['dropout_risk'] = df.apply(calculate_risk, axis=1)
        
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Preprocess and encode categorical variables"""
        df_processed = df.copy()
        
        categorical_columns = ['family_income_level', 'parents_education_level', 'health_issues']
        
        for col in categorical_columns:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df_processed[col] = self.label_encoders[col].fit_transform(df_processed[col])
            else:
                df_processed[col] = self.label_encoders[col].transform(df_processed[col])
        
        # Encode target variable
        if 'dropout_risk' not in self.label_encoders:
            self.label_encoders['dropout_risk'] = LabelEncoder()
            y = self.label_encoders['dropout_risk'].fit_transform(df_processed['dropout_risk'])
        else:
            y = self.label_encoders['dropout_risk'].transform(df_processed['dropout_risk'])
        
        # Select features
        feature_columns = ['age', 'attendance_percentage', 'average_marks', 'absences_per_month',
                          'family_income_level', 'parents_education_level', 'distance_to_school_km', 'health_issues']
        
        X = df_processed[feature_columns]
        self.feature_names = feature_columns
        
        return X, y
    
    def train_model(self, df: pd.DataFrame) -> Dict:
        """Train Random Forest model"""
        X, y = self.preprocess_data(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
        self.model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = self.model.predict(X_test)
        
        # Calculate metrics
        self.accuracy = accuracy_score(y_test, y_pred)
        self.confusion_matrix = confusion_matrix(y_test, y_pred).tolist()
        
        # Feature importance
        self.feature_importance = [
            {'feature': name, 'importance': float(importance)}
            for name, importance in zip(self.feature_names, self.model.feature_importances_)
        ]
        self.feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        
        # Classification report
        report = classification_report(y_test, y_pred, target_names=self.label_encoders['dropout_risk'].classes_, output_dict=True)
        self.classification_report = report
        
        return {
            'accuracy': float(self.accuracy),
            'confusion_matrix': self.confusion_matrix,
            'feature_importance': self.feature_importance,
            'classification_report': report
        }
    
    def predict_single(self, student_data: Dict) -> Dict:
        """Predict dropout risk for a single student"""
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        # Create DataFrame from input
        df = pd.DataFrame([student_data])
        
        # Preprocess
        X, _ = self.preprocess_data(df)
        
        # Predict
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        risk_level = self.label_encoders['dropout_risk'].inverse_transform([prediction])[0]
        
        # Get risk factors
        risk_factors = self._identify_risk_factors(student_data)
        
        return {
            'student_id': student_data.get('student_id', 'Unknown'),
            'predicted_risk': risk_level,
            'confidence': float(max(probabilities)),
            'probabilities': {
                class_name: float(prob)
                for class_name, prob in zip(self.label_encoders['dropout_risk'].classes_, probabilities)
            },
            'risk_factors': risk_factors
        }
    
    def _identify_risk_factors(self, student_data: Dict) -> List[str]:
        """Identify key risk factors for a student"""
        factors = []
        
        if student_data.get('attendance_percentage', 100) < 75:
            factors.append('Low attendance')
        
        if student_data.get('average_marks', 100) < 60:
            factors.append('Declining marks')
        
        if student_data.get('absences_per_month', 0) > 6:
            factors.append('High absenteeism')
        
        if student_data.get('family_income_level') == 'Low':
            factors.append('Low family income')
        
        if student_data.get('parents_education_level') in ['No Education', 'Primary']:
            factors.append('Limited parental education')
        
        if student_data.get('distance_to_school_km', 0) > 10:
            factors.append('Long distance to school')
        
        if student_data.get('health_issues') == 'Yes':
            factors.append('Health concerns')
        
        return factors if factors else ['No major risk factors identified']
    
    def save_model(self, path: str = '/app/backend/trained_model.pkl'):
        """Save trained model and encoders"""
        joblib.dump({
            'model': self.model,
            'label_encoders': self.label_encoders,
            'feature_names': self.feature_names,
            'feature_importance': self.feature_importance,
            'accuracy': self.accuracy
        }, path)
    
    def load_model(self, path: str = '/app/backend/trained_model.pkl'):
        """Load trained model and encoders"""
        if os.path.exists(path):
            data = joblib.load(path)
            self.model = data['model']
            self.label_encoders = data['label_encoders']
            self.feature_names = data['feature_names']
            self.feature_importance = data['feature_importance']
            self.accuracy = data['accuracy']
            return True
        return False
