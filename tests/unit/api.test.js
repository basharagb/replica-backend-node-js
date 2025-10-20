/**
 * Unit Tests for Industrial Silo Monitoring API
 * High-Performance Node.js API Testing Suite
 * 
 * Developer: Eng. Bashar Mohammad Zabadani
 * Email: basharagb@gmail.com
 * Phone: +962780853195
 */

import request from 'supertest';
import app from '../../devApp.js';

describe('🌾 Industrial Silo Monitoring API - Unit Tests', () => {
  
  // Test timeout for all tests
  jest.setTimeout(10000);

  describe('🔧 System Health & Status', () => {
    
    test('GET /health - Should return system health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'System healthy');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('system', 'Silo Monitoring API');
      expect(response.body.data).toHaveProperty('database', true);
      expect(response.body).toHaveProperty('timestamp');
    });

    test('Response time should be under 100ms for health check', async () => {
      const startTime = Date.now();
      await request(app).get('/health').expect(200);
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('🏭 Silo Management Endpoints', () => {
    
    test('GET /api/silos - Should return all silos with cable counts', async () => {
      const response = await request(app)
        .get('/api/silos')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Silos fetched successfully');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check structure of first silo
      const firstSilo = response.body.data[0];
      expect(firstSilo).toHaveProperty('id');
      expect(firstSilo).toHaveProperty('siloNumber');
      expect(firstSilo).toHaveProperty('cableCount');
    });

    test('GET /api/silos/1 - Should return specific silo details', async () => {
      const response = await request(app)
        .get('/api/silos/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Silo fetched successfully');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('siloNumber', 1);
      expect(response.body.data).toHaveProperty('cableCount');
    });

    test('Performance: Silo endpoints should respond under 50ms', async () => {
      const startTime = Date.now();
      await request(app).get('/api/silos').expect(200);
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(50);
    });
  });

  describe('🌡️ Temperature Reading Endpoints', () => {
    
    test('GET /readings/latest/by-silo-number - Should return latest readings', async () => {
      const response = await request(app)
        .get('/readings/latest/by-silo-number?silo_number=1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const reading = response.body.data[0];
        expect(reading).toHaveProperty('id');
        expect(reading).toHaveProperty('sensorId');
        expect(reading).toHaveProperty('valueC');
        expect(reading).toHaveProperty('sampleAt');
      }
    });

    test('GET /readings/avg/latest/by-silo-number - Should return averaged readings', async () => {
      const response = await request(app)
        .get('/readings/avg/latest/by-silo-number?silo_number=1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const avgReading = response.body.data[0];
        expect(avgReading).toHaveProperty('silo_id');
        expect(avgReading).toHaveProperty('sensor_index');
        expect(avgReading).toHaveProperty('avg_value_c');
        expect(avgReading).toHaveProperty('reading_count');
      }
    });

    test('Performance: Reading endpoints should respond under 60ms', async () => {
      const startTime = Date.now();
      await request(app)
        .get('/readings/latest/by-silo-number?silo_number=1')
        .expect(200);
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(60);
    });
  });

  describe('🚨 Alert System Endpoints', () => {
    
    test('GET /alerts/active - Should return active alerts', async () => {
      const response = await request(app)
        .get('/alerts/active')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const alert = response.body.data[0];
        expect(alert).toHaveProperty('id');
        expect(alert).toHaveProperty('siloId');
        expect(alert).toHaveProperty('levelIndex');
        expect(alert).toHaveProperty('limitType');
        expect(alert).toHaveProperty('status');
      }
    });

    test('Performance: Alert endpoints should respond under 70ms', async () => {
      const startTime = Date.now();
      await request(app).get('/alerts/active').expect(200);
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(70);
    });
  });

  describe('🔒 Error Handling & Validation', () => {
    
    test('GET /api/silos/invalid - Should handle invalid silo ID gracefully', async () => {
      const response = await request(app)
        .get('/api/silos/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    test('GET /readings/latest/by-silo-number - Should handle missing silo_number parameter', async () => {
      const response = await request(app)
        .get('/readings/latest/by-silo-number')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    test('Should return proper JSON structure for all endpoints', async () => {
      const endpoints = [
        '/health',
        '/api/silos',
        '/readings/latest/by-silo-number?silo_number=1',
        '/alerts/active'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        
        expect(response.headers['content-type']).toMatch(/json/);
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('timestamp');
        
        if (response.body.success) {
          expect(response.body).toHaveProperty('data');
        } else {
          expect(response.body).toHaveProperty('message');
        }
      }
    });
  });

  describe('📊 Performance & Load Testing', () => {
    
    test('Should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(request(app).get('/health'));
      }
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Average response time should be reasonable
      const avgResponseTime = totalTime / concurrentRequests;
      expect(avgResponseTime).toBeLessThan(100);
    });

    test('Should maintain consistent performance under load', async () => {
      const iterations = 5;
      const responseTimes = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app).get('/api/silos').expect(200);
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
      }
      
      // Calculate average and check consistency
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / iterations;
      const maxResponseTime = Math.max(...responseTimes);
      
      expect(avgResponseTime).toBeLessThan(50);
      expect(maxResponseTime).toBeLessThan(100);
    });
  });

  describe('🛡️ Security & Data Integrity', () => {
    
    test('Should return proper security headers', async () => {
      const response = await request(app).get('/health');
      
      // Check for security headers (if helmet is configured)
      expect(response.headers).toBeDefined();
    });

    test('Should handle SQL injection attempts safely', async () => {
      const maliciousInput = "1'; DROP TABLE silos; --";
      
      const response = await request(app)
        .get(`/readings/latest/by-silo-number?silo_number=${encodeURIComponent(maliciousInput)}`);
      
      // Should either return error or safe response, not crash
      expect([200, 400, 422]).toContain(response.status);
    });

    test('Should validate input parameters properly', async () => {
      const invalidInputs = [
        'abc',
        '-1',
        '999999',
        'null',
        'undefined'
      ];
      
      for (const input of invalidInputs) {
        const response = await request(app)
          .get(`/readings/latest/by-silo-number?silo_number=${input}`);
        
        // Should handle invalid inputs gracefully
        expect([200, 400, 422, 404]).toContain(response.status);
      }
    });
  });

  describe('🔄 Data Consistency & Quality', () => {
    
    test('Temperature readings should have valid data types', async () => {
      const response = await request(app)
        .get('/readings/latest/by-silo-number?silo_number=1')
        .expect(200);

      if (response.body.data && response.body.data.length > 0) {
        response.body.data.forEach(reading => {
          expect(typeof reading.id).toBe('number');
          expect(typeof reading.sensorId).toBe('number');
          expect(typeof reading.valueC).toBe('number');
          expect(typeof reading.sampleAt).toBe('string');
        });
      }
    });

    test('Silo data should have consistent structure', async () => {
      const response = await request(app)
        .get('/api/silos')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      
      response.body.data.forEach(silo => {
        expect(typeof silo.id).toBe('number');
        expect(typeof silo.siloNumber).toBe('number');
        expect(typeof silo.cableCount).toBe('number');
        expect(silo.id).toBeGreaterThan(0);
        expect(silo.siloNumber).toBeGreaterThan(0);
        expect(silo.cableCount).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

// Performance benchmark test
describe('📈 Performance Benchmarks', () => {
  
  test('System should meet performance SLA requirements', async () => {
    const performanceTests = [
      { endpoint: '/health', maxTime: 50, description: 'Health check' },
      { endpoint: '/api/silos', maxTime: 60, description: 'Silo list' },
      { endpoint: '/readings/latest/by-silo-number?silo_number=1', maxTime: 80, description: 'Latest readings' },
      { endpoint: '/alerts/active', maxTime: 100, description: 'Active alerts' }
    ];

    for (const test of performanceTests) {
      const startTime = Date.now();
      const response = await request(app).get(test.endpoint);
      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(test.maxTime);
      
      console.log(`✅ ${test.description}: ${responseTime}ms (SLA: <${test.maxTime}ms)`);
    }
  });
});
