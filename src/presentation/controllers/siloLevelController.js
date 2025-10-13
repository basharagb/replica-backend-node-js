// ==============================
// 📦 Imports
// ==============================
import { SiloRepository } from '../../infrastructure/repositories/SiloRepository.js';
import { ReadingRepository } from '../../infrastructure/repositories/ReadingRepository.js';
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';
import { logger } from '../../infrastructure/config/logger.js';

const siloRepo = new SiloRepository();
const readingRepo = new ReadingRepository();

// ==============================
// 🏗️ Silo Level Controller Class
// ==============================
export class SiloLevelController {

  // 🔹 تقدير مستوى الملء حسب معرف الصومعة
  async getLevelEstimateById(req, res) {
    try {
      const { id } = req.params;
      const siloId = parseInt(id);

      const silo = await siloRepo.findById(siloId);
      if (!silo) {
        return res.status(404).json(responseFormatter.error('الصومعة غير موجودة', 404));
      }

      const levelEstimate = await this._calculateSiloLevel(siloId);

      res.json(responseFormatter.success(
        {
          siloId: siloId,
          siloNumber: silo.siloNumber,
          levelEstimate: levelEstimate
        },
        'تم تقدير مستوى الملء بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 تقدير مستوى الملء حسب رقم الصومعة
  async getLevelEstimateByNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];

      const results = [];

      for (const siloNumber of siloNumbers) {
        const silo = await siloRepo.findByNumber(siloNumber);
        if (silo) {
          const levelEstimate = await this._calculateSiloLevel(silo.id);
          results.push({
            siloId: silo.id,
            siloNumber: silo.siloNumber,
            levelEstimate: levelEstimate
          });
        } else {
          results.push({
            siloNumber: siloNumber,
            error: 'الصومعة غير موجودة'
          });
        }
      }

      res.json(responseFormatter.success(results, 'تم تقدير مستويات الملء بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 تقدير مستوى الملء لعدة صوامع حسب المعرف
  async getLevelEstimateByIds(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];

      const results = [];

      for (const siloId of siloIds) {
        const silo = await siloRepo.findById(siloId);
        if (silo) {
          const levelEstimate = await this._calculateSiloLevel(siloId);
          results.push({
            siloId: siloId,
            siloNumber: silo.siloNumber,
            levelEstimate: levelEstimate
          });
        } else {
          results.push({
            siloId: siloId,
            error: 'الصومعة غير موجودة'
          });
        }
      }

      res.json(responseFormatter.success(results, 'تم تقدير مستويات الملء بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب إحصائيات مستويات الملء لجميع الصوامع
  async getAllLevelStats(req, res) {
    try {
      const { group_id } = req.query;
      
      let silos;
      if (group_id) {
        // جلب الصوامع حسب المجموعة
        const { pool } = await import('../../infrastructure/database/db.js');
        const [rows] = await pool.query(
          'SELECT id, silo_number, silo_group_id FROM silos WHERE silo_group_id = ? ORDER BY silo_number',
          [parseInt(group_id)]
        );
        silos = rows;
      } else {
        // جلب جميع الصوامع
        silos = await siloRepo.findAll();
      }

      const levelStats = {
        totalSilos: silos.length,
        levels: {
          empty: 0,      // 0-20%
          low: 0,        // 21-40%
          medium: 0,     // 41-70%
          high: 0,       // 71-90%
          full: 0        // 91-100%
        },
        silos: []
      };

      for (const silo of silos) {
        try {
          const levelEstimate = await this._calculateSiloLevel(silo.id);
          const category = this._categorizeFillLevel(levelEstimate.fillPercentage);
          
          levelStats.levels[category]++;
          levelStats.silos.push({
            siloId: silo.id,
            siloNumber: silo.siloNumber || silo.silo_number,
            fillPercentage: levelEstimate.fillPercentage,
            category: category,
            lastUpdated: levelEstimate.lastUpdated
          });
        } catch (error) {
          logger.error(`Error calculating level for silo ${silo.id}:`, error);
          levelStats.silos.push({
            siloId: silo.id,
            siloNumber: silo.siloNumber || silo.silo_number,
            error: 'فشل في حساب مستوى الملء'
          });
        }
      }

      res.json(responseFormatter.success(levelStats, 'تم جلب إحصائيات مستويات الملء بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 تحديث معايير تقدير مستوى الملء
  async updateLevelCalibration(req, res) {
    try {
      const { silo_id, level_thresholds, temperature_thresholds } = req.body;

      if (!silo_id) {
        return res.status(400).json(
          responseFormatter.error('معرف الصومعة مطلوب', 400)
        );
      }

      const silo = await siloRepo.findById(parseInt(silo_id));
      if (!silo) {
        return res.status(404).json(responseFormatter.error('الصومعة غير موجودة', 404));
      }

      // في التطبيق الحقيقي، يجب حفظ معايير المعايرة في قاعدة البيانات
      const calibrationData = {
        siloId: parseInt(silo_id),
        levelThresholds: level_thresholds || {
          empty: 0,
          quarter: 25,
          half: 50,
          threeQuarter: 75,
          full: 100
        },
        temperatureThresholds: temperature_thresholds || {
          disconnect: -127.0,
          normal: { min: 10, max: 40 },
          warning: { min: 40, max: 50 },
          critical: { min: 50, max: 70 }
        },
        updatedAt: new Date().toISOString()
      };

      // محاكاة حفظ البيانات
      logger.info(`Level calibration updated for silo ${silo_id}:`, calibrationData);

      res.json(responseFormatter.success(
        calibrationData,
        'تم تحديث معايير تقدير مستوى الملء بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // ==============================
  // 🔧 Private Helper Methods
  // ==============================

  // حساب مستوى الملء للصومعة باستخدام خوارزمية K-means المبسطة
  async _calculateSiloLevel(siloId) {
    try {
      // جلب أحدث القراءات للصومعة
      const latestReadings = await readingRepo.findLatestBySiloId([siloId]);

      if (!latestReadings || latestReadings.length === 0) {
        return {
          fillPercentage: 0,
          fillLevel: 'unknown',
          confidence: 0,
          method: 'no_data',
          lastUpdated: new Date().toISOString(),
          sensorData: []
        };
      }

      // تنظيم القراءات حسب مستوى المستشعر (0-7)
      const sensorLevels = new Array(8).fill(null);
      const sensorData = [];

      for (const reading of latestReadings) {
        // نحتاج للحصول على معلومات المستشعر
        const sensorInfo = await this._getSensorInfo(reading.sensorId);
        if (sensorInfo) {
          sensorLevels[sensorInfo.sensorIndex] = reading.valueC;
          sensorData.push({
            level: sensorInfo.sensorIndex,
            temperature: reading.valueC,
            status: this._getTemperatureStatus(reading.valueC),
            timestamp: reading.sampleAt
          });
        }
      }

      // تطبيق خوارزمية تقدير مستوى الملء
      const fillEstimate = this._estimateFillLevel(sensorLevels);

      return {
        fillPercentage: fillEstimate.percentage,
        fillLevel: fillEstimate.level,
        confidence: fillEstimate.confidence,
        method: fillEstimate.method,
        lastUpdated: new Date().toISOString(),
        sensorData: sensorData.sort((a, b) => a.level - b.level)
      };
    } catch (error) {
      logger.error(`Error calculating silo level for silo ${siloId}:`, error);
      throw new Error('فشل في حساب مستوى الملء');
    }
  }

  // الحصول على معلومات المستشعر
  async _getSensorInfo(sensorId) {
    try {
      const { pool } = await import('../../infrastructure/database/db.js');
      const [rows] = await pool.query(
        'SELECT sensor_index FROM sensors WHERE id = ?',
        [sensorId]
      );
      
      return rows.length > 0 ? { sensorIndex: rows[0].sensor_index } : null;
    } catch (error) {
      logger.error(`Error getting sensor info for sensor ${sensorId}:`, error);
      return null;
    }
  }

  // تقدير مستوى الملء باستخدام خوارزمية مبسطة
  _estimateFillLevel(sensorLevels) {
    const validReadings = sensorLevels.filter(temp => temp !== null && temp > -127);
    
    if (validReadings.length === 0) {
      return {
        percentage: 0,
        level: 'unknown',
        confidence: 0,
        method: 'no_valid_data'
      };
    }

    // خوارزمية بسيطة: البحث عن أعلى مستوى بدرجة حرارة طبيعية
    // درجات الحرارة العالية تشير إلى وجود المادة المخزنة
    let fillLevel = 0;
    const temperatureThreshold = 25; // درجة حرارة أساسية

    for (let i = sensorLevels.length - 1; i >= 0; i--) {
      const temp = sensorLevels[i];
      if (temp !== null && temp > -127) {
        // إذا كانت درجة الحرارة أعلى من المحيط، فهناك مادة مخزنة
        if (temp > temperatureThreshold) {
          fillLevel = i + 1;
          break;
        }
      }
    }

    const fillPercentage = Math.round((fillLevel / 8) * 100);
    const confidence = Math.min(95, (validReadings.length / 8) * 100);

    return {
      percentage: fillPercentage,
      level: this._getFillLevelName(fillPercentage),
      confidence: confidence,
      method: 'temperature_gradient'
    };
  }

  // الحصول على حالة درجة الحرارة
  _getTemperatureStatus(temperature) {
    if (temperature <= -127) return 'disconnect';
    if (temperature < 10) return 'very_cold';
    if (temperature <= 25) return 'normal';
    if (temperature <= 40) return 'warm';
    if (temperature <= 50) return 'warning';
    return 'critical';
  }

  // الحصول على اسم مستوى الملء
  _getFillLevelName(percentage) {
    if (percentage === 0) return 'empty';
    if (percentage <= 20) return 'very_low';
    if (percentage <= 40) return 'low';
    if (percentage <= 60) return 'medium';
    if (percentage <= 80) return 'high';
    if (percentage < 100) return 'very_high';
    return 'full';
  }

  // تصنيف مستوى الملء
  _categorizeFillLevel(percentage) {
    if (percentage <= 20) return 'empty';
    if (percentage <= 40) return 'low';
    if (percentage <= 70) return 'medium';
    if (percentage <= 90) return 'high';
    return 'full';
  }
}
