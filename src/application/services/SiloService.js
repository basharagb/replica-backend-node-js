// ==============================
// 🏭 Silo Application Service (Clean Architecture)
// ==============================
import { logger } from '../../infrastructure/config/logger.js';
import { CacheService, CacheKeys } from '../../infrastructure/cache/redisCache.js';
import { executeQuery } from '../../infrastructure/database/optimizedDb.js';
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';

// ==============================
// 🎯 Silo Service Class
// ==============================
export class SiloService {
  constructor() {
    this.cacheTimeout = 300; // 5 minutes default cache
  }

  // ==============================
  // 📋 Get All Silos (Optimized)
  // ==============================
  async getAllSilos() {
    const cacheKey = CacheKeys.SILOS_ALL;
    
    return await CacheService.memoize(cacheKey, async () => {
      const sql = `
        SELECT 
          s.silo_id,
          s.silo_number,
          s.silo_name,
          s.capacity,
          s.location,
          s.status,
          sg.group_name,
          sg.group_id,
          COUNT(c.cable_id) as cable_count,
          COUNT(sen.sensor_id) as sensor_count
        FROM silos s
        LEFT JOIN silo_groups sg ON s.group_id = sg.group_id
        LEFT JOIN cables c ON s.silo_id = c.silo_id
        LEFT JOIN sensors sen ON c.cable_id = sen.cable_id
        GROUP BY s.silo_id, s.silo_number, s.silo_name, s.capacity, s.location, s.status, sg.group_name, sg.group_id
        ORDER BY s.silo_number ASC
      `;

      const { rows } = await executeQuery(sql);
      
      logger.info(`✅ Retrieved ${rows.length} silos from database`);
      return rows;
    }, this.cacheTimeout);
  }

  // ==============================
  // 🎯 Get Single Silo (Optimized)
  // ==============================
  async getSiloById(siloId) {
    const cacheKey = CacheKeys.SILO_BY_ID(siloId);
    
    return await CacheService.memoize(cacheKey, async () => {
      const sql = `
        SELECT 
          s.*,
          sg.group_name,
          sg.description as group_description,
          COUNT(DISTINCT c.cable_id) as cable_count,
          COUNT(DISTINCT sen.sensor_id) as sensor_count,
          MAX(r.timestamp) as last_reading_time
        FROM silos s
        LEFT JOIN silo_groups sg ON s.group_id = sg.group_id
        LEFT JOIN cables c ON s.silo_id = c.silo_id
        LEFT JOIN sensors sen ON c.cable_id = sen.cable_id
        LEFT JOIN readings r ON sen.sensor_id = r.sensor_id
        WHERE s.silo_id = ?
        GROUP BY s.silo_id
      `;

      const { rows } = await executeQuery(sql, [siloId]);
      
      if (rows.length === 0) {
        throw new Error(`Silo with ID ${siloId} not found`);
      }

      logger.info(`✅ Retrieved silo ${siloId} details`);
      return rows[0];
    }, this.cacheTimeout);
  }

  // ==============================
  // 🔌 Get Silo Cables (Optimized)
  // ==============================
  async getSiloCables(siloId) {
    const cacheKey = CacheKeys.SILO_CABLES(siloId);
    
    return await CacheService.memoize(cacheKey, async () => {
      const sql = `
        SELECT 
          c.*,
          s.silo_name,
          s.silo_number,
          COUNT(sen.sensor_id) as sensor_count,
          MAX(r.timestamp) as last_reading_time,
          AVG(r.temperature) as avg_temperature
        FROM cables c
        INNER JOIN silos s ON c.silo_id = s.silo_id
        LEFT JOIN sensors sen ON c.cable_id = sen.cable_id
        LEFT JOIN readings r ON sen.sensor_id = r.sensor_id
        WHERE c.silo_id = ?
        GROUP BY c.cable_id
        ORDER BY c.cable_number ASC
      `;

      const { rows } = await executeQuery(sql, [siloId]);
      
      logger.info(`✅ Retrieved ${rows.length} cables for silo ${siloId}`);
      return rows;
    }, this.cacheTimeout);
  }

  // ==============================
  // 📊 Get Silo Statistics (Performance Optimized)
  // ==============================
  async getSiloStatistics(siloId) {
    const cacheKey = `silo:${siloId}:stats`;
    
    return await CacheService.memoize(cacheKey, async () => {
      // Use parallel queries for better performance
      const [siloInfo, temperatureStats, alertStats] = await Promise.all([
        this.getSiloBasicInfo(siloId),
        this.getSiloTemperatureStats(siloId),
        this.getSiloAlertStats(siloId)
      ]);

      return {
        silo: siloInfo,
        temperature: temperatureStats,
        alerts: alertStats,
        generatedAt: new Date()
      };
    }, 180); // 3 minutes cache for stats
  }

  // ==============================
  // 🎯 Helper Methods
  // ==============================
  async getSiloBasicInfo(siloId) {
    const sql = `
      SELECT s.*, sg.group_name 
      FROM silos s 
      LEFT JOIN silo_groups sg ON s.group_id = sg.group_id 
      WHERE s.silo_id = ?
    `;
    
    const { rows } = await executeQuery(sql, [siloId]);
    return rows[0];
  }

  async getSiloTemperatureStats(siloId) {
    const sql = `
      SELECT 
        COUNT(*) as total_readings,
        AVG(r.temperature) as avg_temp,
        MIN(r.temperature) as min_temp,
        MAX(r.temperature) as max_temp,
        STDDEV(r.temperature) as temp_stddev,
        COUNT(DISTINCT r.sensor_id) as active_sensors
      FROM readings_raw r
      INNER JOIN sensors sen ON r.sensor_id = sen.sensor_id
      INNER JOIN cables c ON sen.cable_id = c.cable_id
      WHERE c.silo_id = ?
        AND r.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND r.temperature != -127.0
    `;
    
    const { rows } = await executeQuery(sql, [siloId]);
    return rows[0];
  }

  async getSiloAlertStats(siloId) {
    const sql = `
      SELECT 
        COUNT(*) as total_alerts,
        SUM(CASE WHEN a.alert_level = 'critical' THEN 1 ELSE 0 END) as critical_alerts,
        SUM(CASE WHEN a.alert_level = 'warning' THEN 1 ELSE 0 END) as warning_alerts,
        SUM(CASE WHEN a.is_active = 1 THEN 1 ELSE 0 END) as active_alerts
      FROM alerts a
      INNER JOIN sensors sen ON a.sensor_id = sen.sensor_id
      INNER JOIN cables c ON sen.cable_id = c.cable_id
      WHERE c.silo_id = ?
        AND a.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `;
    
    const { rows } = await executeQuery(sql, [siloId]);
    return rows[0];
  }

  // ==============================
  // 🔍 Search Silos (Advanced)
  // ==============================
  async searchSilos(searchParams) {
    const { query, groupId, status, limit = 50, offset = 0 } = searchParams;
    
    let sql = `
      SELECT 
        s.*,
        sg.group_name,
        COUNT(DISTINCT c.cable_id) as cable_count
      FROM silos s
      LEFT JOIN silo_groups sg ON s.group_id = sg.group_id
      LEFT JOIN cables c ON s.silo_id = c.silo_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (query) {
      sql += ` AND (s.silo_name LIKE ? OR s.silo_number LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`);
    }
    
    if (groupId) {
      sql += ` AND s.group_id = ?`;
      params.push(groupId);
    }
    
    if (status) {
      sql += ` AND s.status = ?`;
      params.push(status);
    }
    
    sql += ` GROUP BY s.silo_id ORDER BY s.silo_number LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const { rows } = await executeQuery(sql, params);
    
    logger.info(`🔍 Search returned ${rows.length} silos`);
    return rows;
  }

  // ==============================
  // 📈 Get Silo Performance Metrics
  // ==============================
  async getSiloPerformanceMetrics(siloId, timeRange = '24h') {
    const cacheKey = `silo:${siloId}:performance:${timeRange}`;
    
    return await CacheService.memoize(cacheKey, async () => {
      const timeCondition = this.getTimeCondition(timeRange);
      
      const sql = `
        SELECT 
          DATE_FORMAT(r.timestamp, '%Y-%m-%d %H:00:00') as hour,
          AVG(r.temperature) as avg_temp,
          MIN(r.temperature) as min_temp,
          MAX(r.temperature) as max_temp,
          COUNT(*) as reading_count,
          COUNT(DISTINCT r.sensor_id) as active_sensors
        FROM readings_raw r
        INNER JOIN sensors sen ON r.sensor_id = sen.sensor_id
        INNER JOIN cables c ON sen.cable_id = c.cable_id
        WHERE c.silo_id = ?
          AND r.timestamp >= ${timeCondition}
          AND r.temperature != -127.0
        GROUP BY DATE_FORMAT(r.timestamp, '%Y-%m-%d %H:00:00')
        ORDER BY hour ASC
      `;
      
      const { rows } = await executeQuery(sql, [siloId]);
      
      return {
        siloId,
        timeRange,
        dataPoints: rows,
        summary: this.calculatePerformanceSummary(rows)
      };
    }, 300); // 5 minutes cache
  }

  // ==============================
  // 🛠️ Utility Methods
  // ==============================
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

  calculatePerformanceSummary(dataPoints) {
    if (dataPoints.length === 0) {
      return { avgTemp: 0, minTemp: 0, maxTemp: 0, totalReadings: 0 };
    }

    const totalReadings = dataPoints.reduce((sum, point) => sum + point.reading_count, 0);
    const avgTemp = dataPoints.reduce((sum, point) => sum + point.avg_temp, 0) / dataPoints.length;
    const minTemp = Math.min(...dataPoints.map(point => point.min_temp));
    const maxTemp = Math.max(...dataPoints.map(point => point.max_temp));

    return {
      avgTemp: Math.round(avgTemp * 100) / 100,
      minTemp,
      maxTemp,
      totalReadings,
      dataPointCount: dataPoints.length
    };
  }

  // ==============================
  // 🧹 Cache Management
  // ==============================
  async invalidateSiloCache(siloId) {
    const keys = [
      CacheKeys.SILOS_ALL,
      CacheKeys.SILO_BY_ID(siloId),
      CacheKeys.SILO_CABLES(siloId),
      `silo:${siloId}:stats`,
      `silo:${siloId}:performance:24h`,
      `silo:${siloId}:performance:7d`
    ];

    for (const key of keys) {
      await CacheService.delete(key);
    }

    logger.info(`🧹 Invalidated cache for silo ${siloId}`);
  }
}

// ==============================
// 🚀 Export Service Instance
// ==============================
export default new SiloService();
