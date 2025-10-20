/**
 * Simple API Tests for Industrial Silo Monitoring API
 * Using curl-based testing approach
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const BASE_URL = 'http://localhost:3000';

describe('🌾 Industrial Silo Monitoring API - Simple Tests', () => {
  
  jest.setTimeout(15000);

  test('Health endpoint should return OK status', async () => {
    try {
      const { stdout } = await execAsync(`curl -s ${BASE_URL}/health`);
      const response = JSON.parse(stdout);
      
      expect(response).toHaveProperty('status', 'OK');
      expect(response).toHaveProperty('timestamp');
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  });

  test('Silos endpoint should return silo data', async () => {
    try {
      const { stdout } = await execAsync(`curl -s ${BASE_URL}/api/silos`);
      const response = JSON.parse(stdout);
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Silos endpoint failed:', error);
      throw error;
    }
  });

  test('Latest readings endpoint should work', async () => {
    try {
      const { stdout } = await execAsync(`curl -s "${BASE_URL}/readings/latest/by-silo-number?silo_number=1"`);
      const response = JSON.parse(stdout);
      
      expect(Array.isArray(response)).toBe(true);
    } catch (error) {
      console.error('Latest readings endpoint failed:', error);
      throw error;
    }
  });

  test('Active alerts endpoint should work', async () => {
    try {
      const { stdout } = await execAsync(`curl -s ${BASE_URL}/alerts/active`);
      const response = JSON.parse(stdout);
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
    } catch (error) {
      console.error('Active alerts endpoint failed:', error);
      throw error;
    }
  });

  test('Login endpoint should work', async () => {
    try {
      const { stdout } = await execAsync(`curl -s -X POST ${BASE_URL}/login -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'`);
      const response = JSON.parse(stdout);
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('token');
    } catch (error) {
      console.error('Login endpoint failed:', error);
      throw error;
    }
  });
});
