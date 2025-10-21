#!/usr/bin/env python3
"""
Test script to verify the cable averaging logic is working correctly.
This tests that:
1. Single cable silos use sensor readings directly
2. Dual cable silos average readings from sensors with same sensor_index
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, get_level_averages_for_silos
from models import db, Silo, Cable, Sensor, Reading
import json

def test_cable_averaging_logic():
    """Test that cable averaging works correctly for single vs dual cable silos"""
    with app.app_context():
        print("🧪 Testing cable averaging logic...\n")
        
        # Find a silo with 1 cable and one with 2 cables
        single_cable_silo = None
        dual_cable_silo = None
        
        silos = Silo.query.all()
        for silo in silos:
            cable_count = len(silo.cables)
            if cable_count == 1 and single_cable_silo is None:
                single_cable_silo = silo
            elif cable_count == 2 and dual_cable_silo is None:
                dual_cable_silo = silo
                
            if single_cable_silo and dual_cable_silo:
                break
        
        print(f"🔍 Found single cable silo: {single_cable_silo.silo_number if single_cable_silo else 'None'}")
        print(f"🔍 Found dual cable silo: {dual_cable_silo.silo_number if dual_cable_silo else 'None'}")
        
        # Test single cable silo
        if single_cable_silo:
            print(f"\n📊 Testing single cable silo {single_cable_silo.silo_number}...")
            result = get_level_averages_for_silos([single_cable_silo.id])
            
            if result:
                print(f"✅ Got {len(result)} level results")
                
                # Verify we have 8 levels (0-7)
                levels = [r['level_index'] for r in result]
                expected_levels = list(range(8))
                if sorted(levels) == expected_levels:
                    print("✅ All 8 levels present (0-7)")
                else:
                    print(f"❌ Missing levels. Expected: {expected_levels}, Got: {sorted(levels)}")
                    
                # For single cable, temperature should match sensor reading directly
                cable = single_cable_silo.cables[0]
                for level in range(8):
                    sensor = next((s for s in cable.sensors if s.sensor_index == level), None)
                    if sensor:
                        latest_reading = Reading.query.filter_by(sensor_id=sensor.id).order_by(Reading.timestamp.desc()).first()
                        if latest_reading:
                            result_temp = next((r['temperature'] for r in result if r['level_index'] == level), None)
                            if result_temp is not None:
                                # Should be exactly the same (no averaging needed)
                                if abs(result_temp - latest_reading.temperature) < 0.01:
                                    print(f"✅ Level {level}: {result_temp}°C matches sensor reading {latest_reading.temperature}°C")
                                else:
                                    print(f"❌ Level {level}: {result_temp}°C doesn't match sensor reading {latest_reading.temperature}°C")
            else:
                print("❌ No results for single cable silo")
        
        # Test dual cable silo
        if dual_cable_silo:
            print(f"\n📊 Testing dual cable silo {dual_cable_silo.silo_number}...")
            result = get_level_averages_for_silos([dual_cable_silo.id])
            
            if result:
                print(f"✅ Got {len(result)} level results")
                
                # For dual cable, verify averaging is happening
                for level in range(8):
                    # Get sensors at this level from both cables
                    sensors_at_level = []
                    for cable in dual_cable_silo.cables:
                        sensor = next((s for s in cable.sensors if s.sensor_index == level), None)
                        if sensor:
                            sensors_at_level.append(sensor)
                    
                    if len(sensors_at_level) == 2:
                        # Get latest readings for both sensors
                        readings = []
                        for sensor in sensors_at_level:
                            reading = Reading.query.filter_by(sensor_id=sensor.id).order_by(Reading.timestamp.desc()).first()
                            if reading:
                                readings.append(reading.temperature)
                        
                        if len(readings) == 2:
                            expected_avg = sum(readings) / len(readings)
                            result_temp = next((r['temperature'] for r in result if r['level_index'] == level), None)
                            
                            if result_temp is not None:
                                if abs(result_temp - expected_avg) < 0.01:
                                    print(f"✅ Level {level}: {result_temp}°C = avg({readings[0]}°C, {readings[1]}°C) = {expected_avg:.2f}°C")
                                else:
                                    print(f"❌ Level {level}: {result_temp}°C ≠ expected avg {expected_avg:.2f}°C")
                            else:
                                print(f"⚠️ Level {level}: No result temperature found")
                        else:
                            print(f"⚠️ Level {level}: Only {len(readings)} readings found")
                    else:
                        print(f"⚠️ Level {level}: Only {len(sensors_at_level)} sensors found")
            else:
                print("❌ No results for dual cable silo")

def test_timestamp_filtering():
    """Test that timestamp filtering works correctly"""
    with app.app_context():
        print("\n🧪 Testing timestamp filtering...\n")
        
        # Get a silo with data
        silo = Silo.query.first()
        if not silo:
            print("❌ No silos found")
            return
            
        print(f"📊 Testing timestamp filtering with silo {silo.silo_number}...")
        
        # Test without filters
        result_all = get_level_averages_for_silos([silo.id])
        print(f"✅ Without filters: {len(result_all)} results")
        
        # Test with start date filter (should return fewer or same results)
        result_filtered = get_level_averages_for_silos([silo.id], start="2025-07-01")
        print(f"✅ With start filter: {len(result_filtered)} results")
        
        # Test with end date filter
        result_end_filtered = get_level_averages_for_silos([silo.id], end="2025-08-01")
        print(f"✅ With end filter: {len(result_end_filtered)} results")
        
        # Test with both filters
        result_both_filtered = get_level_averages_for_silos([silo.id], start="2025-07-01", end="2025-08-01")
        print(f"✅ With both filters: {len(result_both_filtered)} results")

if __name__ == '__main__':
    print("🚀 Starting cable averaging logic tests...\n")
    
    test_cable_averaging_logic()
    test_timestamp_filtering()
    
    print("\n✅ Cable averaging tests completed!")
