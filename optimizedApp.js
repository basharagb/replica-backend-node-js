// ============================================================
// 🚀 High-Performance Silo Monitoring API (Clean Architecture)
// ============================================================
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import cors from 'cors';
import cluster from 'cluster';
import os from 'os';

// Infrastructure imports
import { pool, healthCheck, getPoolStats } from './src/infrastructure/database/optimizedDb.js';
import { performanceMiddleware, errorTrackingMiddleware, getSystemHealth } from './src/infrastructure/monitoring/performanceMonitor.js';
import { cacheMiddleware, getCacheHealth } from './src/infrastructure/cache/redisCache.js';
import { responseFormatter } from './src/infrastructure/utils/responseFormatter.js';
import { logger } from './src/infrastructure/config/logger.js';

// Route imports
import siloRoutes from './src/presentation/routes/siloRoutes.js';
import readingRoutes from './src/presentation/routes/readingRoutes.js';
import alertRoutes from './src/presentation/routes/alertRoutes.js';
import userRoutes from './src/presentation/routes/userRoutes.js';
import smsRoutes from './src/presentation/routes/smsRoutes.js';
import environmentRoutes from './src/presentation/routes/environmentRoutes.js';
import siloLevelRoutes from './src/presentation/routes/siloLevelRoutes.js';

// ============================================================
// ⚙️ Environment Configuration
// ============================================================
dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const CLUSTER_MODE = process.env.CLUSTER_MODE === 'true';

// ============================================================
// 🔥 Cluster Mode for Maximum Performance
// ============================================================
if (CLUSTER_MODE && cluster.isPrimary && NODE_ENV === 'production') {
  const numCPUs = os.cpus().length;
  logger.info(`🚀 Starting ${numCPUs} worker processes...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`🔄 Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    logger.success(`✅ Worker ${worker.process.pid} is online`);
  });
} else {
  startServer();
}

// ============================================================
// 🚀 Server Initialization
// ============================================================
function startServer() {
  const app = express();

  // ============================================================
  // 🛡️ Security & Performance Middleware
  // ============================================================
  
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for API
    crossOriginEmbedderPolicy: false
  }));

  // Compression for better performance
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: NODE_ENV === 'production' ? 1000 : 10000, // requests per window
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // CORS with optimized settings
  app.use(cors({
    origin: NODE_ENV === 'production' 
      ? ['http://localhost:3000', 'https://your-domain.com']
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));

  // Body parsing with limits
  app.use(express.json({ 
    limit: '10mb',
    strict: true
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 1000
  }));

  // Performance monitoring
  app.use(performanceMiddleware);

  // ============================================================
  // 🩺 Enhanced Health Check Endpoint
  // ============================================================
  app.get('/health', cacheMiddleware(30), async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Parallel health checks for better performance
      const [dbHealth, cacheHealth, systemHealth] = await Promise.all([
        healthCheck(),
        Promise.resolve(getCacheHealth()),
        Promise.resolve(getSystemHealth())
      ]);

      const responseTime = Date.now() - startTime;

      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: NODE_ENV,
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        services: {
          database: dbHealth,
          cache: cacheHealth,
          system: systemHealth
        },
        performance: {
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          dbStats: getPoolStats()
        }
      };

      logger.info(`✅ Health check completed in ${responseTime}ms`);

      res.status(200).json(
        responseFormatter.success(healthData, 'System is healthy')
      );
    } catch (err) {
      logger.error('❌ Health check failed:', err);
      res.status(503).json(
        responseFormatter.error(`Health check failed: ${err.message}`, 503)
      );
    }
  });

  // ============================================================
  // 📊 Performance Metrics Endpoint
  // ============================================================
  app.get('/metrics', async (req, res) => {
    try {
      const systemHealth = getSystemHealth();
      const dbStats = getPoolStats();
      const cacheHealth = getCacheHealth();

      const metrics = {
        timestamp: new Date().toISOString(),
        system: systemHealth,
        database: dbStats,
        cache: cacheHealth,
        process: {
          pid: process.pid,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        }
      };

      res.status(200).json(
        responseFormatter.success(metrics, 'Performance metrics retrieved')
      );
    } catch (error) {
      logger.error('❌ Error retrieving metrics:', error);
      res.status(500).json(
        responseFormatter.error(`Metrics error: ${error.message}`, 500)
      );
    }
  });

  // ============================================================
  // 🌾 Optimized API Routes
  // ============================================================
  
  // Silos (with caching)
  app.use('/api/silos', cacheMiddleware(300), siloRoutes);
  
  // Readings (with shorter cache for real-time data)
  app.use('/readings', cacheMiddleware(60), readingRoutes);
  app.use('/api/readings', cacheMiddleware(60), readingRoutes);
  
  // Alerts (short cache for critical data)
  app.use('/alerts', cacheMiddleware(30), alertRoutes);
  app.use('/api/alerts', cacheMiddleware(30), alertRoutes);
  
  // Users (no cache for security)
  app.use('/login', userRoutes);
  app.use('/api/users', userRoutes);
  
  // SMS (no cache)
  app.use('/sms', smsRoutes);
  app.use('/api/sms', smsRoutes);
  
  // Environment (medium cache)
  app.use('/env_temp', cacheMiddleware(120), environmentRoutes);
  app.use('/api/environment', cacheMiddleware(120), environmentRoutes);
  
  // Silo levels (medium cache)
  app.use('/silos/level-estimate', cacheMiddleware(180), siloLevelRoutes);
  app.use('/api/silos/level-estimate', cacheMiddleware(180), siloLevelRoutes);

  // ============================================================
  // 🧭 Optimized Root Endpoint
  // ============================================================
  app.get('/', (req, res) => {
    res.type('html').send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Silo Monitoring API</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            text-align: center; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            max-width: 600px;
            margin: 0 auto;
          }
          h1 { color: #fff; margin-bottom: 10px; font-size: 2.5em; }
          h3 { color: #f0f0f0; margin-bottom: 30px; font-weight: 300; }
          .status { background: #4CAF50; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 10px 0; }
          .links { margin-top: 30px; }
          a {
            color: #fff;
            text-decoration: none;
            border: 2px solid rgba(255,255,255,0.3);
            padding: 12px 24px;
            border-radius: 25px;
            background: rgba(255,255,255,0.1);
            transition: all 0.3s ease;
            margin: 0 10px;
            display: inline-block;
          }
          a:hover { 
            background: rgba(255,255,255,0.2); 
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }
          .performance {
            margin-top: 20px;
            font-size: 0.9em;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🌾 Silo Monitoring API</h1>
          <h3>High-Performance Industrial IoT Backend</h3>
          <div class="status">✅ System Online & Optimized</div>
          
          <div class="performance">
            <p><strong>Performance Features:</strong></p>
            <p>🚀 Connection Pooling • 📦 Advanced Caching • 📊 Real-time Monitoring</p>
            <p>🔥 Clean Architecture • ⚡ Async Processing • 🛡️ Security Hardened</p>
          </div>
          
          <div class="links">
            <a href="/health">🩺 Health Check</a>
            <a href="/metrics">📊 Metrics</a>
            <a href="/api/silos">🏭 Silos API</a>
          </div>
        </div>
      </body>
      </html>
    `);
  });

  // ============================================================
  // 🚫 404 Handler
  // ============================================================
  app.use('*', (req, res) => {
    logger.warn(`🚫 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json(
      responseFormatter.error(
        `Route not found: ${req.method} ${req.originalUrl}`,
        404
      )
    );
  });

  // ============================================================
  // ⚠️ Global Error Handler
  // ============================================================
  app.use(errorTrackingMiddleware);
  app.use((err, req, res, next) => {
    logger.error('🔥 Uncaught Error:', err);
    
    // Don't leak error details in production
    const message = NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message;
    
    res.status(err.status || 500).json(
      responseFormatter.error(message, err.status || 500)
    );
  });

  // ============================================================
  // 🌍 Start Server with Performance Logging
  // ============================================================
  const server = app.listen(PORT, HOST, () => {
    const workerInfo = cluster.worker ? ` (Worker ${cluster.worker.id})` : '';
    logger.success(`🚀 High-Performance Silo API Server running at: http://${HOST}:${PORT}${workerInfo}`);
    logger.info(`📊 Environment: ${NODE_ENV}`);
    logger.info(`🔥 Performance optimizations: ENABLED`);
    logger.info(`📦 Caching: ENABLED`);
    logger.info(`🛡️ Security: ENABLED`);
    logger.info(`📈 Monitoring: ENABLED`);
  });

  // ============================================================
  // ⚡ Server Performance Tuning
  // ============================================================
  server.keepAliveTimeout = 65000; // Slightly higher than ALB timeout
  server.headersTimeout = 66000;   // Higher than keepAliveTimeout
  
  // Increase max connections
  server.maxConnections = 1000;
  
  // ============================================================
  // 🧹 Graceful Shutdown
  // ============================================================
  const gracefulShutdown = async (signal) => {
    logger.info(`🧹 Received ${signal}. Starting graceful shutdown...`);
    
    server.close(async () => {
      logger.info('🔌 HTTP server closed');
      
      try {
        await pool.end();
        logger.success('✅ Database connections closed');
      } catch (err) {
        logger.error('❌ Error closing database:', err);
      }
      
      logger.success('🎯 Graceful shutdown completed');
      process.exit(0);
    });
    
    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('⚠️ Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('💥 Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });

  return server;
}

export default startServer;
