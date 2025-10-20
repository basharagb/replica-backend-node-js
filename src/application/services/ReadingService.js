// ==============================
// 📊 Reading Application Service (High Performance)
// ==============================
import { logger } from '../../infrastructure/config/logger.js';
import { CacheService, CacheKeys } from '../../infrastructure/cache/redisCache.js';
import { executeQuery, executeBatch } from '../../infrastructure/database/optimizedDb.js';

// ==============================
// 🎯 Reading Service Class
// ==============================
export class ReadingService {
  constructor() {
    this.cacheTimeout = 180; // 3 minutes for readings cache
    this.batchSize = 1000;   // Batch size for bulk operations
  }

  // ==============================
  // 📊 Get Readings by Sensor (Optimized)
  // ==============================
  async getReadingsBySensor(sensorIds, options = {}) {
    const { start, end, limit = 1000, latest = false } = options;
    const cacheKey = `readings:sensor:${sensorIds.join(',')}:${start || 'all'}:${end || 'now'}:${latest}`;
    
    return await CacheService.memoize(cacheKey, async () => {
      let sql = `
        SELECT 
          r.reading_id,
          r.sensor_id,
          r.temperature,
          r.timestamp,
          s.sensor_level,
          s.sensor_position,
          c.cable_id,
          c.cable_number,
          silo.silo_id,
          silo.silo_number,
          silo.silo_name
        FROM readings_raw r
        INNER JOIN sensors s ON r.sensor_id = s.sensor_id
        INNER JOIN cables c ON s.cable_id = c.cable_id
        INNER JOIN silos silo ON c.silo_id = silo.silo_id
        WHERE r.sensor_id IN (${sensorIds.map(() => '?').join(',')})
      `;
      
      const params = [...sensorIds];
      
      if (start) {
        sql += ` AND r.timestamp >= ?`;
        params.push(start);
      }
      
      if (end) {
        sql += ` AND r.timestamp <= ?`;
        params.push(end);
      }
      
      if (latest) {
        sql += ` AND r.timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`;
      }
      
      sql += ` ORDER BY r.timestamp DESC LIMIT ?`;
      params.push(limit);
      
      const { rows, duration } = await executeQuery(sql, params);
      
      logger.info(`✅ Retrieved ${rows.length} readings for sensors [${sensorIds.join(',')}] in ${duration}ms`);
      return this.formatReadingsResponse(rows);
    }, this.cacheTimeout);
  }

  // ==============================
  // 🔌 Get Readings by Cable (Optimized)
  // ==============================
  async getReadingsByCable(cableIds, options = {}) {
    const { start, end, limit = 1000, aggregateLevel = false } = options;
    const cacheKey = `readings:cable:${cableIds.join(',')}:${start || 'all'}:${aggregateLevel}`;
    
    return await CacheService.memoize(cacheKey, async () => {
      let sql;
      
      if (aggregateLevel) {
        // Aggregate readings by sensor level for better performance
        sql = `
          SELECT 
            c.cable_id,
            c.cable_number,
            s.sensor_level,
            AVG(r.temperature) as avg_temperature,
            MIN(r.temperature) as min_temperature,
            MAX(r.temperature) as max_temperature,
            COUNT(*) as reading_count,
            MAX(r.timestamp) as latest_timestamp
          FROM readings_raw r
          INNER JOIN sensors s ON r.sensor_id = s.sensor_id
          INNER JOIN cables c ON s.cable_id = c.cable_id
          WHERE c.cable_id IN (${cableIds.map(() => '?').join(',')})
        `;
      } else {
        sql = `
          SELECT 
            r.*,
            s.sensor_level,
            s.sensor_position,
            c.cable_id,
            c.cable_number,
            silo.silo_number
          FROM readings_raw r
          INNER JOIN sensors s ON r.sensor_id = s.sensor_id
          INNER JOIN cables c ON s.cable_id = c.cable_id
          INNER JOIN silos silo ON c.silo_id = silo.silo_id
          WHERE c.cable_id IN (${cableIds.map(() => '?').join(',')})
        `;
      }
      
      const params = [...cableIds];
      
      if (start) {
        sql += ` AND r.timestamp >= ?`;
        params.push(start);
      }
      
      if (end) {
        sql += ` AND r.timestamp <= ?`;
        params.push(end);
      }
      
      if (aggregateLevel) {
        sql += ` GROUP BY c.cable_id, s.sensor_level ORDER BY c.cable_number, s.sensor_level`;
      } else {
        sql += ` ORDER BY r.timestamp DESC LIMIT ?`;
        params.push(limit);
      }
      
      const { rows, duration } = await executeQuery(sql, params);
      
      logger.info(`✅ Retrieved ${rows.length} cable readings in ${duration}ms`);
      return this.formatReadingsResponse(rows);
    }, this.cacheTimeout);
  }

  // ==============================
  // 🏭 Get Readings by Silo (High Performance)
  // ==============================
  async getReadingsBySilo(siloIds, options = {}) {
    const { start, end, limit = 5000, average = false, latest = false } = options;
    const cacheKey = CacheKeys.READINGS_LATEST('silo', siloIds.join(','));
    
    return await CacheService.memoize(cacheKey, async () => {
      let sql;
      
      if (average) {
        // Cross-cable averaging for better silo representation
        sql = `
          SELECT 
            silo.silo_id,
            silo.silo_number,
            silo.silo_name,
            s.sensor_level,
            AVG(r.temperature) as avg_temperature,
            MIN(r.temperature) as min_temperature,
            MAX(r.temperature) as max_temperature,
            STDDEV(r.temperature) as temp_stddev,
            COUNT(*) as reading_count,
            COUNT(DISTINCT c.cable_id) as cable_count,
            MAX(r.timestamp) as latest_timestamp
          FROM readings_raw r
          INNER JOIN sensors s ON r.sensor_id = s.sensor_id
          INNER JOIN cables c ON s.cable_id = c.cable_id
          INNER JOIN silos silo ON c.silo_id = silo.silo_id
          WHERE silo.silo_id IN (${siloIds.map(() => '?').join(',')})
            AND r.temperature != -127.0
        `;
      } else {
        sql = `
          SELECT 
            r.*,
            s.sensor_level,
            s.sensor_position,
            c.cable_id,
            c.cable_number,
            silo.silo_id,
            silo.silo_number,
            silo.silo_name
          FROM readings_raw r
          INNER JOIN sensors s ON r.sensor_id = s.sensor_id
          INNER JOIN cables c ON s.cable_id = c.cable_id
          INNER JOIN silos silo ON c.silo_id = silo.silo_id
          WHERE silo.silo_id IN (${siloIds.map(() => '?').join(',')})
        `;
      }
      
      const params = [...siloIds];
      
      if (start) {
        sql += ` AND r.timestamp >= ?`;
        params.push(start);
      }
      
      if (end) {
        sql += ` AND r.timestamp <= ?`;
        params.push(end);
      }
      
      if (latest) {
        sql += ` AND r.timestamp >= DATE_SUB(NOW(), INTERVAL 2 HOUR)`;
      }
      
      if (average) {
        sql += ` GROUP BY silo.silo_id, s.sensor_level ORDER BY silo.silo_number, s.sensor_level`;
      } else {
        sql += ` ORDER BY r.timestamp DESC LIMIT ?`;
        params.push(limit);
      }
      
      const { rows, duration } = await executeQuery(sql, params);
      
      logger.info(`✅ Retrieved ${rows.length} silo readings in ${duration}ms`);
      return this.formatReadingsResponse(rows);
    }, this.cacheTimeout);
  }

  // ==============================
  // 📈 Get Latest Readings (Ultra Fast)
  // ==============================
  async getLatestReadings(type, ids, options = {}) {
    const { timeWindow = 1 } = options; // hours
    const cacheKey = `latest:${type}:${ids.join(',')}:${timeWindow}h`;
    
    return await CacheService.memoize(cacheKey, async () => {
      const tableMap = {
        sensor: 'r.sensor_id',
        cable: 'c.cable_id',
        silo: 'silo.silo_id'
      };
      
      const whereField = tableMap[type];
      if (!whereField) {
        throw new Error(`Invalid reading type: ${type}`);
      }
      
      const sql = `
        SELECT 
          r.*,
          s.sensor_level,
          c.cable_id,
          c.cable_number,
          silo.silo_id,
          silo.silo_number,
          silo.silo_name,
          CASE 
            WHEN r.temperature = -127.0 THEN 'disconnected'
            WHEN r.temperature > 60 THEN 'critical'
            WHEN r.temperature > 45 THEN 'warning'
            ELSE 'normal'
          END as status
        FROM readings_raw r
        INNER JOIN sensors s ON r.sensor_id = s.sensor_id
        INNER JOIN cables c ON s.cable_id = c.cable_id
        INNER JOIN silos silo ON c.silo_id = silo.silo_id
        WHERE ${whereField} IN (${ids.map(() => '?').join(',')})
          AND r.timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        ORDER BY r.timestamp DESC
        LIMIT 1000
      `;
      
      const params = [...ids, timeWindow];
      const { rows, duration } = await executeQuery(sql, params);
      
      logger.info(`⚡ Retrieved ${rows.length} latest ${type} readings in ${duration}ms`);
      return this.formatReadingsResponse(rows);
    }, 60); // 1 minute cache for latest readings
  }

  // ==============================
  // 📊 Get Maximum Readings (Performance Optimized)
  // ==============================
  async getMaxReadings(type, ids, options = {}) {
    const { timeWindow = 24, groupBy = 'hour' } = options;
    const cacheKey = CacheKeys.READINGS_MAX(type, ids.join(','));
    
    return await CacheService.memoize(cacheKey, async () => {
      const tableMap = {
        sensor: 'r.sensor_id',
        cable: 'c.cable_id', 
        silo: 'silo.silo_id'
      };
      
      const whereField = tableMap[type];
      const groupByFormat = groupBy === 'hour' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d';
      
      const sql = `
        SELECT 
          ${whereField.split('.')[1]} as id,
          DATE_FORMAT(r.timestamp, '${groupByFormat}') as time_group,
          MAX(r.temperature) as max_temperature,
          AVG(r.temperature) as avg_temperature,
          MIN(r.temperature) as min_temperature,
          COUNT(*) as reading_count
        FROM readings_raw r
        INNER JOIN sensors s ON r.sensor_id = s.sensor_id
        INNER JOIN cables c ON s.cable_id = c.cable_id
        INNER JOIN silos silo ON c.silo_id = silo.silo_id
        WHERE ${whereField} IN (${ids.map(() => '?').join(',')})
          AND r.timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
          AND r.temperature != -127.0
        GROUP BY ${whereField.split('.')[1]}, time_group
        ORDER BY time_group DESC
      `;
      
      const params = [...ids, timeWindow];
      const { rows, duration } = await executeQuery(sql, params);
      
      logger.info(`📊 Retrieved ${rows.length} max readings in ${duration}ms`);
      return rows;
    }, this.cacheTimeout);
  }

  // ==============================
  // 🔥 Bulk Insert Readings (High Performance)
  // ==============================
  async bulkInsertReadings(readings) {
    const batchSize = this.batchSize;
    const batches = [];
    
    for (let i = 0; i < readings.length; i += batchSize) {
      batches.push(readings.slice(i, i + batchSize));
    }
    
    const sql = `
      INSERT INTO readings (sensor_id, temperature, timestamp, humidity, pressure)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    let totalInserted = 0;
    const startTime = Date.now();
    
    for (const batch of batches) {
      const paramsList = batch.map(reading => [
        reading.sensor_id,
        reading.temperature,
        reading.timestamp || new Date(),
        reading.humidity || null,
        reading.pressure || null
      ]);
      
      const { results } = await executeBatch(sql, paramsList);
      totalInserted += results.length;
    }
    
    const duration = Date.now() - startTime;
    logger.info(`🚀 Bulk inserted ${totalInserted} readings in ${duration}ms`);
    
    // Invalidate related caches
    await this.invalidateReadingCaches();
    
    return { inserted: totalInserted, duration };
  }

  // ==============================
  // 📊 Get Reading Statistics
  // ==============================
  async getReadingStatistics(timeRange = '24h') {
    const cacheKey = `stats:readings:${timeRange}`;
    
    return await CacheService.memoize(cacheKey, async () => {
      const timeCondition = this.getTimeCondition(timeRange);
      
      const sql = `
        SELECT 
          COUNT(*) as total_readings,
          COUNT(DISTINCT r.sensor_id) as active_sensors,
          COUNT(DISTINCT c.cable_id) as active_cables,
          COUNT(DISTINCT silo.silo_id) as active_silos,
          AVG(r.temperature) as avg_temperature,
          MIN(r.temperature) as min_temperature,
          MAX(r.temperature) as max_temperature,
          STDDEV(r.temperature) as temp_stddev,
          SUM(CASE WHEN r.temperature = -127.0 THEN 1 ELSE 0 END) as disconnected_readings,
          SUM(CASE WHEN r.temperature > 60 THEN 1 ELSE 0 END) as critical_readings,
          SUM(CASE WHEN r.temperature > 45 AND r.temperature <= 60 THEN 1 ELSE 0 END) as warning_readings
        FROM readings_raw r
        INNER JOIN sensors s ON r.sensor_id = s.sensor_id
        INNER JOIN cables c ON s.cable_id = c.cable_id
        INNER JOIN silos silo ON c.silo_id = silo.silo_id
        WHERE r.timestamp >= ${timeCondition}
      `;
      
      const { rows } = await executeQuery(sql);
      return rows[0];
    }, 300); // 5 minutes cache
  }

  // ==============================
  // 🛠️ Helper Methods
  // ==============================
  formatReadingsResponse(rows) {
    return {
      count: rows.length,
      readings: rows.map(row => ({
        ...row,
        status: this.getTemperatureStatus(row.temperature),
        timestamp: new Date(row.timestamp).toISOString()
      })),
      generatedAt: new Date().toISOString()
    };
  }

  getTemperatureStatus(temperature) {
    if (temperature === -127.0) return 'disconnected';
    if (temperature > 60) return 'critical';
    if (temperature > 45) return 'warning';
    return 'normal';
  }

  getTimeCondition(timeRange) {
    const conditions = {
      '1h': 'DATE_SUB(NOW(), INTERVAL 1 HOUR)',
      '6h': 'DATE_SUB(NOW(), INTERVAL 6 HOUR)',
      '24h': 'DATE_SUB(NOW(), INTERVAL 24 HOUR)',
      '7d': 'DATE_SUB(NOW(), INTERVAL 7 DAY)',
      '30d': 'DATE_SUB(NOW(), INTERVAL 30 DAY)'
    };
    
    return conditions[timeRange] || conditions['24h'];
  }

  // ==============================
  // 🧹 Cache Management
  // ==============================
  async invalidateReadingCaches() {
    const patterns = [
      'readings:*',
      'latest:*',
      'stats:readings:*'
    ];
    
    // In a real Redis implementation, you would use SCAN with patterns
    // For now, we'll clear the entire cache when readings are updated
    await CacheService.clear();
    logger.info('🧹 Invalidated all reading caches');
  }
}

// ==============================
// 🚀 Export Service Instance
// ==============================
export default new ReadingService();
