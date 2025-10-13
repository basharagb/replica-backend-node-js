// ==============================
// 🚀 Performance Benchmark Script
// ==============================
import http from 'http';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:3000';
const CONCURRENT_REQUESTS = 50;
const TOTAL_REQUESTS = 1000;

// ==============================
// 📊 Benchmark Configuration
// ==============================
const endpoints = [
  { path: '/health', name: 'Health Check' },
  { path: '/api/silos', name: 'Get All Silos' },
  { path: '/api/silos/1', name: 'Get Single Silo' },
  { path: '/readings/latest/by-silo-id?silo_id=1&silo_id=2', name: 'Latest Readings' },
  { path: '/alerts/active', name: 'Active Alerts' }
];

// ==============================
// 🎯 HTTP Request Helper
// ==============================
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        resolve({
          statusCode: res.statusCode,
          responseTime,
          contentLength: data.length,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (err) => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      reject({
        error: err.message,
        responseTime
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject({ error: 'Timeout', responseTime: 10000 });
    });
  });
}

// ==============================
// 📈 Benchmark Runner
// ==============================
async function runBenchmark(endpoint) {
  console.log(`\n🚀 Benchmarking: ${endpoint.name} (${endpoint.path})`);
  console.log(`📊 Running ${TOTAL_REQUESTS} requests with ${CONCURRENT_REQUESTS} concurrent connections...`);
  
  const results = [];
  const errors = [];
  const startTime = performance.now();
  
  // Run requests in batches for concurrency control
  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_REQUESTS) {
    const batch = [];
    const batchSize = Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - i);
    
    for (let j = 0; j < batchSize; j++) {
      batch.push(
        makeRequest(endpoint.path)
          .then(result => results.push(result))
          .catch(error => errors.push(error))
      );
    }
    
    await Promise.all(batch);
    
    // Progress indicator
    const completed = i + batchSize;
    const progress = Math.round((completed / TOTAL_REQUESTS) * 100);
    process.stdout.write(`\r⏳ Progress: ${progress}% (${completed}/${TOTAL_REQUESTS})`);
  }
  
  const totalTime = performance.now() - startTime;
  
  // Calculate statistics
  const successfulRequests = results.filter(r => r.success);
  const responseTimes = successfulRequests.map(r => r.responseTime);
  
  const stats = {
    totalRequests: TOTAL_REQUESTS,
    successfulRequests: successfulRequests.length,
    failedRequests: errors.length,
    successRate: (successfulRequests.length / TOTAL_REQUESTS) * 100,
    totalTime: totalTime,
    requestsPerSecond: TOTAL_REQUESTS / (totalTime / 1000),
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    p50: percentile(responseTimes, 0.5),
    p95: percentile(responseTimes, 0.95),
    p99: percentile(responseTimes, 0.99)
  };
  
  return stats;
}

// ==============================
// 📊 Calculate Percentile
// ==============================
function percentile(arr, p) {
  if (arr.length === 0) return 0;
  
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = (p * (sorted.length - 1));
  
  if (Math.floor(index) === index) {
    return sorted[index];
  } else {
    const lower = sorted[Math.floor(index)];
    const upper = sorted[Math.ceil(index)];
    return lower + (upper - lower) * (index - Math.floor(index));
  }
}

// ==============================
// 📋 Display Results
// ==============================
function displayResults(endpoint, stats) {
  console.log(`\n\n📊 Results for ${endpoint.name}:`);
  console.log('━'.repeat(60));
  console.log(`✅ Successful Requests: ${stats.successfulRequests}/${stats.totalRequests} (${stats.successRate.toFixed(2)}%)`);
  console.log(`❌ Failed Requests: ${stats.failedRequests}`);
  console.log(`⚡ Requests/Second: ${stats.requestsPerSecond.toFixed(2)}`);
  console.log(`⏱️  Total Time: ${(stats.totalTime / 1000).toFixed(2)}s`);
  console.log('\n📈 Response Times (ms):');
  console.log(`   Average: ${stats.averageResponseTime.toFixed(2)}ms`);
  console.log(`   Minimum: ${stats.minResponseTime.toFixed(2)}ms`);
  console.log(`   Maximum: ${stats.maxResponseTime.toFixed(2)}ms`);
  console.log(`   50th percentile: ${stats.p50.toFixed(2)}ms`);
  console.log(`   95th percentile: ${stats.p95.toFixed(2)}ms`);
  console.log(`   99th percentile: ${stats.p99.toFixed(2)}ms`);
  
  // Performance rating
  const rating = getPerformanceRating(stats);
  console.log(`\n🏆 Performance Rating: ${rating.emoji} ${rating.label}`);
}

// ==============================
// 🏆 Performance Rating
// ==============================
function getPerformanceRating(stats) {
  const avgResponseTime = stats.averageResponseTime;
  const successRate = stats.successRate;
  const rps = stats.requestsPerSecond;
  
  if (successRate >= 99 && avgResponseTime <= 50 && rps >= 500) {
    return { emoji: '🚀', label: 'Excellent (Production Ready)' };
  } else if (successRate >= 95 && avgResponseTime <= 100 && rps >= 200) {
    return { emoji: '⚡', label: 'Very Good' };
  } else if (successRate >= 90 && avgResponseTime <= 200 && rps >= 100) {
    return { emoji: '👍', label: 'Good' };
  } else if (successRate >= 80 && avgResponseTime <= 500 && rps >= 50) {
    return { emoji: '⚠️', label: 'Needs Optimization' };
  } else {
    return { emoji: '🐌', label: 'Poor Performance' };
  }
}

// ==============================
// 🎯 Main Benchmark Function
// ==============================
async function main() {
  console.log('🚀 Silo Monitoring API Performance Benchmark');
  console.log('━'.repeat(60));
  console.log(`📍 Target: ${BASE_URL}`);
  console.log(`🔢 Total Requests: ${TOTAL_REQUESTS}`);
  console.log(`⚡ Concurrent Connections: ${CONCURRENT_REQUESTS}`);
  
  // Check if server is running
  try {
    await makeRequest('/health');
    console.log('✅ Server is responding');
  } catch (error) {
    console.error('❌ Server is not responding. Please start the server first.');
    process.exit(1);
  }
  
  const allResults = [];
  
  // Run benchmarks for each endpoint
  for (const endpoint of endpoints) {
    try {
      const stats = await runBenchmark(endpoint);
      displayResults(endpoint, stats);
      allResults.push({ endpoint: endpoint.name, stats });
    } catch (error) {
      console.error(`\n❌ Benchmark failed for ${endpoint.name}:`, error.message);
    }
  }
  
  // Overall summary
  console.log('\n\n🎯 OVERALL PERFORMANCE SUMMARY');
  console.log('━'.repeat(60));
  
  const overallStats = {
    totalEndpoints: allResults.length,
    avgRequestsPerSecond: allResults.reduce((sum, r) => sum + r.stats.requestsPerSecond, 0) / allResults.length,
    avgResponseTime: allResults.reduce((sum, r) => sum + r.stats.averageResponseTime, 0) / allResults.length,
    avgSuccessRate: allResults.reduce((sum, r) => sum + r.stats.successRate, 0) / allResults.length
  };
  
  console.log(`📊 Endpoints Tested: ${overallStats.totalEndpoints}`);
  console.log(`⚡ Average RPS: ${overallStats.avgRequestsPerSecond.toFixed(2)}`);
  console.log(`⏱️  Average Response Time: ${overallStats.avgResponseTime.toFixed(2)}ms`);
  console.log(`✅ Average Success Rate: ${overallStats.avgSuccessRate.toFixed(2)}%`);
  
  const overallRating = getPerformanceRating(overallStats);
  console.log(`\n🏆 Overall Rating: ${overallRating.emoji} ${overallRating.label}`);
  
  console.log('\n🎉 Benchmark completed!');
}

// ==============================
// 🚀 Run Benchmark
// ==============================
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
