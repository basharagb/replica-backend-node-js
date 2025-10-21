// ==============================
// 📦 Imports
// ==============================
import { ReadingRepository } from '../../infrastructure/repositories/ReadingRepository.js';
import { ReportsReadingRepository } from '../../infrastructure/repositories/ReportsReadingRepository.js';
import { pool } from '../../infrastructure/database/db.js';
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';
import { 
  formatLevelsRow, 
  flattenRowsPerSilo,
  formatSensorRowFromRaw,
  formatSensorRowFromReading 
} from '../../infrastructure/utils/responseFormatters.js';

const readingRepo = new ReadingRepository(); // For latest (readings_raw)
const reportsRepo = new ReportsReadingRepository(); // For reports (readings)

// ==============================
// 🏗️ Reading Controller Class
// ==============================
export class ReadingController {

  // 🔹 جلب القراءات حسب معرف المستشعر (Reports - from readings table)
  async getBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySensorId(sensorIds, start, end);
      
      // Format to sensor-level format matching old Python system
      const formattedData = readings.map(reading => ({
        sensor_id: reading.sensorId,
        group_id: reading.siloGroup,
        silo_number: reading.siloNumber,
        cable_index: reading.cableIndex,
        level_index: reading.sensorIndex,
        state: this._getTemperatureState(reading.temperature),
        color: this._getTemperatureColor(reading.temperature),
        temperature: reading.temperature ? parseFloat(reading.temperature.toFixed(2)) : null,
        timestamp: reading.timestamp
      }));
      
      res.json(formattedData);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف المستشعر (Latest - from readings_raw table)
  async getLatestBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findLatestBySensorId(sensorIds, start, end);
      
      // Format to sensor-level format matching old Python system
      const formattedData = readings.map(reading => ({
        sensor_id: reading.sensor_id,
        group_id: reading.siloGroup,
        silo_number: reading.siloNumber,
        cable_index: reading.cableIndex,
        level_index: reading.sensorIndex,
        state: this._getTemperatureState(reading.temperature),
        color: this._getTemperatureColor(reading.temperature),
        temperature: reading.temperature ? parseFloat(reading.temperature.toFixed(2)) : null,
        timestamp: reading.timestamp
      }));
      
      res.json(formattedData);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف المستشعر (Reports - from readings table)
  async getMaxBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySensorId(sensorIds, start, end); // Use reports for max
      
      // Format to sensor-level format matching old Python system
      const formattedData = readings.map(reading => ({
        sensor_id: reading.sensorId,
        group_id: reading.siloGroup,
        silo_number: reading.siloNumber,
        cable_index: reading.cableIndex,
        level_index: reading.sensorIndex,
        state: this._getTemperatureState(reading.temperature),
        color: this._getTemperatureColor(reading.temperature),
        temperature: reading.temperature ? parseFloat(reading.temperature.toFixed(2)) : null,
        timestamp: reading.timestamp
      }));
      
      res.json(formattedData);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب معرف الكابل (Reports - from readings table)
  async getByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findByCableId(cableIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الكابل (Latest - from readings_raw table)
  async getLatestByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findLatestByCableId(cableIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الكابل (Reports - from readings table)
  async getMaxByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findByCableId(cableIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب معرف الصومعة (Reports - from readings table)
  async getBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الصومعة (Latest - from readings_raw table)
  async getLatestBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findLatestBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الصومعة (Reports - from readings table)
  async getMaxBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب معرف الصومعة (Reports - from readings table)
  async getAvgBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloId(siloIds, start, end); // Use basic method for now
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب معرف الصومعة (Latest - from readings_raw table)
  async getLatestAvgBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await readingRepo.findLatestAvgBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب معرف الصومعة (Reports - from readings table)
  async getMaxAvgBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloId(siloIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب رقم الصومعة (Maintenance - from readings table, level-based format)
  async getBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloNumber(siloNumbers, start, end);
      
      // Group readings by (silo, cable, timestamp) for level-based format
      const grouped = {};
      const meta = {};
      
      for (const reading of readings) {
        const key = `${reading.siloId}_${reading.cableIndex}_${reading.timestamp.toISOString()}`;
        if (!grouped[key]) {
          grouped[key] = {};
          meta[key] = {
            silo: {
              silo_number: reading.siloNumber,
              group_name: reading.siloGroup
            },
            cable_number: reading.cableIndex,
            timestamp: reading.timestamp.toISOString()
          };
        }
        grouped[key][reading.sensorIndex] = reading.temperature;
      }
      
      // Format to level-based format matching old Python system
      const formattedRows = Object.keys(grouped).map(key => {
        const levels = grouped[key];
        const { silo, cable_number, timestamp } = meta[key];
        
        return formatLevelsRow(
          silo,
          cable_number,
          timestamp,
          levels
        );
      });
      
      // Flatten rows per silo (matching old Python _flatten_rows_per_silo)
      const flattened = flattenRowsPerSilo(formattedRows);
      res.json(flattened);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب رقم الصومعة (Latest - from readings_raw table)
  async getLatestBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const rawData = await readingRepo.findLatestBySiloNumber(siloNumbers, start, end);
      
      // Format data using the old Python system structure
      const formattedRows = rawData.map(data => 
        formatLevelsRow(
          data.silo, 
          data.cable_number, 
          data.timestamp.toISOString(), 
          data.levels
        )
      );
      
      // Flatten to combine multiple cables per silo into single rows
      const flattened = flattenRowsPerSilo(formattedRows);
      res.json(flattened);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب رقم الصومعة (Maintenance - from readings table, level-based format)
  async getMaxBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloNumber(siloNumbers, start, end);
      
      // Get max temperature per sensor per day (matching old Python logic)
      const maxReadings = this._getMaxReadingsPerSensorPerDay(readings);
      
      // Group max readings by (silo, cable, day) for level-based format
      const grouped = {};
      const meta = {};
      
      for (const reading of maxReadings) {
        const dayKey = reading.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
        const key = `${reading.siloId}_${reading.cableIndex}_${dayKey}`;
        if (!grouped[key]) {
          grouped[key] = {};
          meta[key] = {
            silo: {
              silo_number: reading.siloNumber,
              group_name: reading.siloGroup
            },
            cable_number: reading.cableIndex,
            timestamp: reading.timestamp.toISOString()
          };
        }
        grouped[key][reading.sensorIndex] = reading.temperature;
      }
      
      // Format to level-based format matching old Python system
      const formattedRows = Object.keys(grouped).map(key => {
        const levels = grouped[key];
        const { silo, cable_number, timestamp } = meta[key];
        
        return formatLevelsRow(
          silo,
          cable_number,
          timestamp,
          levels
        );
      });
      
      // Flatten rows per silo (matching old Python _flatten_rows_per_silo)
      const flattened = flattenRowsPerSilo(formattedRows);
      res.json(flattened);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب رقم الصومعة (Reports - from readings table, level-based format)
  async getAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloNumber(siloNumbers, start, end);
      
      // Group by (silo, timestamp) first - matching Python key = (silo.id, ts_iso)
      const grouped = {};
      const meta = {};
      
      for (const reading of readings) {
        // Group by silo AND timestamp to get multiple rows per silo across date range
        const timestampKey = reading.timestamp.toISOString();
        const key = `${reading.siloId}_${timestampKey}`;
        
        if (!grouped[key]) {
          grouped[key] = {};
          meta[key] = {
            silo: {
              silo_number: reading.siloNumber,
              group_name: reading.siloGroup
            },
            timestamp: timestampKey
          };
        }
        
        // Collect multiple readings per sensor per timestamp (matching Python level_lists)
        if (!grouped[key][reading.sensorIndex]) {
          grouped[key][reading.sensorIndex] = [];
        }
        if (reading.temperature !== null && reading.temperature !== -127.0) {
          grouped[key][reading.sensorIndex].push(reading.temperature);
        }
      }
      
      // Average the temperature lists for each sensor level (matching Python level_lists_to_avg)
      for (const key of Object.keys(grouped)) {
        for (const sensorIndex of Object.keys(grouped[key])) {
          const temps = grouped[key][sensorIndex];
          grouped[key][sensorIndex] = temps.length > 0 
            ? temps.reduce((sum, temp) => sum + temp, 0) / temps.length
            : null;
        }
      }
      
      // Format to level-based format matching old Python system (cable_number: null for averaged)
      const formattedRows = Object.keys(grouped).map(key => {
        const levels = grouped[key];
        const { silo, timestamp } = meta[key];
        
        return formatLevelsRow(
          silo,
          null, // cable_number: null for averaged data
          timestamp,
          levels
        );
      });
      
      // Sort by silo_number then timestamp (no flattening needed for averaged data)
      const sorted = formattedRows.sort((a, b) => {
        if (a.silo_number !== b.silo_number) return a.silo_number - b.silo_number;
        return a.timestamp.localeCompare(b.timestamp);
      });
      
      res.json(sorted);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب رقم الصومعة (Latest - from readings_raw table)
  async getLatestAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // Use repository method that matches Python logic
      const avgData = await readingRepo.findLatestAvgBySiloNumber(siloNumbers, start, end);
      
      // Format each silo's data using formatLevelsRow (matching Python format_levels_row)
      const formattedRows = avgData.map(siloData => {
        const silo = {
          silo_number: siloData.silo_number,
          group_name: siloData.group_name
        };
        
        return formatLevelsRow(
          silo,
          null, // No specific cable for averaged data
          siloData.timestamp.toISOString(),
          siloData.levels
        );
      });
      
      res.json(formattedRows);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب رقم الصومعة (Reports - from readings table, level-based format)
  async getMaxAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloNumber(siloNumbers, start, end);
      
      // Group by (silo, timestamp) first - matching Python key = (silo.id, ts_iso)
      const grouped = {};
      const meta = {};
      
      for (const reading of readings) {
        // Group by silo AND timestamp to get multiple rows per silo across date range
        const timestampKey = reading.timestamp.toISOString();
        const key = `${reading.siloId}_${timestampKey}`;
        
        if (!grouped[key]) {
          grouped[key] = {};
          meta[key] = {
            silo: {
              silo_number: reading.siloNumber,
              group_name: reading.siloGroup
            },
            timestamp: timestampKey
          };
        }
        
        // Take max temperature per sensor per timestamp
        if (reading.temperature !== null && reading.temperature !== -127.0) {
          if (!grouped[key][reading.sensorIndex] || reading.temperature > grouped[key][reading.sensorIndex]) {
            grouped[key][reading.sensorIndex] = reading.temperature;
          }
        }
      }
      
      // Format to level-based format matching old Python system (cable_number: null for averaged)
      const formattedRows = Object.keys(grouped).map(key => {
        const levels = grouped[key];
        const { silo, timestamp } = meta[key];
        
        return formatLevelsRow(
          silo,
          null, // cable_number: null for averaged data
          timestamp,
          levels
        );
      });
      
      // Sort by silo_number then timestamp (no flattening needed for averaged data)
      const sorted = formattedRows.sort((a, b) => {
        if (a.silo_number !== b.silo_number) return a.silo_number - b.silo_number;
        return a.timestamp.localeCompare(b.timestamp);
      });
      
      res.json(sorted);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب معرف مجموعة الصوامع (Reports - from readings table)
  async getBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloGroupId(siloGroupIds, start, end);
      
      // Format to sensor-level format matching old Python system
      const formattedData = readings.map(reading => ({
        sensor_id: reading.sensorId,
        group_id: reading.siloGroup,
        silo_number: reading.siloNumber,
        cable_index: reading.cableIndex,
        level_index: reading.sensorIndex,
        state: this._getTemperatureState(reading.temperature),
        color: this._getTemperatureColor(reading.temperature),
        temperature: reading.temperature ? parseFloat(reading.temperature.toFixed(2)) : null,
        timestamp: reading.timestamp
      }));
      
      res.json(formattedData);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔧 Helper method to get temperature state
  _getTemperatureState(temp) {
    if (temp === null || temp === undefined || temp === -127.0) {
      return 'disconnect';
    }
    if (temp >= 40) return 'critical';
    if (temp >= 35) return 'warn';
    return 'normal';
  }

  // 🔧 Helper method to get temperature color
  _getTemperatureColor(temp) {
    if (temp === null || temp === undefined || temp === -127.0) {
      return '#8c9494'; // disconnect
    }
    if (temp >= 40) return '#d14141'; // critical
    if (temp >= 35) return '#c7c150'; // warn
    return '#46d446'; // normal
  }

  // 🔹 جلب أحدث القراءات حسب معرف مجموعة الصوامع (Latest - from readings_raw table)
  async getLatestBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      // First get silo numbers for the given group IDs
      let siloQuery = `
        SELECT silo_number FROM silos WHERE silo_group_id IN (${siloGroupIds.map(() => '?').join(',')})
      `;
      const [siloRows] = await pool.query(siloQuery, siloGroupIds);
      const siloNumbers = siloRows.map(row => row.silo_number);
      
      if (siloNumbers.length === 0) {
        return res.json([]);
      }
      
      const { start, end } = req.query;
      const rawData = await readingRepo.findLatestBySiloNumber(siloNumbers, start, end);
      
      // Format data using the old Python system structure
      const formattedRows = rawData.map(data => 
        formatLevelsRow(
          data.silo, 
          data.cable_number, 
          data.timestamp.toISOString(), 
          data.levels
        )
      );
      
      // Flatten to combine multiple cables per silo into single rows
      const flattened = flattenRowsPerSilo(formattedRows);
      res.json(flattened);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف مجموعة الصوامع (Reports - from readings table)
  async getMaxBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloGroupId(siloGroupIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب معرف مجموعة الصوامع (Reports - from readings table, level-based format)
  async getAvgBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloGroupId(siloGroupIds, start, end);
      
      // Group by (silo, timestamp) first - matching Python key = (silo.id, ts_iso)
      const grouped = {};
      const meta = {};
      
      for (const reading of readings) {
        // Group by silo AND timestamp to get multiple rows per silo across date range
        const timestampKey = reading.timestamp.toISOString();
        const key = `${reading.siloId}_${timestampKey}`;
        
        if (!grouped[key]) {
          grouped[key] = {};
          meta[key] = {
            silo: {
              silo_number: reading.siloNumber,
              group_name: reading.siloGroup
            },
            timestamp: timestampKey
          };
        }
        
        // Collect multiple readings per sensor per timestamp (matching Python level_lists)
        if (!grouped[key][reading.sensorIndex]) {
          grouped[key][reading.sensorIndex] = [];
        }
        if (reading.temperature !== null && reading.temperature !== -127.0) {
          grouped[key][reading.sensorIndex].push(reading.temperature);
        }
      }
      
      // Average the temperature lists for each sensor level (matching Python level_lists_to_avg)
      for (const key of Object.keys(grouped)) {
        for (const sensorIndex of Object.keys(grouped[key])) {
          const temps = grouped[key][sensorIndex];
          grouped[key][sensorIndex] = temps.length > 0 
            ? temps.reduce((sum, temp) => sum + temp, 0) / temps.length
            : null;
        }
      }
      
      // Format to level-based format matching old Python system (cable_number: null for averaged)
      const formattedRows = Object.keys(grouped).map(key => {
        const levels = grouped[key];
        const { silo, timestamp } = meta[key];
        
        return formatLevelsRow(
          silo,
          null, // cable_number: null for averaged data
          timestamp,
          levels
        );
      });
      
      // Sort by silo_number then timestamp (no flattening needed for averaged data)
      const sorted = formattedRows.sort((a, b) => {
        if (a.silo_number !== b.silo_number) return a.silo_number - b.silo_number;
        return a.timestamp.localeCompare(b.timestamp);
      });
      
      res.json(sorted);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب معرف مجموعة الصوامع (Latest - from readings_raw table)
  async getLatestAvgBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const avgData = await readingRepo.findLatestAvgBySiloGroupId(siloGroupIds, start, end);
      
      // Format each silo's data using formatLevelsRow (matching Python format_levels_row)
      const formattedRows = avgData.map(siloData => {
        const silo = {
          silo_number: siloData.silo_number,
          group_name: siloData.group_name
        };
        
        return formatLevelsRow(
          silo,
          null, // No specific cable for averaged data
          siloData.timestamp.toISOString(),
          siloData.levels
        );
      });
      
      res.json(formattedRows);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب معرف مجموعة الصوامع (Reports - from readings table, level-based format)
  async getMaxAvgBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      const readings = await reportsRepo.findBySiloGroupId(siloGroupIds, start, end);
      
      // Group by (silo, timestamp) first - matching Python key = (silo.id, ts_iso)
      const grouped = {};
      const meta = {};
      
      for (const reading of readings) {
        // Group by silo AND timestamp to get multiple rows per silo across date range
        const timestampKey = reading.timestamp.toISOString();
        const key = `${reading.siloId}_${timestampKey}`;
        
        if (!grouped[key]) {
          grouped[key] = {};
          meta[key] = {
            silo: {
              silo_number: reading.siloNumber,
              group_name: reading.siloGroup
            },
            timestamp: timestampKey
          };
        }
        
        // Take max temperature per sensor per timestamp
        if (reading.temperature !== null && reading.temperature !== -127.0) {
          if (!grouped[key][reading.sensorIndex] || reading.temperature > grouped[key][reading.sensorIndex]) {
            grouped[key][reading.sensorIndex] = reading.temperature;
          }
        }
      }
      
      // Format to level-based format matching old Python system (cable_number: null for averaged)
      const formattedRows = Object.keys(grouped).map(key => {
        const levels = grouped[key];
        const { silo, timestamp } = meta[key];
        
        return formatLevelsRow(
          silo,
          null, // cable_number: null for averaged data
          timestamp,
          levels
        );
      });
      
      // Sort by silo_number then timestamp (no flattening needed for averaged data)
      const sorted = formattedRows.sort((a, b) => {
        if (a.silo_number !== b.silo_number) return a.silo_number - b.silo_number;
        return a.timestamp.localeCompare(b.timestamp);
      });
      
      res.json(sorted);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔧 Helper method to get max readings per sensor per day (matching old Python logic)
  _getMaxReadingsPerSensorPerDay(readings) {
    const maxPerSensorPerDay = {};
    
    for (const reading of readings) {
      const dayKey = reading.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
      const key = `${reading.sensorId}_${dayKey}`;
      
      if (!maxPerSensorPerDay[key] || reading.temperature > maxPerSensorPerDay[key].temperature) {
        maxPerSensorPerDay[key] = reading;
      }
    }
    
    return Object.values(maxPerSensorPerDay).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // 🔧 Helper method to get average readings per sensor
  _getAvgReadingsPerSensor(readings) {
    const avgPerSensor = {};
    const countPerSensor = {};
    
    for (const reading of readings) {
      const sensorId = reading.sensorId;
      
      if (!avgPerSensor[sensorId]) {
        avgPerSensor[sensorId] = {
          ...reading,
          temperature: 0,
          count: 0
        };
        countPerSensor[sensorId] = 0;
      }
      
      if (reading.temperature !== null && reading.temperature !== -127.0) {
        avgPerSensor[sensorId].temperature += reading.temperature;
        countPerSensor[sensorId]++;
      }
    }
    
    // Calculate averages
    for (const sensorId in avgPerSensor) {
      if (countPerSensor[sensorId] > 0) {
        avgPerSensor[sensorId].temperature = avgPerSensor[sensorId].temperature / countPerSensor[sensorId];
      } else {
        avgPerSensor[sensorId].temperature = null;
      }
    }
    
    return Object.values(avgPerSensor);
  }

  // 🔧 Helper method to format reports data to match old Python system structure (DEPRECATED - keeping for level-based endpoints)
  _formatReportsToLevelsStructure(readings) {
    if (!readings || readings.length === 0) {
      return [];
    }

    // Group readings by silo and timestamp
    const grouped = {};
    
    for (const reading of readings) {
      const key = `${reading.siloNumber}_${reading.timestamp}`;
      if (!grouped[key]) {
        grouped[key] = {
          silo_group: reading.siloGroup,
          silo_number: reading.siloNumber,
          cable_number: null, // Reports are averaged across cables
          timestamp: reading.timestamp,
          levels: {}
        };
      }
      
      // Set level temperature
      grouped[key].levels[reading.levelIndex] = reading.temperature;
    }

    // Convert to format_levels_row structure
    const result = [];
    for (const group of Object.values(grouped)) {
      const row = {
        silo_group: group.silo_group,
        silo_number: group.silo_number,
        cable_number: group.cable_number,
        timestamp: group.timestamp
      };

      // Add level_0 to level_7 and corresponding colors
      for (let level = 0; level < 8; level++) {
        const temp = group.levels[level];
        row[`level_${level}`] = temp ? parseFloat(temp.toFixed(2)) : null;
        
        // Add color based on temperature thresholds (matching old Python system)
        let color = '#8c9494'; // disconnect/missing color
        if (temp !== null && temp !== undefined && temp !== -127.0) {
          if (temp >= 40) {
            color = '#d14141'; // critical
          } else if (temp >= 35) {
            color = '#c7c150'; // warn
          } else {
            color = '#46d446'; // normal
          }
        }
        row[`color_${level}`] = color;
      }

      // Set overall silo color to worst level color
      const colors = [];
      for (let level = 0; level < 8; level++) {
        colors.push(row[`color_${level}`]);
      }
      
      // Priority: critical > warn > normal > disconnect
      if (colors.includes('#d14141')) {
        row.silo_color = '#d14141';
      } else if (colors.includes('#c7c150')) {
        row.silo_color = '#c7c150';
      } else if (colors.includes('#46d446')) {
        row.silo_color = '#46d446';
      } else {
        row.silo_color = '#8c9494';
      }

      result.push(row);
    }

    // Sort by silo number and timestamp
    result.sort((a, b) => {
      if (a.silo_number !== b.silo_number) {
        return a.silo_number - b.silo_number;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return result;
  }
}
