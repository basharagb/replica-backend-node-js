#!/usr/bin/env python3
"""
Test script to verify endpoints work with multiple silo IDs and parameters.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
import json

def test_multiple_silo_ids():
    """Test endpoints with multiple silo IDs"""
    with app.test_client() as client:
        print("🧪 Testing multiple silo IDs...\n")
        
        # Test by-silo/levels with multiple IDs
        print("📊 Testing /readings/by-silo/levels with multiple silo_id parameters...")
        response = client.get('/readings/by-silo/levels?silo_id=1&silo_id=2&silo_id=3')
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"✅ Response status: {response.status_code}")
            print(f"📊 Total results: {len(data)}")
            
            # Group by silo number to verify we got data for all requested silos
            silo_groups = {}
            for item in data:
                silo_num = item['silo_number']
                silo_groups.setdefault(silo_num, []).append(item)
            
            print(f"📊 Data for silos: {sorted(silo_groups.keys())}")
            for silo_num, items in silo_groups.items():
                levels = [item['level_index'] for item in items]
                print(f"  Silo {silo_num}: {len(items)} levels ({sorted(levels)})")
                
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(response.get_data(as_text=True))
        
        # Test by-group/levels
        print("\n📊 Testing /readings/by-group/levels...")
        response = client.get('/readings/by-group/levels?group_id=1')
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"✅ Response status: {response.status_code}")
            print(f"📊 Total results: {len(data)}")
            
            # Show sample of different silos in the group
            silo_numbers = list(set(item['silo_number'] for item in data))
            print(f"📊 Silos in group 1: {sorted(silo_numbers)[:10]}...")  # Show first 10
            
        else:
            print(f"❌ Group request failed with status {response.status_code}")

def test_timestamp_parameters():
    """Test endpoints with timestamp parameters"""
    with app.test_client() as client:
        print("\n🧪 Testing timestamp parameters...\n")
        
        # Test with start parameter
        print("📊 Testing with start timestamp...")
        response = client.get('/readings/by-silo/levels?silo_id=1&start=2025-07-01')
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"✅ With start filter: {len(data)} results")
        else:
            print(f"❌ Start filter failed: {response.status_code}")
        
        # Test with end parameter
        print("📊 Testing with end timestamp...")
        response = client.get('/readings/by-silo/levels?silo_id=1&end=2025-08-01')
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"✅ With end filter: {len(data)} results")
        else:
            print(f"❌ End filter failed: {response.status_code}")
        
        # Test with both parameters
        print("📊 Testing with both start and end timestamps...")
        response = client.get('/readings/by-silo/levels?silo_id=1&start=2025-07-01&end=2025-08-01')
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"✅ With both filters: {len(data)} results")
            
            if data:
                print("📋 Sample result with timestamp filters:")
                print(json.dumps(data[0], indent=2))
        else:
            print(f"❌ Both filters failed: {response.status_code}")

def test_edge_cases():
    """Test edge cases and error handling"""
    with app.test_client() as client:
        print("\n🧪 Testing edge cases...\n")
        
        # Test with non-existent silo ID
        print("📊 Testing with non-existent silo ID...")
        response = client.get('/readings/by-silo/levels?silo_id=99999')
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"✅ Non-existent silo handled gracefully: {len(data)} results")
        else:
            print(f"❌ Non-existent silo failed: {response.status_code}")
        
        # Test with no parameters
        print("📊 Testing with no silo_id parameters...")
        response = client.get('/readings/by-silo/levels')
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"✅ No parameters handled gracefully: {len(data)} results")
        else:
            print(f"❌ No parameters failed: {response.status_code}")
        
        # Test with invalid timestamp format
        print("📊 Testing with invalid timestamp format...")
        response = client.get('/readings/by-silo/levels?silo_id=1&start=invalid-date')
        
        print(f"📊 Invalid timestamp response: {response.status_code}")
        # This might fail or succeed depending on how SQLAlchemy handles it

if __name__ == '__main__':
    print("🚀 Starting multiple silo and parameter tests...\n")
    
    test_multiple_silo_ids()
    test_timestamp_parameters()
    test_edge_cases()
    
    print("\n✅ All tests completed!")
