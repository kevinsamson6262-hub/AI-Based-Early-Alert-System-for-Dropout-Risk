import requests
import sys
import json
from datetime import datetime

class DropoutRiskAPITester:
    def __init__(self, base_url="https://edurisk-tracker.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'message' in response_data:
                        print(f"   Message: {response_data['message']}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text[:200]}")

            self.test_results.append({
                'name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'success': success,
                'response_size': len(response.text) if response.text else 0
            })

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout after {timeout}s")
            self.test_results.append({
                'name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': 'TIMEOUT',
                'success': False,
                'error': 'Request timeout'
            })
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                'name': name,
                'method': method,
                'endpoint': endpoint,
                'expected_status': expected_status,
                'actual_status': 'ERROR',
                'success': False,
                'error': str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_generate_dataset(self, n_samples=150):
        """Test dataset generation"""
        success, response = self.run_test(
            "Generate Dataset",
            "POST",
            "dataset/generate",
            200,
            data={"n_samples": n_samples},
            timeout=60
        )
        if success and 'total_records' in response:
            print(f"   Generated {response['total_records']} records")
        return success, response

    def test_train_model(self):
        """Test model training"""
        success, response = self.run_test(
            "Train ML Model",
            "POST",
            "model/train",
            200,
            timeout=120
        )
        if success and 'metrics' in response:
            accuracy = response['metrics'].get('accuracy', 0)
            print(f"   Model accuracy: {accuracy:.2%}")
        return success, response

    def test_batch_predictions(self):
        """Test batch predictions"""
        success, response = self.run_test(
            "Batch Predictions",
            "POST",
            "predict/batch",
            200,
            timeout=60
        )
        if success and 'total_predictions' in response:
            print(f"   Generated {response['total_predictions']} predictions")
        return success, response

    def test_get_students(self):
        """Test getting all students"""
        success, response = self.run_test(
            "Get Students",
            "GET",
            "students",
            200
        )
        if success and 'students' in response:
            print(f"   Found {len(response['students'])} students")
            print(f"   Has predictions: {response.get('has_predictions', False)}")
        return success, response

    def test_get_student_detail(self, student_id):
        """Test getting specific student details"""
        success, response = self.run_test(
            f"Get Student {student_id}",
            "GET",
            f"students/{student_id}",
            200
        )
        if success and 'student' in response:
            student = response['student']
            risk = student.get('predicted_risk') or student.get('dropout_risk')
            print(f"   Student risk level: {risk}")
            print(f"   Interventions: {len(response.get('interventions', []))}")
        return success, response

    def test_model_metrics(self):
        """Test getting model metrics"""
        success, response = self.run_test(
            "Model Metrics",
            "GET",
            "model/metrics",
            200
        )
        if success:
            accuracy = response.get('accuracy', 0)
            features = len(response.get('feature_importance', []))
            print(f"   Accuracy: {accuracy:.2%}")
            print(f"   Feature importance items: {features}")
        return success, response

    def test_send_alert(self, student_id):
        """Test sending alert"""
        alert_data = {
            "student_id": student_id,
            "risk_level": "High",
            "phone_number": "+91 9876543210",
            "message": f"Test alert for student {student_id}"
        }
        success, response = self.run_test(
            "Send Alert",
            "POST",
            "alerts/send",
            200,
            data=alert_data
        )
        if success and 'alert' in response:
            print(f"   Alert ID: {response['alert'].get('id', 'N/A')}")
        return success, response

    def test_get_alerts(self):
        """Test getting all alerts"""
        success, response = self.run_test(
            "Get Alerts",
            "GET",
            "alerts",
            200
        )
        if success and 'alerts' in response:
            print(f"   Total alerts: {len(response['alerts'])}")
        return success, response

    def test_create_intervention(self, student_id):
        """Test creating intervention"""
        intervention_data = {
            "student_id": student_id,
            "intervention_type": "Counselling",
            "notes": "Test intervention for automated testing"
        }
        success, response = self.run_test(
            "Create Intervention",
            "POST",
            "interventions",
            200,
            data=intervention_data
        )
        if success and 'intervention' in response:
            print(f"   Intervention ID: {response['intervention'].get('id', 'N/A')}")
        return success, response

    def test_get_interventions(self, student_id):
        """Test getting interventions for a student"""
        success, response = self.run_test(
            f"Get Interventions for {student_id}",
            "GET",
            f"interventions/{student_id}",
            200
        )
        if success and 'interventions' in response:
            print(f"   Interventions found: {len(response['interventions'])}")
        return success, response

    def test_get_stats(self):
        """Test getting overall statistics"""
        success, response = self.run_test(
            "Get Statistics",
            "GET",
            "stats",
            200
        )
        if success:
            total = response.get('total_students', 0)
            has_data = response.get('has_data', False)
            print(f"   Total students: {total}")
            print(f"   Has data: {has_data}")
            if 'risk_distribution' in response:
                risk_dist = response['risk_distribution']
                print(f"   Risk distribution: {risk_dist}")
        return success, response

def main():
    print("🚀 Starting AI Dropout Risk Predictor API Tests")
    print("=" * 60)
    
    tester = DropoutRiskAPITester()
    
    # Test sequence
    print("\n📋 Phase 1: Basic API Tests")
    tester.test_root_endpoint()
    
    print("\n📋 Phase 2: Data Generation & Model Training")
    dataset_success, _ = tester.test_generate_dataset(150)
    
    if dataset_success:
        model_success, _ = tester.test_train_model()
        
        if model_success:
            batch_success, _ = tester.test_batch_predictions()
            
            print("\n📋 Phase 3: Data Retrieval Tests")
            students_success, students_response = tester.test_get_students()
            tester.test_get_stats()
            tester.test_model_metrics()
            
            # Test with first student if available
            if students_success and students_response.get('students'):
                first_student = students_response['students'][0]
                student_id = first_student.get('student_id')
                
                if student_id:
                    print(f"\n📋 Phase 4: Student-Specific Tests (using {student_id})")
                    tester.test_get_student_detail(student_id)
                    tester.test_send_alert(student_id)
                    tester.test_create_intervention(student_id)
                    tester.test_get_interventions(student_id)
                    
                    print("\n📋 Phase 5: Final Verification")
                    tester.test_get_alerts()
        else:
            print("❌ Model training failed, skipping dependent tests")
    else:
        print("❌ Dataset generation failed, skipping all dependent tests")
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Print failed tests
    failed_tests = [t for t in tester.test_results if not t['success']]
    if failed_tests:
        print(f"\n❌ Failed Tests ({len(failed_tests)}):")
        for test in failed_tests:
            error_msg = test.get('error', f"Status {test['actual_status']}")
            print(f"   - {test['name']}: {error_msg}")
    
    # Save detailed results
    with open('/app/test_reports/backend_api_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'tests_run': tester.tests_run,
                'tests_passed': tester.tests_passed,
                'success_rate': tester.tests_passed/tester.tests_run*100 if tester.tests_run > 0 else 0
            },
            'test_results': tester.test_results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/test_reports/backend_api_results.json")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())