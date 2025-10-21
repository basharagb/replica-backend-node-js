#!/usr/bin/env python3
"""
Analyze the database to understand the reading patterns and test endpoint behavior.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Sensor, Reading
from sqlalchemy import func
import json

def analyze_database_readings():
    """Analyze the reading patterns in the database"""
    with app.app_context():
        print("🔍 Analyzing database reading patterns...\n")
        
        # Total readings
        total_readings = Reading.query.count()
        total_sensors = Sensor.query.count()
        print(f"📊 Total readings: {total_readings}")
        print(f"📊 Total sensors: {total_sensors}")
        print(f"📊 Average readings per sensor: {total_readings/total_sensors:.2f}")
        
        # Check readings per sensor distribution
        print("\n📊 Readings per sensor distribution:")
        sensor_reading_counts = db.session.query(
            Reading.sensor_id,
            func.count(Reading.id).label('reading_count')
        ).group_by(Reading.sensor_id).all()
        
        reading_distribution = {}
        for sensor_id, count in sensor_reading_counts:
            reading_distribution.setdefault(count, 0)
            reading_distribution[count] += 1
        
        for reading_count, sensor_count in sorted(reading_distribution.items()):
            print(f"  {sensor_count} sensors have {reading_count} reading(s)")
        
        # Find sensors with multiple readings
        sensors_with_multiple = [
            (sensor_id, count) for sensor_id, count in sensor_reading_counts 
            if count > 1
        ]
        
        if sensors_with_multiple:
            print(f"\n📊 Found {len(sensors_with_multiple)} sensors with multiple readings:")
            for sensor_id, count in sensors_with_multiple[:5]:  # Show first 5
                print(f"  Sensor {sensor_id}: {count} readings")
        else:
            print("\n⚠️ No sensors found with multiple readings")
            print("   This means each sensor has exactly 1 reading (latest snapshot)")
        
        # Check timestamp distribution
        print("\n📊 Timestamp analysis:")
        timestamps = db.session.query(Reading.timestamp).distinct().all()
        unique_timestamps = len(timestamps)
        print(f"  Unique timestamps: {unique_timestamps}")
        
        if unique_timestamps <= 10:
            print("  All timestamps:")
            for ts in sorted([t[0] for t in timestamps]):
                reading_count = Reading.query.filter_by(timestamp=ts).count()
                print(f"    {ts}: {reading_count} readings")

def test_endpoint_with_multiple_sensors():
    """Test endpoints with multiple sensors to understand the behavior"""
    with app.app_context():
        # Get multiple sensor IDs
        sensors = Sensor.query.limit(5).all()
        sensor_ids = [s.id for s in sensors]
        
        print(f"\n🧪 Testing endpoints with multiple sensors: {sensor_ids}")
        
        with app.test_client() as client:
            # Test by-sensor with multiple IDs
            sensor_id_params = '&'.join([f'sensor_id={sid}' for sid in sensor_ids])
            response = client.get(f'/readings/by-sensor?{sensor_id_params}')
            
            if response.status_code == 200:
                data = response.get_json()
                print(f"📊 /readings/by-sensor with {len(sensor_ids)} sensors returned {len(data)} readings")
                
                # Group by sensor to see distribution
                sensor_groups = {}
                for reading in data:
                    # We need to identify which sensor this reading belongs to
                    # Since we don't have sensor_id in the response, we'll use level_index + cable_number as proxy
                    key = f"cable_{reading['cable_number']}_level_{reading['level_index']}"
                    sensor_groups.setdefault(key, []).append(reading)
                
                print(f"📊 Readings distributed across {len(sensor_groups)} sensor combinations")
                for key, readings in list(sensor_groups.items())[:3]:
                    print(f"  {key}: {len(readings)} reading(s)")
                    if len(readings) > 1:
                        print(f"    Timestamps: {[r['timestamp'] for r in readings]}")

def demonstrate_sql_query_behavior():
    """Show what the actual SQL queries are doing"""
    with app.app_context():
        print("\n🔍 Demonstrating SQL query behavior...\n")
        
        # Simulate the query from /readings/by-sensor endpoint
        sensor_ids = [1, 2, 3]
        print(f"📊 Simulating query for sensors: {sensor_ids}")
        
        # This is what the endpoint does:
        query = Reading.query.filter(Reading.sensor_id.in_(sensor_ids))
        readings = query.order_by(Reading.sensor_id, Reading.timestamp.desc()).all()
        
        print(f"📊 Query returned {len(readings)} readings")
        
        if readings:
            print("📋 Sample results:")
            for i, reading in enumerate(readings[:10]):  # Show first 10
                print(f"  {i+1}. Sensor {reading.sensor_id}: {reading.temperature}°C at {reading.timestamp}")
        
        # Show the difference between .all() and .first()
        print(f"\n🔍 Comparison: .all() vs .first()")
        all_readings = query.count()
        first_reading = query.first()
        
        print(f"  query.all() would return: {all_readings} readings")
        print(f"  query.first() would return: 1 reading ({first_reading.temperature}°C at {first_reading.timestamp})")
        
        # Show what level averaging does differently
        print(f"\n🔍 Level averaging approach:")
        for sensor_id in sensor_ids[:2]:  # Just show 2 for brevity
            latest = Reading.query.filter_by(sensor_id=sensor_id).order_by(Reading.timestamp.desc()).first()
            if latest:
                print(f"  Sensor {sensor_id} latest: {latest.temperature}°C at {latest.timestamp}")

if __name__ == '__main__':
    print("🚀 Starting database reading analysis...\n")
    
    analyze_database_readings()
    test_endpoint_with_multiple_sensors()
    demonstrate_sql_query_behavior()
    
    print("\n✅ Analysis completed!")
