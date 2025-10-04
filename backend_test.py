#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class SonyMusicPMOTester:
    def __init__(self, base_url="https://sme-lai-dashboard.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def run_test(self, name, method, endpoint, expected_status=200, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = None
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    response_data = response.text
                    print(f"   Response: {response_data[:200]}...")
            else:
                print(f"   Expected: {expected_status}, Got: {response.status_code}")
                print(f"   Error: {response.text[:200]}...")

            self.log_test(name, success, 
                         f"Expected {expected_status}, got {response.status_code}" if not success else "",
                         response_data)
            
            return success, response_data

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   ❌ Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, None

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "")

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        success, data = self.run_test("Dashboard Stats", "GET", "dashboard/stats")
        
        if success and data:
            # Validate required fields
            required_fields = ['total_projects', 'active_projects', 'completed_projects', 
                             'total_budget', 'budget_spent', 'team_utilization', 
                             'on_track_projects', 'delayed_projects']
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                self.log_test("Dashboard Stats - Field Validation", False, 
                            f"Missing fields: {missing_fields}")
            else:
                self.log_test("Dashboard Stats - Field Validation", True)
                
                # Validate data types and ranges
                if isinstance(data.get('team_utilization'), (int, float)) and 0 <= data['team_utilization'] <= 100:
                    self.log_test("Dashboard Stats - Team Utilization Range", True)
                else:
                    self.log_test("Dashboard Stats - Team Utilization Range", False, 
                                f"Invalid team_utilization: {data.get('team_utilization')}")
        
        return success, data

    def test_projects_endpoint(self):
        """Test projects endpoint"""
        success, data = self.run_test("Get All Projects", "GET", "projects")
        
        if success and data:
            # Check if we have the priority projects
            project_names = [p.get('name', '') for p in data]
            priority_projects = ['Airplane', 'SMERA', 'SQL AI Agent']
            
            found_priority = []
            for priority in priority_projects:
                for name in project_names:
                    if priority in name:
                        found_priority.append(priority)
                        break
            
            if len(found_priority) >= 2:  # At least 2 out of 3 priority projects
                self.log_test("Priority Projects Present", True, 
                            f"Found: {found_priority}")
            else:
                self.log_test("Priority Projects Present", False, 
                            f"Only found: {found_priority}, expected: {priority_projects}")
            
            # Validate project structure
            if data and len(data) > 0:
                project = data[0]
                required_fields = ['id', 'name', 'status', 'priority', 'manager', 
                                 'budget_allocated', 'budget_spent', 'progress']
                missing_fields = [field for field in required_fields if field not in project]
                
                if missing_fields:
                    self.log_test("Project Structure Validation", False, 
                                f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Project Structure Validation", True)
        
        return success, data

    def test_projects_filtering(self):
        """Test project filtering"""
        # Test status filter
        success1, _ = self.run_test("Projects Filter - Status", "GET", "projects", 
                                   params={"status": "in_progress"})
        
        # Test manager filter
        success2, _ = self.run_test("Projects Filter - Manager", "GET", "projects", 
                                   params={"manager": "Pablo Duarte"})
        
        # Test search filter
        success3, _ = self.run_test("Projects Filter - Search", "GET", "projects", 
                                   params={"search": "Airplane"})
        
        return success1 and success2 and success3

    def test_managers_endpoint(self):
        """Test managers endpoint"""
        success, data = self.run_test("Get Managers", "GET", "managers")
        
        if success and data:
            expected_managers = ["Pablo Duarte", "Diana Peluha", "Andre Luiz", "Nicolas Calderon"]
            found_managers = [m for m in expected_managers if m in data]
            
            if len(found_managers) >= 3:  # At least 3 out of 4 managers
                self.log_test("Expected Managers Present", True, 
                            f"Found: {found_managers}")
            else:
                self.log_test("Expected Managers Present", False, 
                            f"Only found: {found_managers}, expected: {expected_managers}")
        
        return success, data

    def test_streaming_platforms(self):
        """Test streaming platforms endpoint"""
        success, data = self.run_test("Get Streaming Platforms", "GET", "streaming-platforms")
        
        if success and data:
            expected_platforms = ["Spotify", "Apple Music", "YouTube Music", "Amazon Music"]
            platform_names = [p.get('name', '') for p in data if isinstance(p, dict)]
            found_platforms = [p for p in expected_platforms if p in platform_names]
            
            if len(found_platforms) >= 3:  # At least 3 out of 4 platforms
                self.log_test("Expected Streaming Platforms Present", True, 
                            f"Found: {found_platforms}")
            else:
                self.log_test("Expected Streaming Platforms Present", False, 
                            f"Only found: {found_platforms}, expected: {expected_platforms}")
            
            # Validate platform structure
            if data and len(data) > 0 and isinstance(data[0], dict):
                platform = data[0]
                required_fields = ['name', 'streams', 'growth']
                missing_fields = [field for field in required_fields if field not in platform]
                
                if missing_fields:
                    self.log_test("Streaming Platform Structure", False, 
                                f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Streaming Platform Structure", True)
        
        return success, data

    def test_project_crud_operations(self):
        """Test project CRUD operations"""
        # Test creating a project
        test_project = {
            "name": "Test Project - API Testing",
            "description": "Test project created by automated testing",
            "status": "planning",
            "priority": "medium",
            "type": "digital",
            "manager": "Pablo Duarte",
            "budget_allocated": 100000.0,
            "budget_spent": 0.0,
            "start_date": "2024-08-01",
            "end_date": "2024-12-31",
            "progress": 0,
            "milestones": [],
            "team_members": ["Test Team"],
            "streaming_platforms": []
        }
        
        success_create, created_project = self.run_test("Create Project", "POST", "projects", 
                                                       expected_status=201, data=test_project)
        
        if success_create and created_project:
            project_id = created_project.get('id')
            
            if project_id:
                # Test getting the specific project
                success_get, _ = self.run_test("Get Specific Project", "GET", f"projects/{project_id}")
                
                # Test updating the project
                updated_data = test_project.copy()
                updated_data['progress'] = 25
                success_update, _ = self.run_test("Update Project", "PUT", f"projects/{project_id}", 
                                                data=updated_data)
                
                # Test deleting the project
                success_delete, _ = self.run_test("Delete Project", "DELETE", f"projects/{project_id}", 
                                                expected_status=200)
                
                return success_create and success_get and success_update and success_delete
        
        return success_create

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Sony Music PMO Dashboard Backend Tests")
        print("=" * 60)
        
        # Basic connectivity tests
        self.test_root_endpoint()
        
        # Core functionality tests
        self.test_dashboard_stats()
        self.test_projects_endpoint()
        self.test_projects_filtering()
        self.test_managers_endpoint()
        self.test_streaming_platforms()
        
        # CRUD operations test
        self.test_project_crud_operations()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"✅ Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            failed_tests = [r for r in self.test_results if not r['success']]
            print("\nFailed Tests:")
            for test in failed_tests:
                print(f"  - {test['test_name']}: {test['details']}")
            return False

def main():
    """Main test execution"""
    tester = SonyMusicPMOTester()
    success = tester.run_all_tests()
    
    # Save test results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"/app/test_reports/backend_test_results_{timestamp}.json"
    
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": timestamp,
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
            "test_results": tester.test_results
        }, f, indent=2)
    
    print(f"\n📄 Test results saved to: {results_file}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())