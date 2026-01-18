import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Indian names for realistic dataset
FIRST_NAMES = [
    "Priya", "Anjali", "Sneha", "Pooja", "Kavya", "Divya", "Riya", "Neha", "Sakshi", "Aishwarya",
    "Meera", "Radha", "Sita", "Lakshmi", "Saraswati", "Parvati", "Durga", "Kali", "Gauri", "Uma",
    "Ananya", "Aaradhya", "Ishita", "Tanvi", "Shreya", "Simran", "Kiara", "Diya", "Ira", "Myra",
    "Radhika", "Madhuri", "Sanjana", "Vaishnavi", "Kritika", "Aditi", "Nandini", "Jyoti", "Deepika"
]

LAST_NAMES = [
    "Kumar", "Singh", "Sharma", "Patel", "Reddy", "Rao", "Iyer", "Nair", "Pillai", "Menon",
    "Gupta", "Verma", "Joshi", "Desai", "Shah", "Mehta", "Agarwal", "Jain", "Banerjee", "Chatterjee",
    "Das", "Dutta", "Ghosh", "Mukherjee", "Roy", "Sen", "Bose", "Khan", "Ali", "Ahmed"
]

SCHOOLS = [
    "Govt Girls High School - Tiruchirappalli",
    "Municipal Girls School - Madurai",
    "Panchayat Union School - Salem",
    "Government Higher Secondary School - Coimbatore",
    "Govt Girls School - Chennai (North)",
    "Zilla Parishad School - Villupuram",
    "Corporation School - Vellore",
    "Govt Model School - Thanjavur"
]

DISTRICTS = ["Tiruchirappalli", "Madurai", "Salem", "Coimbatore", "Chennai", "Villupuram", "Vellore", "Thanjavur"]

REGIONS = ["Rural", "Urban", "Semi-Urban"]

def generate_student_data(num_students=600):
    """Generate synthetic Indian education dataset"""
    students = []
    
    for i in range(num_students):
        student_id = f"STU{str(i+1).zfill(4)}"
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        grade = random.randint(6, 12)
        age = grade + random.randint(5, 7)
        school = random.choice(SCHOOLS)
        district = random.choice(DISTRICTS)
        region = random.choice(REGIONS)
        
        # Socio-economic factors
        family_income = random.choice(["Below 5000", "5000-10000", "10000-20000", "Above 20000"])
        parents_education = random.choice(["Illiterate", "Primary", "Secondary", "Higher Secondary", "Graduate"])
        family_size = random.randint(3, 8)
        
        # Create correlated risk factors
        base_risk = random.random()
        
        # Attendance (60-100%)
        if base_risk > 0.7:  # High risk
            attendance_rate = random.uniform(60, 75)
        elif base_risk > 0.4:  # Medium risk
            attendance_rate = random.uniform(75, 85)
        else:  # Low risk
            attendance_rate = random.uniform(85, 100)
        
        # Academic performance (0-100)
        if base_risk > 0.7:
            avg_marks = random.uniform(30, 50)
        elif base_risk > 0.4:
            avg_marks = random.uniform(50, 70)
        else:
            avg_marks = random.uniform(70, 95)
        
        # Distance from school (km)
        distance = random.choice([0.5, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20])
        if region == "Rural":
            distance = random.choice([5, 7, 10, 12, 15, 20])
        elif region == "Urban":
            distance = random.choice([0.5, 1, 2, 3, 4])
        
        # Health factors
        health_absences = random.randint(0, 15) if base_risk > 0.5 else random.randint(0, 5)
        
        # Cultural factors
        has_sibling_dropout = random.choice([True, False]) if base_risk > 0.6 else False
        child_labor = random.choice([True, False]) if base_risk > 0.7 else False
        early_marriage_pressure = random.choice([True, False]) if base_risk > 0.7 else False
        
        # Infrastructure
        has_transport = random.choice([True, False])
        has_scholarship = random.choice([True, False])
        mid_day_meal = random.choice([True, False])
        
        # Monsoon/seasonal impact
        monsoon_absences = random.randint(0, 10) if region == "Rural" else random.randint(0, 3)
        
        # Previous year performance
        prev_year_marks = avg_marks + random.uniform(-10, 10)
        prev_year_marks = max(25, min(100, prev_year_marks))
        
        # Trend detection
        marks_trend = "Declining" if prev_year_marks > avg_marks + 5 else "Improving" if avg_marks > prev_year_marks + 5 else "Stable"
        
        student = {
            "student_id": student_id,
            "name": name,
            "age": age,
            "grade": grade,
            "school": school,
            "district": district,
            "region": region,
            "attendance_rate": round(attendance_rate, 2),
            "avg_marks": round(avg_marks, 2),
            "prev_year_marks": round(prev_year_marks, 2),
            "marks_trend": marks_trend,
            "distance_km": distance,
            "family_income": family_income,
            "parents_education": parents_education,
            "family_size": family_size,
            "health_absences": health_absences,
            "monsoon_absences": monsoon_absences,
            "has_sibling_dropout": has_sibling_dropout,
            "child_labor": child_labor,
            "early_marriage_pressure": early_marriage_pressure,
            "has_transport": has_transport,
            "has_scholarship": has_scholarship,
            "mid_day_meal": mid_day_meal,
            "created_at": (datetime.now() - timedelta(days=random.randint(0, 365))).isoformat()
        }
        
        students.append(student)
    
    return pd.DataFrame(students)

if __name__ == "__main__":
    # Generate and save dataset
    df = generate_student_data(600)
    df.to_csv('/app/backend/students_dataset.csv', index=False)
    print(f"Generated {len(df)} student records")
    print(df.head())
    print("\nDataset Info:")
    print(df.info())
