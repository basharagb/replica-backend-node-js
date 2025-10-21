#!/usr/bin/env python3
"""
Test script to analyze the behavior of temperature reading endpoints
regarding multiple readings per sensor.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Sensor, Reading
import json
from collections import defaultdict

def analyze_reading_endpoints():
    """Analyze how many readings each endpoint returns per sensor"""
    with app.app_context():
        # First, let's check how many readings exist for a specific sensor
        sensor = Sensor.query.first()
        if not sensor:
            print("❌ No sensors found in database")
            return

        sensor_id = sensor.id
        cable_id = sensor.cable_id
        silo_id = sensor.cable.silo_id

        reading_count = Reading.query.filter_by(sensor_id=sensor_id).count()
        print(f"📊 Sensor {sensor_id} has {reading_count} total readings in database")

        # Get the timestamps of all readings for this sensor
        readings = Reading.query.filter_by(sensor_id=sensor_id).order_by(Reading.timestamp.desc()).all()
        if len(readings) > 1:
            print(f"📅 Latest reading: {readings[0].timestamp} ({readings[0].temperature}°C)")
            print(f"📅 Oldest reading: {readings[-1].timestamp} ({readings[-1].temperature}°C)")
            print(f"📅 Total span: {len(readings)} readings")

        # Now test with the client
        with app.test_client() as client:
            # Test 1: /readings/by-sensor endpoint
            print(f"\n🧪 Testing /readings/by-sensor endpoint...")
            response = client.get(f'/readings/by-sensor?sensor_id={sensor_id}')

            if response.status_code == 200:
                data = response.get_json()
                print(f"📊 Returned {len(data)} readings for sensor {sensor_id}")

                if len(data) > 1:
                    print("📋 Sample readings (showing first 3):")
                    for i, reading in enumerate(data[:3]):
                        print(f"  {i+1}. {reading['timestamp']} - {reading['temperature']}°C")
                    print("✅ Multiple readings per sensor are returned")
                else:
                    print("⚠️ Only one reading returned (might be latest only)")

            # Test 2: /readings/by-cable endpoint
            print(f"\n🧪 Testing /readings/by-cable endpoint...")
            response = client.get(f'/readings/by-cable?cable_id={cable_id}')

            if response.status_code == 200:
                data = response.get_json()

                # Group by sensor to see readings per sensor
                sensor_readings = defaultdict(list)
                for reading in data:
                    # We need to identify sensor somehow - let's use level_index as proxy
                    key = f"level_{reading['level_index']}"
                    sensor_readings[key].append(reading)

                print(f"📊 Cable {cable_id} returned {len(data)} total readings")
                print(f"📊 Distributed across {len(sensor_readings)} sensors/levels")

                for level, readings in list(sensor_readings.items())[:3]:  # Show first 3 levels
                    print(f"  {level}: {len(readings)} readings")
                    if len(readings) > 1:
                        print(f"    Latest: {readings[0]['timestamp']} - {readings[0]['temperature']}°C")
                        print(f"    Next: {readings[1]['timestamp']} - {readings[1]['temperature']}°C")

            # Test 3: Compare with level averaging endpoint
            print(f"\n🧪 Testing /readings/by-silo/levels endpoint...")
            response = client.get(f'/readings/by-silo/levels?silo_id={silo_id}')

            if response.status_code == 200:
                data = response.get_json()
                print(f"📊 Silo {silo_id} level averages returned {len(data)} results")
                print("📋 Level averaging results (first 3):")
                for i, result in enumerate(data[:3]):
                    print(f"  Level {result['level_index']}: {result['temperature']}°C at {result['timestamp']}")

def test_timestamp_filtering_behavior():
    """Test how timestamp filtering affects the number of readings returned"""
    with app.app_context():
        sensor = Sensor.query.first()
        if not sensor:
            print("❌ No sensors found")
            return
        sensor_id = sensor.id

    with app.test_client() as client:
        print("\n🧪 Testing timestamp filtering behavior...\n")
        
        # Test without filters
        print("📊 Testing without timestamp filters...")
        response = client.get(f'/readings/by-sensor?sensor_id={sensor_id}')
        if response.status_code == 200:
            data_all = response.get_json()
            print(f"✅ No filters: {len(data_all)} readings")
        
        # Test with start filter
        print("📊 Testing with start timestamp filter...")
        response = client.get(f'/readings/by-sensor?sensor_id={sensor_id}&start=2025-07-15')
        if response.status_code == 200:
            data_start = response.get_json()
            print(f"✅ With start filter: {len(data_start)} readings")
        
        # Test with end filter
        print("📊 Testing with end timestamp filter...")
        response = client.get(f'/readings/by-sensor?sensor_id={sensor_id}&end=2025-07-20')
        if response.status_code == 200:
            data_end = response.get_json()
            print(f"✅ With end filter: {len(data_end)} readings")
        
        # Test with both filters (narrow range)
        print("📊 Testing with both start and end filters...")
        response = client.get(f'/readings/by-sensor?sensor_id={sensor_id}&start=2025-07-16&end=2025-07-17')
        if response.status_code == 200:
            data_both = response.get_json()
            print(f"✅ With both filters: {len(data_both)} readings")
        
        # Analyze the filtering effect
        if 'data_all' in locals() and 'data_start' in locals():
            print(f"\n📈 Filtering effect:")
            print(f"  No filter: {len(data_all)} readings")
            print(f"  Start filter: {len(data_start)} readings")
            if 'data_end' in locals():
                print(f"  End filter: {len(data_end)} readings")
            if 'data_both' in locals():
                print(f"  Both filters: {len(data_both)} readings")

def analyze_sorting_behavior():
    """Analyze the sorting behavior of readings"""
    with app.app_context():
        sensor = Sensor.query.first()
        if not sensor:
            print("❌ No sensors found")
            return
        sensor_id = sensor.id

    with app.test_client() as client:
        print("\n🧪 Analyzing sorting behavior...\n")
        
        response = client.get(f'/readings/by-sensor?sensor_id={sensor_id}')
        if response.status_code == 200:
            data = response.get_json()
            
            if len(data) > 1:
                print("📊 Timestamp sorting analysis:")
                print(f"  First reading: {data[0]['timestamp']}")
                print(f"  Second reading: {data[1]['timestamp']}")
                print(f"  Last reading: {data[-1]['timestamp']}")
                
                # Check if sorted by timestamp descending
                timestamps = [reading['timestamp'] for reading in data]
                is_desc_sorted = all(timestamps[i] >= timestamps[i+1] for i in range(len(timestamps)-1))
                is_asc_sorted = all(timestamps[i] <= timestamps[i+1] for i in range(len(timestamps)-1))
                
                if is_desc_sorted:
                    print("✅ Readings are sorted by timestamp DESCENDING (newest first)")
                elif is_asc_sorted:
                    print("✅ Readings are sorted by timestamp ASCENDING (oldest first)")
                else:
                    print("⚠️ Readings are not consistently sorted by timestamp")
            else:
                print("⚠️ Only one reading available, cannot analyze sorting")

if __name__ == '__main__':
    print("🚀 Starting reading behavior analysis...\n")
    
    analyze_reading_endpoints()
    test_timestamp_filtering_behavior()
    analyze_sorting_behavior()
    
    print("\n✅ Analysis completed!")
