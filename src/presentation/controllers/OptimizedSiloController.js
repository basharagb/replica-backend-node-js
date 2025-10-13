// ==============================
// 🏭 Optimized Silo Controller (Clean Architecture)
// ==============================
import SiloService from '../../application/services/SiloService.js';
import ReadingService from '../../application/services/ReadingService.js';
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { logger } from '../../infrastructure/config/logger.js';
import performanceMonitor from '../../infrastructure/monitoring/performanceMonitor.js';

// ==============================
// 🎯 Optimized Silo Controller Class
// ==============================
export class OptimizedSiloController {
  
  // ==============================
  // 📋 Get All Silos (Ultra Fast)
  // ==============================
  async getAllSilos(req, res) {
    const startTime = Date.now();
    
    try {
      logger.info('🔍 Fetching all silos...');
      
      const silos = await SiloService.getAllSilos();
      const responseTime = Date.now() - startTime;
      
      logger.success(`✅ Retrieved ${silos.length} silos in ${responseTime}ms`);
      
      res.status(200).json(
        responseFormatter.success(
          {
            count: silos.length,
            silos,
            performance: {
              responseTime: `${responseTime}ms`,
              cached: responseTime < 50 // Likely cached if very fast
            }
          },
          'Silos retrieved successfully'
        )
      );
    } catch (error) {
      performanceMonitor.trackError(error, req);
      logger.error('❌ Error fetching silos:', error);
      
      res.status(500).json(
        responseFormatter.error(
          `Failed to retrieve silos: ${error.message}`,
          500
        )
      );
    }
  }

  // ==============================
  // 🎯 Get Single Silo (Optimized)
  // ==============================
  async getSiloById(req, res) {
    const startTime = Date.now();
    const { id } = req.params;
    
    try {
      logger.info(`🔍 Fetching silo ${id}...`);
      
      // Validate silo ID
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(
          responseFormatter.error('Invalid silo ID provided', 400)
        );
      }
      
      const silo = await SiloService.getSiloById(parseInt(id));
      const responseTime = Date.now() - startTime;
      
      logger.success(`✅ Retrieved silo ${id} in ${responseTime}ms`);
      
      res.status(200).json(
        responseFormatter.success(
          {
            silo,
            performance: {
              responseTime: `${responseTime}ms`
            }
          },
          `Silo ${id} retrieved successfully`
        )
      );
    } catch (error) {
      performanceMonitor.trackError(error, req);
      logger.error(`❌ Error fetching silo ${id}:`, error);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json(
        responseFormatter.error(error.message, statusCode)
      );
    }
  }

  // ==============================
  // 🔌 Get Silo Cables (High Performance)
  // ==============================
  async getSiloCables(req, res) {
    const startTime = Date.now();
    const { siloId } = req.params;
    
    try {
      logger.info(`🔍 Fetching cables for silo ${siloId}...`);
      
      if (!siloId || isNaN(parseInt(siloId))) {
        return res.status(400).json(
          responseFormatter.error('Invalid silo ID provided', 400)
        );
      }
      
      const cables = await SiloService.getSiloCables(parseInt(siloId));
      const responseTime = Date.now() - startTime;
      
      logger.success(`✅ Retrieved ${cables.length} cables for silo ${siloId} in ${responseTime}ms`);
      
      res.status(200).json(
        responseFormatter.success(
          {
            siloId: parseInt(siloId),
            count: cables.length,
            cables,
            performance: {
              responseTime: `${responseTime}ms`
            }
          },
          `Cables for silo ${siloId} retrieved successfully`
        )
      );
    } catch (error) {
      performanceMonitor.trackError(error, req);
      logger.error(`❌ Error fetching cables for silo ${siloId}:`, error);
      
      res.status(500).json(
        responseFormatter.error(
          `Failed to retrieve cables: ${error.message}`,
          500
        )
      );
    }
  }

  // ==============================
  // 📊 Get Silo Statistics (Advanced)
  // ==============================
  async getSiloStatistics(req, res) {
    const startTime = Date.now();
    const { id } = req.params;
    
    try {
      logger.info(`📊 Fetching statistics for silo ${id}...`);
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(
          responseFormatter.error('Invalid silo ID provided', 400)
        );
      }
      
      const statistics = await SiloService.getSiloStatistics(parseInt(id));
      const responseTime = Date.now() - startTime;
      
      logger.success(`✅ Retrieved statistics for silo ${id} in ${responseTime}ms`);
      
      res.status(200).json(
        responseFormatter.success(
          {
            siloId: parseInt(id),
            statistics,
            performance: {
              responseTime: `${responseTime}ms`
            }
          },
          `Statistics for silo ${id} retrieved successfully`
        )
      );
    } catch (error) {
      performanceMonitor.trackError(error, req);
      logger.error(`❌ Error fetching statistics for silo ${id}:`, error);
      
      res.status(500).json(
        responseFormatter.error(
          `Failed to retrieve statistics: ${error.message}`,
          500
        )
      );
    }
  }

  // ==============================
  // 🔍 Search Silos (Advanced Query)
  // ==============================
  async searchSilos(req, res) {
    const startTime = Date.now();
    
    try {
      const searchParams = {
        query: req.query.q || req.query.query,
        groupId: req.query.group_id ? parseInt(req.query.group_id) : null,
        status: req.query.status,
        limit: Math.min(parseInt(req.query.limit) || 50, 200), // Max 200
        offset: parseInt(req.query.offset) || 0
      };
      
      logger.info('🔍 Searching silos with params:', searchParams);
      
      const silos = await SiloService.searchSilos(searchParams);
      const responseTime = Date.now() - startTime;
      
      logger.success(`✅ Search returned ${silos.length} silos in ${responseTime}ms`);
      
      res.status(200).json(
        responseFormatter.success(
          {
            searchParams,
            count: silos.length,
            silos,
            performance: {
              responseTime: `${responseTime}ms`
            }
          },
          'Silo search completed successfully'
        )
      );
    } catch (error) {
      performanceMonitor.trackError(error, req);
      logger.error('❌ Error searching silos:', error);
      
      res.status(500).json(
        responseFormatter.error(
          `Search failed: ${error.message}`,
          500
        )
      );
    }
  }

  // ==============================
  // 📈 Get Silo Performance Metrics
  // ==============================
  async getSiloPerformance(req, res) {
    const startTime = Date.now();
    const { id } = req.params;
    const { timeRange = '24h' } = req.query;
    
    try {
      logger.info(`📈 Fetching performance metrics for silo ${id}...`);
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(
          responseFormatter.error('Invalid silo ID provided', 400)
        );
      }
      
      const validTimeRanges = ['1h', '6h', '24h', '7d', '30d'];
      if (!validTimeRanges.includes(timeRange)) {
        return res.status(400).json(
          responseFormatter.error('Invalid time range. Use: 1h, 6h, 24h, 7d, 30d', 400)
        );
      }
      
      const metrics = await SiloService.getSiloPerformanceMetrics(parseInt(id), timeRange);
      const responseTime = Date.now() - startTime;
      
      logger.success(`✅ Retrieved performance metrics for silo ${id} in ${responseTime}ms`);
      
      res.status(200).json(
        responseFormatter.success(
          {
            siloId: parseInt(id),
            timeRange,
            metrics,
            performance: {
              responseTime: `${responseTime}ms`
            }
          },
          `Performance metrics for silo ${id} retrieved successfully`
        )
      );
    } catch (error) {
      performanceMonitor.trackError(error, req);
      logger.error(`❌ Error fetching performance for silo ${id}:`, error);
      
      res.status(500).json(
        responseFormatter.error(
          `Failed to retrieve performance metrics: ${error.message}`,
          500
        )
      );
    }
  }

  // ==============================
  // 📊 Get Latest Silo Readings (Ultra Fast)
  // ==============================
  async getLatestSiloReadings(req, res) {
    const startTime = Date.now();
    
    try {
      const siloIds = this.extractIds(req.query.silo_id);
      const options = {
        timeWindow: parseInt(req.query.hours) || 1
      };
      
      if (siloIds.length === 0) {
        return res.status(400).json(
          responseFormatter.error('At least one silo_id is required', 400)
        );
      }
      
      logger.info(`⚡ Fetching latest readings for silos [${siloIds.join(',')}]...`);
      
      const readings = await ReadingService.getLatestReadings('silo', siloIds, options);
      const responseTime = Date.now() - startTime;
      
      logger.success(`✅ Retrieved latest readings in ${responseTime}ms`);
      
      res.status(200).json(
        responseFormatter.success(
          {
            siloIds,
            timeWindow: `${options.timeWindow} hour(s)`,
            ...readings,
            performance: {
              responseTime: `${responseTime}ms`,
              cached: responseTime < 100
            }
          },
          'Latest silo readings retrieved successfully'
        )
      );
    } catch (error) {
      performanceMonitor.trackError(error, req);
      logger.error('❌ Error fetching latest readings:', error);
      
      res.status(500).json(
        responseFormatter.error(
          `Failed to retrieve latest readings: ${error.message}`,
          500
        )
      );
    }
  }

  // ==============================
  // 📊 Get Averaged Silo Readings
  // ==============================
  async getAveragedSiloReadings(req, res) {
    const startTime = Date.now();
    
    try {
      const siloIds = this.extractIds(req.query.silo_id);
      const options = {
        start: req.query.start,
        end: req.query.end,
        limit: Math.min(parseInt(req.query.limit) || 5000, 10000),
        average: true,
        latest: req.query.latest === 'true'
      };
      
      if (siloIds.length === 0) {
        return res.status(400).json(
          responseFormatter.error('At least one silo_id is required', 400)
        );
      }
      
      logger.info(`📊 Fetching averaged readings for silos [${siloIds.join(',')}]...`);
      
      const readings = await ReadingService.getReadingsBySilo(siloIds, options);
      const responseTime = Date.now() - startTime;
      
      logger.success(`✅ Retrieved averaged readings in ${responseTime}ms`);
      
      res.status(200).json(
        responseFormatter.success(
          {
            siloIds,
            options: {
              ...options,
              averaged: true
            },
            ...readings,
            performance: {
              responseTime: `${responseTime}ms`
            }
          },
          'Averaged silo readings retrieved successfully'
        )
      );
    } catch (error) {
      performanceMonitor.trackError(error, req);
      logger.error('❌ Error fetching averaged readings:', error);
      
      res.status(500).json(
        responseFormatter.error(
          `Failed to retrieve averaged readings: ${error.message}`,
          500
        )
      );
    }
  }

  // ==============================
  // 🛠️ Helper Methods
  // ==============================
  extractIds(param) {
    if (!param) return [];
    
    // Handle both single ID and array of IDs
    const ids = Array.isArray(param) ? param : [param];
    return ids
      .map(id => parseInt(id))
      .filter(id => !isNaN(id) && id > 0);
  }

  validateTimeRange(start, end) {
    if (start && isNaN(Date.parse(start))) {
      throw new Error('Invalid start date format');
    }
    
    if (end && isNaN(Date.parse(end))) {
      throw new Error('Invalid end date format');
    }
    
    if (start && end && new Date(start) > new Date(end)) {
      throw new Error('Start date cannot be after end date');
    }
  }

  // ==============================
  // 🧹 Cache Management Endpoint
  // ==============================
  async clearSiloCache(req, res) {
    try {
      const { siloId } = req.params;
      
      if (siloId) {
        await SiloService.invalidateSiloCache(parseInt(siloId));
        logger.info(`🧹 Cleared cache for silo ${siloId}`);
        
        res.status(200).json(
          responseFormatter.success(
            { siloId: parseInt(siloId) },
            `Cache cleared for silo ${siloId}`
          )
        );
      } else {
        // Clear all silo caches (admin only)
        await SiloService.invalidateSiloCache('all');
        logger.info('🧹 Cleared all silo caches');
        
        res.status(200).json(
          responseFormatter.success(
            {},
            'All silo caches cleared successfully'
          )
        );
      }
    } catch (error) {
      performanceMonitor.trackError(error, req);
      logger.error('❌ Error clearing cache:', error);
      
      res.status(500).json(
        responseFormatter.error(
          `Failed to clear cache: ${error.message}`,
          500
        )
      );
    }
  }
}

// ==============================
// 🚀 Export Controller Instance
// ==============================
export default new OptimizedSiloController();
