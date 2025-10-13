// ==============================
// 📦 Imports
// ==============================
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';
import { logger } from '../../infrastructure/config/logger.js';
import { pool } from '../../infrastructure/database/db.js';

// ==============================
// 🏗️ Environment Controller Class
// ==============================
export class EnvironmentController {

  // 🔹 جلب درجة الحرارة البيئية الحالية
  async getCurrentTemperature(req, res) {
    try {
      // محاكاة قراءة درجة الحرارة البيئية
      const envTemp = await this._readEnvironmentTemperature();

      res.json(responseFormatter.success(
        {
          temperature: envTemp.temperature,
          humidity: envTemp.humidity,
          pressure: envTemp.pressure,
          timestamp: envTemp.timestamp,
          sensorStatus: envTemp.sensorStatus,
          location: envTemp.location
        },
        'تم جلب درجة الحرارة البيئية بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب سجل درجات الحرارة البيئية
  async getTemperatureHistory(req, res) {
    try {
      const { 
        start_date, 
        end_date, 
        interval = '1h', 
        limit = 100 
      } = req.query;

      const history = await this._getTemperatureHistory(
        start_date, 
        end_date, 
        interval, 
        parseInt(limit)
      );

      res.json(responseFormatter.success(
        {
          readings: history.readings,
          summary: history.summary,
          interval: interval,
          period: {
            start: start_date,
            end: end_date
          }
        },
        'تم جلب سجل درجات الحرارة البيئية بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب إحصائيات درجة الحرارة البيئية
  async getTemperatureStats(req, res) {
    try {
      const { period = '24h' } = req.query;
      
      const stats = await this._getTemperatureStats(period);

      res.json(responseFormatter.success(
        {
          period: period,
          current: stats.current,
          average: stats.average,
          minimum: stats.minimum,
          maximum: stats.maximum,
          trend: stats.trend,
          lastUpdated: stats.lastUpdated
        },
        'تم جلب إحصائيات درجة الحرارة البيئية بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب حالة أجهزة الاستشعار البيئية
  async getSensorStatus(req, res) {
    try {
      const sensorStatus = await this._getSensorStatus();

      res.json(responseFormatter.success(
        {
          sensors: sensorStatus.sensors,
          overallStatus: sensorStatus.overallStatus,
          lastMaintenance: sensorStatus.lastMaintenance,
          nextMaintenance: sensorStatus.nextMaintenance,
          alerts: sensorStatus.alerts
        },
        'تم جلب حالة أجهزة الاستشعار البيئية بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 معايرة أجهزة الاستشعار البيئية
  async calibrateSensors(req, res) {
    try {
      const { sensor_type, reference_value } = req.body;

      if (!sensor_type) {
        return res.status(400).json(
          responseFormatter.error('نوع المستشعر مطلوب', 400)
        );
      }

      const calibrationResult = await this._calibrateSensor(sensor_type, reference_value);

      if (calibrationResult.success) {
        logger.info(`Sensor calibration successful: ${sensor_type}`);
        res.json(responseFormatter.success(
          {
            sensorType: sensor_type,
            oldCalibration: calibrationResult.oldCalibration,
            newCalibration: calibrationResult.newCalibration,
            calibratedAt: new Date().toISOString()
          },
          'تم معايرة المستشعر بنجاح'
        ));
      } else {
        res.status(500).json(
          responseFormatter.error('فشل في معايرة المستشعر', 500)
        );
      }
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 تحديث إعدادات التنبيهات البيئية
  async updateAlertSettings(req, res) {
    try {
      const {
        temperature_min,
        temperature_max,
        humidity_min,
        humidity_max,
        pressure_min,
        pressure_max,
        alert_enabled
      } = req.body;

      const settings = {
        temperatureRange: { min: temperature_min, max: temperature_max },
        humidityRange: { min: humidity_min, max: humidity_max },
        pressureRange: { min: pressure_min, max: pressure_max },
        alertEnabled: alert_enabled !== undefined ? alert_enabled : true
      };

      const success = await this._updateAlertSettings(settings);

      if (success) {
        res.json(responseFormatter.success(
          {
            settings: settings,
            updatedAt: new Date().toISOString()
          },
          'تم تحديث إعدادات التنبيهات البيئية بنجاح'
        ));
      } else {
        res.status(500).json(
          responseFormatter.error('فشل في تحديث إعدادات التنبيهات', 500)
        );
      }
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب إعدادات التنبيهات البيئية
  async getAlertSettings(req, res) {
    try {
      const settings = await this._getAlertSettings();

      res.json(responseFormatter.success(
        settings,
        'تم جلب إعدادات التنبيهات البيئية بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // ==============================
  // 🔧 Private Helper Methods
  // ==============================

  // قراءة درجة الحرارة البيئية الحالية
  async _readEnvironmentTemperature() {
    try {
      // في التطبيق الحقيقي، يجب قراءة البيانات من أجهزة الاستشعار الفعلية
      // هنا نستخدم بيانات وهمية واقعية

      const baseTemp = 25; // درجة حرارة أساسية
      const variation = (Math.random() - 0.5) * 10; // تغيير ±5 درجات
      const temperature = parseFloat((baseTemp + variation).toFixed(1));

      const baseHumidity = 45; // رطوبة أساسية
      const humidityVariation = (Math.random() - 0.5) * 20; // تغيير ±10%
      const humidity = Math.max(0, Math.min(100, parseFloat((baseHumidity + humidityVariation).toFixed(1))));

      const basePressure = 1013.25; // ضغط جوي أساسي (hPa)
      const pressureVariation = (Math.random() - 0.5) * 20; // تغيير ±10 hPa
      const pressure = parseFloat((basePressure + pressureVariation).toFixed(2));

      return {
        temperature: temperature,
        humidity: humidity,
        pressure: pressure,
        timestamp: new Date().toISOString(),
        sensorStatus: 'active',
        location: 'مبنى الصوامع - الطابق الأرضي'
      };
    } catch (error) {
      logger.error('Error reading environment temperature:', error);
      throw new Error('فشل في قراءة درجة الحرارة البيئية');
    }
  }

  // جلب سجل درجات الحرارة البيئية
  async _getTemperatureHistory(startDate, endDate, interval, limit) {
    try {
      // محاكاة بيانات تاريخية
      const readings = [];
      const now = new Date();
      const start = startDate ? new Date(startDate) : new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : now;

      const intervalMs = this._parseInterval(interval);
      const totalReadings = Math.min(limit, Math.floor((end - start) / intervalMs));

      for (let i = 0; i < totalReadings; i++) {
        const timestamp = new Date(start.getTime() + i * intervalMs);
        const baseTemp = 25 + Math.sin(i * 0.1) * 3; // تغيير دوري
        const temperature = parseFloat((baseTemp + (Math.random() - 0.5) * 2).toFixed(1));
        
        readings.push({
          timestamp: timestamp.toISOString(),
          temperature: temperature,
          humidity: parseFloat((45 + (Math.random() - 0.5) * 10).toFixed(1)),
          pressure: parseFloat((1013.25 + (Math.random() - 0.5) * 5).toFixed(2))
        });
      }

      // حساب الملخص
      const temperatures = readings.map(r => r.temperature);
      const summary = {
        count: readings.length,
        average: parseFloat((temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1)),
        minimum: Math.min(...temperatures),
        maximum: Math.max(...temperatures)
      };

      return { readings, summary };
    } catch (error) {
      logger.error('Error getting temperature history:', error);
      throw new Error('فشل في جلب سجل درجات الحرارة');
    }
  }

  // جلب إحصائيات درجة الحرارة
  async _getTemperatureStats(period) {
    try {
      const current = await this._readEnvironmentTemperature();
      
      // محاكاة إحصائيات
      return {
        current: current.temperature,
        average: 24.8,
        minimum: 18.5,
        maximum: 31.2,
        trend: 'stable', // stable, rising, falling
        lastUpdated: current.timestamp
      };
    } catch (error) {
      logger.error('Error getting temperature stats:', error);
      throw new Error('فشل في جلب إحصائيات درجة الحرارة');
    }
  }

  // جلب حالة أجهزة الاستشعار
  async _getSensorStatus() {
    try {
      return {
        sensors: [
          {
            id: 'env_temp_001',
            type: 'temperature',
            status: 'active',
            lastReading: new Date().toISOString(),
            batteryLevel: 85,
            location: 'مبنى الصوامع - الطابق الأرضي'
          },
          {
            id: 'env_hum_001',
            type: 'humidity',
            status: 'active',
            lastReading: new Date().toISOString(),
            batteryLevel: 92,
            location: 'مبنى الصوامع - الطابق الأرضي'
          },
          {
            id: 'env_press_001',
            type: 'pressure',
            status: 'active',
            lastReading: new Date().toISOString(),
            batteryLevel: 78,
            location: 'مبنى الصوامع - الطابق الأرضي'
          }
        ],
        overallStatus: 'healthy',
        lastMaintenance: '2025-01-01T10:00:00Z',
        nextMaintenance: '2025-04-01T10:00:00Z',
        alerts: []
      };
    } catch (error) {
      logger.error('Error getting sensor status:', error);
      throw new Error('فشل في جلب حالة أجهزة الاستشعار');
    }
  }

  // معايرة المستشعر
  async _calibrateSensor(sensorType, referenceValue) {
    try {
      // محاكاة عملية المعايرة
      await new Promise(resolve => setTimeout(resolve, 2000)); // محاكاة وقت المعايرة

      return {
        success: true,
        oldCalibration: {
          offset: 0.5,
          scale: 1.02
        },
        newCalibration: {
          offset: referenceValue ? (referenceValue - 25) : 0,
          scale: 1.0
        }
      };
    } catch (error) {
      logger.error('Error calibrating sensor:', error);
      return { success: false };
    }
  }

  // تحديث إعدادات التنبيهات
  async _updateAlertSettings(settings) {
    try {
      // في التطبيق الحقيقي، يجب حفظ الإعدادات في قاعدة البيانات
      logger.info('Environment alert settings updated:', settings);
      return true;
    } catch (error) {
      logger.error('Error updating alert settings:', error);
      return false;
    }
  }

  // جلب إعدادات التنبيهات
  async _getAlertSettings() {
    try {
      // في التطبيق الحقيقي، يجب جلب الإعدادات من قاعدة البيانات
      return {
        temperatureRange: { min: 15, max: 35 },
        humidityRange: { min: 30, max: 70 },
        pressureRange: { min: 1000, max: 1030 },
        alertEnabled: true,
        notificationMethods: ['sms', 'email'],
        lastUpdated: '2025-01-01T10:00:00Z'
      };
    } catch (error) {
      logger.error('Error getting alert settings:', error);
      throw new Error('فشل في جلب إعدادات التنبيهات');
    }
  }

  // تحليل فترة زمنية إلى ميلي ثانية
  _parseInterval(interval) {
    const units = {
      's': 1000,
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };

    const match = interval.match(/^(\d+)([smhd])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      return value * units[unit];
    }

    return 60 * 60 * 1000; // افتراضي: ساعة واحدة
  }
}
