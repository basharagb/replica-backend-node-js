// ==============================
// 📊 Performance Monitoring Service
// ==============================
import { logger } from '../config/logger.js';

// ==============================
// 📈 Performance Metrics Storage
// ==============================
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0
      },
      endpoints: new Map(),
      errors: [],
      systemHealth: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };

    // Update system metrics every 30 seconds
    setInterval(() => this.updateSystemMetrics(), 30000);
    
    // Clean old error logs every hour
    setInterval(() => this.cleanOldErrors(), 3600000);
  }

  // ==============================
  // 🎯 Request Tracking
  // ==============================
  trackRequest(req, res, responseTime) {
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

    // Update global metrics
    this.metrics.requests.total++;
    if (isSuccess) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Update response time metrics
    this.updateResponseTimeMetrics(responseTime);

    // Track per-endpoint metrics
    this.trackEndpointMetrics(endpoint, responseTime, isSuccess);

    // Log slow requests
    if (responseTime > 1000) {
      logger.warn(`🐌 Slow request detected: ${endpoint} (${responseTime}ms)`);
    }
  }

  updateResponseTimeMetrics(responseTime) {
    const { requests } = this.metrics;
    
    // Calculate new average
    requests.avgResponseTime = (
      (requests.avgResponseTime * (requests.total - 1) + responseTime) / 
      requests.total
    );

    // Update min/max
    requests.minResponseTime = Math.min(requests.minResponseTime, responseTime);
    requests.maxResponseTime = Math.max(requests.maxResponseTime, responseTime);
  }

  trackEndpointMetrics(endpoint, responseTime, isSuccess) {
    if (!this.metrics.endpoints.has(endpoint)) {
      this.metrics.endpoints.set(endpoint, {
        hits: 0,
        successCount: 0,
        errorCount: 0,
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        lastAccessed: new Date()
      });
    }

    const endpointMetrics = this.metrics.endpoints.get(endpoint);
    endpointMetrics.hits++;
    endpointMetrics.lastAccessed = new Date();

    if (isSuccess) {
      endpointMetrics.successCount++;
    } else {
      endpointMetrics.errorCount++;
    }

    // Update endpoint response time
    endpointMetrics.avgResponseTime = (
      (endpointMetrics.avgResponseTime * (endpointMetrics.hits - 1) + responseTime) / 
      endpointMetrics.hits
    );
    
    endpointMetrics.minResponseTime = Math.min(endpointMetrics.minResponseTime, responseTime);
    endpointMetrics.maxResponseTime = Math.max(endpointMetrics.maxResponseTime, responseTime);
  }

  // ==============================
  // ❌ Error Tracking
  // ==============================
  trackError(error, req = null, additionalInfo = {}) {
    const errorEntry = {
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      endpoint: req ? `${req.method} ${req.path}` : 'Unknown',
      userAgent: req?.get('User-Agent'),
      ip: req?.ip,
      ...additionalInfo
    };

    this.metrics.errors.push(errorEntry);

    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }

    logger.error(`❌ Error tracked: ${error.message}`, errorEntry);
  }

  // ==============================
  // 🖥️ System Metrics
  // ==============================
  updateSystemMetrics() {
    this.metrics.systemHealth = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date()
    };
  }

  // ==============================
  // 🧹 Cleanup Methods
  // ==============================
  cleanOldErrors() {
    const oneHourAgo = new Date(Date.now() - 3600000);
    this.metrics.errors = this.metrics.errors.filter(
      error => error.timestamp > oneHourAgo
    );
    logger.info(`🧹 Cleaned old errors. Current count: ${this.metrics.errors.length}`);
  }

  // ==============================
  // 📊 Metrics Retrieval
  // ==============================
  getMetrics() {
    return {
      ...this.metrics,
      endpoints: Object.fromEntries(this.metrics.endpoints),
      performance: this.getPerformanceScore()
    };
  }

  getPerformanceScore() {
    const { requests } = this.metrics;
    const successRate = requests.total > 0 ? (requests.successful / requests.total) * 100 : 100;
    const avgResponseTime = requests.avgResponseTime;

    let score = 100;
    
    // Deduct points for low success rate
    if (successRate < 95) score -= (95 - successRate) * 2;
    
    // Deduct points for slow response times
    if (avgResponseTime > 100) score -= Math.min((avgResponseTime - 100) / 10, 30);
    
    return {
      score: Math.max(0, Math.round(score)),
      successRate: Math.round(successRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      rating: score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Poor'
    };
  }

  getTopEndpoints(limit = 10) {
    const endpoints = Array.from(this.metrics.endpoints.entries())
      .map(([path, metrics]) => ({ path, ...metrics }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);

    return endpoints;
  }

  getSlowestEndpoints(limit = 10) {
    const endpoints = Array.from(this.metrics.endpoints.entries())
      .map(([path, metrics]) => ({ path, ...metrics }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, limit);

    return endpoints;
  }

  getRecentErrors(limit = 10) {
    return this.metrics.errors
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // ==============================
  // 🔄 Reset Methods
  // ==============================
  resetMetrics() {
    this.metrics.requests = {
      total: 0,
      successful: 0,
      failed: 0,
      avgResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0
    };
    this.metrics.endpoints.clear();
    this.metrics.errors = [];
    
    logger.info('📊 Performance metrics reset');
  }
}

// ==============================
// 🚀 Singleton Instance
// ==============================
const performanceMonitor = new PerformanceMonitor();

// ==============================
// 🎯 Express Middleware
// ==============================
export const performanceMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    performanceMonitor.trackRequest(req, res, responseTime);
    originalEnd.apply(this, args);
  };

  next();
};

// ==============================
// 🚨 Error Tracking Middleware
// ==============================
export const errorTrackingMiddleware = (err, req, res, next) => {
  performanceMonitor.trackError(err, req);
  next(err);
};

// ==============================
// 📊 Health Check with Performance
// ==============================
export const getSystemHealth = () => {
  const metrics = performanceMonitor.getMetrics();
  const performance = metrics.performance;

  return {
    status: performance.score >= 70 ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    performance: {
      score: performance.score,
      rating: performance.rating,
      successRate: performance.successRate,
      avgResponseTime: performance.avgResponseTime
    },
    requests: {
      total: metrics.requests.total,
      successful: metrics.requests.successful,
      failed: metrics.requests.failed
    },
    errors: {
      recent: metrics.errors.length,
      lastError: metrics.errors[0]?.timestamp || null
    }
  };
};

// ==============================
// 📈 Detailed Analytics
// ==============================
export const getDetailedAnalytics = () => {
  return {
    overview: performanceMonitor.getMetrics(),
    topEndpoints: performanceMonitor.getTopEndpoints(),
    slowestEndpoints: performanceMonitor.getSlowestEndpoints(),
    recentErrors: performanceMonitor.getRecentErrors(),
    systemHealth: getSystemHealth()
  };
};

// ==============================
// 🎯 Export Performance Monitor
// ==============================
export default performanceMonitor;
