#!/usr/bin/env node

/**
 * Test script to verify API uses readings_raw table
 * This script checks if the ReadingRepository queries use readings_raw instead of readings
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Testing if API uses readings_raw table...\n');

// Files to check
const filesToCheck = [
  'src/infrastructure/repositories/ReadingRepository.js',
  'src/infrastructure/repositories/AlertRepository.js',
  'src/application/services/ReadingService.js',
  'src/application/services/SiloService.js'
];

let allTestsPassed = true;

filesToCheck.forEach(filePath => {
  console.log(`📁 Checking ${filePath}...`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for old 'readings' table references
    const oldTableMatches = content.match(/FROM readings[^_]/g);
    const newTableMatches = content.match(/FROM readings_raw/g);
    
    if (oldTableMatches && oldTableMatches.length > 0) {
      console.log(`❌ Found ${oldTableMatches.length} references to old 'readings' table:`);
      oldTableMatches.forEach(match => console.log(`   - ${match}`));
      allTestsPassed = false;
    }
    
    if (newTableMatches && newTableMatches.length > 0) {
      console.log(`✅ Found ${newTableMatches.length} references to 'readings_raw' table`);
    }
    
    console.log('');
    
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
    allTestsPassed = false;
  }
});

// Test API endpoints
console.log('🌐 Testing API endpoints...\n');

const endpoints = [
  '/health',
  '/readings/latest/by-silo-number?silo_number=1',
  '/readings/avg/latest/by-silo-number?silo_number=1',
  '/api/silos'
];

async function testApiEndpoints() {
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      if (response.ok) {
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
      } else {
        console.log(`❌ ${endpoint} - Status: ${response.status}`);
        allTestsPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
      allTestsPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('✅ API successfully updated to use readings_raw table');
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('⚠️  Please check the issues above');
  }
  
  console.log('='.repeat(50));
}

testApiEndpoints();
