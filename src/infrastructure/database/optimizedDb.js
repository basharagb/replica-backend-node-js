// ==============================
// 🚀 High-Performance Database Configuration
// ==============================
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// ==============================
// 🏗️ Optimized Connection Pool
// ==============================
export const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT,
  
  // ⚡ Performance Optimizations
  connectionLimit: 50,              // Increased from 10 to 50
  queueLimit: 0,                    // Unlimited queue
  acquireTimeout: 60000,            // 60 seconds timeout
  timeout: 60000,                   // Query timeout
  reconnect: true,                  // Auto-reconnect
  
  // 🔧 Connection Settings
  waitForConnections: true,
  connectTimeout: 30000,            // Increased to 30 seconds
  timezone: '+00:00',               // UTC timezone
  decimalNumbers: true,             // Preserve decimal precision
  
  // 🚀 MySQL Performance Settings
  supportBigNumbers: true,
  bigNumberStrings: true,
  dateStrings: false,
  debug: false,
  trace: false,
  
  // 📊 Connection Pool Events
  multipleStatements: false,        // Security: prevent SQL injection
  nestTables: false,
  typeCast: true,
  
  // 🔥 Advanced Performance Options
  ssl: false,                       // Disable SSL for local development
  compress: true,                   // Enable compression
  
  // ⚡ MySQL-specific optimizations
  flags: [
    'FOUND_ROWS',
    'IGNORE_SIGPIPE',
    'IGNORE_SPACE',
    'LONG_FLAG',
    'LONG_PASSWORD'
  ]
});

// ==============================
// 📊 Connection Pool Monitoring
// ==============================
let connectionStats = {
  totalConnections: 0,
  activeConnections: 0,
  queuedRequests: 0,
  errors: 0,
  lastError: null
};

// Pool event listeners for monitoring
pool.on('connection', (connection) => {
  connectionStats.totalConnections++;
  connectionStats.activeConnections++;
  logger.info(`📊 New DB connection established. ID: ${connection.threadId}`);
});

pool.on('release', (connection) => {
  connectionStats.activeConnections--;
  logger.debug(`🔄 Connection released. ID: ${connection.threadId}`);
});

pool.on('error', (err) => {
  connectionStats.errors++;
  connectionStats.lastError = err.message;
  logger.error('❌ Database pool error:', err);
});

// ==============================
// 🧠 Connection Health Check
// ==============================
export const healthCheck = async () => {
  try {
    const start = Date.now();
    const [rows] = await pool.query('SELECT 1 AS health_check, NOW() AS server_time');
    const duration = Date.now() - start;
    
    return {
      healthy: true,
      responseTime: `${duration}ms`,
      serverTime: rows[0].server_time,
      stats: connectionStats
    };
  } catch (error) {
    logger.error('❌ Health check failed:', error);
    return {
      healthy: false,
      error: error.message,
      stats: connectionStats
    };
  }
};

// ==============================
// 🚀 Optimized Query Executor
// ==============================
export const executeQuery = async (sql, params = []) => {
  const start = Date.now();
  let connection;
  
  try {
    connection = await pool.getConnection();
    const [rows, fields] = await connection.execute(sql, params);
    const duration = Date.now() - start;
    
    // Log slow queries (>100ms)
    if (duration > 100) {
      logger.warn(`🐌 Slow query detected (${duration}ms): ${sql.substring(0, 100)}...`);
    }
    
    return { rows, fields, duration };
  } catch (error) {
    connectionStats.errors++;
    connectionStats.lastError = error.message;
    logger.error(`❌ Query execution failed: ${error.message}`);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// ==============================
// 📈 Batch Query Executor (for bulk operations)
// ==============================
export const executeBatch = async (sql, paramsList = []) => {
  const start = Date.now();
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const results = [];
    for (const params of paramsList) {
      const [rows] = await connection.execute(sql, params);
      results.push(rows);
    }
    
    await connection.commit();
    const duration = Date.now() - start;
    
    logger.info(`✅ Batch operation completed (${duration}ms): ${paramsList.length} queries`);
    return { results, duration };
  } catch (error) {
    if (connection) await connection.rollback();
    connectionStats.errors++;
    connectionStats.lastError = error.message;
    logger.error(`❌ Batch execution failed: ${error.message}`);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// ==============================
// 🧹 Graceful Shutdown
// ==============================
export const closePool = async () => {
  try {
    await pool.end();
    logger.success('🧹 Database pool closed successfully');
  } catch (error) {
    logger.error('❌ Error closing database pool:', error);
    throw error;
  }
};

// ==============================
// 📊 Get Pool Statistics
// ==============================
export const getPoolStats = () => {
  return {
    ...connectionStats,
    poolConfig: {
      connectionLimit: pool.config.connectionLimit,
      queueLimit: pool.config.queueLimit,
      acquireTimeout: pool.config.acquireTimeout
    }
  };
};

// ==============================
// 🚀 Initialize Connection Test
// ==============================
(async () => {
  try {
    const health = await healthCheck();
    if (health.healthy) {
      logger.success(`✅ Optimized database connected successfully`);
      logger.info(`📊 Response time: ${health.responseTime}`);
    } else {
      logger.error('❌ Database connection failed:', health.error);
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
})();

// ==============================
// 🧹 Process Cleanup
// ==============================
process.on('SIGINT', async () => {
  logger.info('🧹 Shutting down database connections...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🧹 Shutting down database connections...');
  await closePool();
  process.exit(0);
});
