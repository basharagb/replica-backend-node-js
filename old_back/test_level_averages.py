#!/usr/bin/env python3
"""
Test script for the refactored level averaging endpoints.
This script tests the new get_level_averages_for_silos function and endpoints.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, get_level_averages_for_silos
from models import db, Silo, Cable, Sensor, Reading, Product, SiloProductAssignment, StatusColor
from datetime import datetime
import json

def test_level_averages_function():
    """Test the get_level_averages_for_silos helper function"""
    with app.app_context():
        print("🧪 Testing get_level_averages_for_silos function...")
        
        # Test with a sample silo ID (assuming silo ID 1 exists)
        try:
            result = get_level_averages_for_silos([1])
            print(f"✅ Function executed successfully")
            print(f"📊 Result count: {len(result)}")
            
            if result:
                print("📋 Sample result:")
                print(json.dumps(result[0], indent=2))
                
                # Verify required fields are present
                required_fields = ['silo_group', 'silo_number', 'level_index', 'temperature', 'color', 'timestamp']
                sample = result[0]
                missing_fields = [field for field in required_fields if field not in sample]
                
                if missing_fields:
                    print(f"❌ Missing required fields: {missing_fields}")
                else:
                    print("✅ All required fields present")
                    
                # Check field order
                actual_order = list(sample.keys())
                expected_order = ['silo_group', 'silo_number', 'level_index', 'temperature', 'color', 'timestamp']
                if actual_order == expected_order:
                    print("✅ Field order is correct")
                else:
                    print(f"❌ Field order mismatch. Expected: {expected_order}, Got: {actual_order}")
            else:
                print("⚠️ No results returned (this might be expected if no data exists)")
                
        except Exception as e:
            print(f"❌ Function failed with error: {e}")
            import traceback
            traceback.print_exc()

def test_endpoints():
    """Test the refactored endpoints"""
    with app.test_client() as client:
        print("\n🧪 Testing /readings/by-silo/levels endpoint...")
        
        try:
            response = client.get('/readings/by-silo/levels?silo_id=1')
            print(f"📡 Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.get_json()
                print(f"📊 Response count: {len(data) if data else 0}")
                
                if data:
                    print("📋 Sample response:")
                    print(json.dumps(data[0], indent=2))
                    print("✅ Endpoint working correctly")
                else:
                    print("⚠️ Empty response (might be expected if no data)")
            else:
                print(f"❌ Endpoint failed with status {response.status_code}")
                print(f"Response: {response.get_data(as_text=True)}")
                
        except Exception as e:
            print(f"❌ Endpoint test failed: {e}")
            import traceback
            traceback.print_exc()

        print("\n🧪 Testing /readings/by-group/levels endpoint...")
        
        try:
            response = client.get('/readings/by-group/levels?group_id=1')
            print(f"📡 Response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.get_json()
                print(f"📊 Response count: {len(data) if data else 0}")
                print("✅ Group levels endpoint working correctly")
            else:
                print(f"❌ Group levels endpoint failed with status {response.status_code}")
                
        except Exception as e:
            print(f"❌ Group levels endpoint test failed: {e}")

def check_database_structure():
    """Check if the database has the expected structure"""
    with app.app_context():
        print("\n🔍 Checking database structure...")
        
        try:
            # Check if we have silos
            silo_count = Silo.query.count()
            print(f"📊 Total silos: {silo_count}")
            
            if silo_count > 0:
                # Check first silo's cable structure
                first_silo = Silo.query.first()
                cable_count = len(first_silo.cables)
                print(f"📊 Cables in first silo: {cable_count}")
                
                if cable_count > 0:
                    first_cable = first_silo.cables[0]
                    sensor_count = len(first_cable.sensors)
                    print(f"📊 Sensors in first cable: {sensor_count}")
                    
                    if sensor_count > 0:
                        # Check sensor indices
                        sensor_indices = [s.sensor_index for s in first_cable.sensors]
                        print(f"📊 Sensor indices: {sorted(sensor_indices)}")
                        
                        # Check if we have readings
                        reading_count = Reading.query.count()
                        print(f"📊 Total readings: {reading_count}")
                        
                        if reading_count > 0:
                            print("✅ Database structure looks good for testing")
                        else:
                            print("⚠️ No readings found - level averages will be empty")
                    else:
                        print("⚠️ No sensors found")
                else:
                    print("⚠️ No cables found")
            else:
                print("⚠️ No silos found - cannot test level averages")
                
        except Exception as e:
            print(f"❌ Database check failed: {e}")

if __name__ == '__main__':
    print("🚀 Starting level averages refactoring tests...\n")
    
    check_database_structure()
    test_level_averages_function()
    test_endpoints()
    
    print("\n✅ Test completed!")
