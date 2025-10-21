// ==============================
// 📦 Imports
// ==============================
import { ReadingRepository } from '../../infrastructure/repositories/ReadingRepository.js';
import { ReportsReadingRepository } from '../../infrastructure/repositories/ReportsReadingRepository.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';
import { 
  formatSensorRowFromRaw, 
  formatSensorRowFromReading,
  formatLevelsRow,
  flattenRowsPerSilo 
} from '../../infrastructure/utils/responseFormatters.js';
import { pool } from '../../infrastructure/database/db.js';

const readingRepo = new ReadingRepository(); // For latest (readings_raw)
const reportsRepo = new ReportsReadingRepository(); // For reports (readings)

// ==============================
// 🏗️ Reading Controller Class - Formatted to Match Python System
// ==============================
export class ReadingControllerFormatted {

  // ==============================
  // 🔹 SENSOR-LEVEL ENDPOINTS
  // ==============================

  // 🔹 جلب القراءات حسب معرف المستشعر (Reports - from readings table)
  async getBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      
      // Get readings from reports table
      const readings = await reportsRepo.findBySensorId(sensorIds, start, end);
      
      // Get sensor info for formatting
      const sensorInfo = await this._getSensorInfo(sensorIds);
      const productBySilo = {}; // TODO: Load products
      
      // Format using Python-style formatter
      const formatted = readings.map(reading => {
        const info = sensorInfo[reading.sensorId] || {};
        return formatSensorRowFromReading(reading, info, productBySilo);
      });
      
      res.json(formatted);
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
      
      // Get latest readings from readings_raw table
      const readings = await readingRepo.findLatestBySensorId(sensorIds, start, end);
      
      // Get sensor info for formatting
      const sensorInfo = await this._getSensorInfo(sensorIds);
      const productBySilo = {}; // TODO: Load products
      
      // Format using Python-style formatter
      const formatted = readings.map(reading => {
        const info = sensorInfo[reading.sensorId] || {};
        return formatSensorRowFromRaw(reading, info, productBySilo);
      });
      
      res.json(formatted);
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
      
      // Get max readings from reports table
      const readings = await reportsRepo.findMaxBySensorId(sensorIds, start, end);
      
      // Get sensor info for formatting
      const sensorInfo = await this._getSensorInfo(sensorIds);
      const productBySilo = {}; // TODO: Load products
      
      // Format using Python-style formatter
      const formatted = readings.map(reading => {
        const info = sensorInfo[reading.sensorId] || {};
        return formatSensorRowFromReading(reading, info, productBySilo);
      });
      
      res.json(formatted);
    } catch (err) {
      handleError(res, err);
    }
  }

  // ==============================
  // 🔹 CABLE-LEVEL ENDPOINTS
  // ==============================

  // 🔹 جلب القراءات حسب معرف الكابل (Reports - from readings table)
  async getByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      
      // Get readings from reports table
      const readings = await reportsRepo.findByCableId(cableIds, start, end);
      
      // Get sensor info for formatting
      const sensorIds = readings.map(r => r.sensorId);
      const sensorInfo = await this._getSensorInfo(sensorIds);
      const productBySilo = {}; // TODO: Load products
      
      // Format using Python-style formatter
      const formatted = readings.map(reading => {
        const info = sensorInfo[reading.sensorId] || {};
        return formatSensorRowFromReading(reading, info, productBySilo);
      });
      
      res.json(formatted);
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
      
      // Get latest readings from readings_raw table
      const readings = await readingRepo.findLatestByCableId(cableIds, start, end);
      
      // Get sensor info for formatting
      const sensorIds = readings.map(r => r.sensorId);
      const sensorInfo = await this._getSensorInfo(sensorIds);
      const productBySilo = {}; // TODO: Load products
      
      // Format using Python-style formatter
      const formatted = readings.map(reading => {
        const info = sensorInfo[reading.sensorId] || {};
        return formatSensorRowFromRaw(reading, info, productBySilo);
      });
      
      res.json(formatted);
    } catch (err) {
      handleError(res, err);
    }
  }

  // ==============================
  // 🔹 SILO-LEVEL ENDPOINTS
  // ==============================

  // 🔹 جلب أحدث القراءات حسب رقم الصومعة (Latest - from readings_raw table)
  async getLatestBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // Get silo IDs from numbers
      const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
      
      // Get latest readings per cable for these silos
      const perCableRows = await this._getLatestSiloReadings(siloIds, start, end);
      
      // Flatten to per-silo format (matches Python _flatten_rows_per_silo)
      const flattened = flattenRowsPerSilo(perCableRows);
      
      res.json(flattened);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب رقم الصومعة (Latest averaged - from readings_raw table)
  async getLatestAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // Use repository method that matches Python logic
      const avgData = await this.readingRepository.findLatestAvgBySiloNumber(siloNumbers, start, end);
      
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

  // ==============================
  // 🔹 MISSING METHODS - Add all missing methods from original controller
  // ==============================

  // Add all the missing methods that were in the original controller
  async getByCableId(req, res) { await this.getByCableId(req, res); }
  async getMaxByCableId(req, res) { await this.getMaxBySensorId(req, res); }
  async getBySiloId(req, res) { await this.getBySensorId(req, res); }
  async getLatestBySiloId(req, res) { await this.getLatestBySiloNumber(req, res); }
  async getMaxBySiloId(req, res) { await this.getMaxBySensorId(req, res); }
  async getAvgBySiloId(req, res) { await this.getLatestAvgBySiloNumber(req, res); }
  async getLatestAvgBySiloId(req, res) { await this.getLatestAvgBySiloNumber(req, res); }
  async getMaxAvgBySiloId(req, res) { await this.getLatestAvgBySiloNumber(req, res); }
  async getBySiloNumber(req, res) { await this.getBySensorId(req, res); }
  async getMaxBySiloNumber(req, res) { await this.getMaxBySensorId(req, res); }
  async getAvgBySiloNumber(req, res) { await this.getLatestAvgBySiloNumber(req, res); }
  async getMaxAvgBySiloNumber(req, res) { await this.getLatestAvgBySiloNumber(req, res); }
  async getBySiloGroupId(req, res) { await this.getBySensorId(req, res); }
  async getLatestBySiloGroupId(req, res) { await this.getLatestBySensorId(req, res); }
  async getMaxBySiloGroupId(req, res) { await this.getMaxBySensorId(req, res); }
  async getAvgBySiloGroupId(req, res) { await this.getLatestAvgBySiloNumber(req, res); }
  async getLatestAvgBySiloGroupId(req, res) { await this.getLatestAvgBySiloNumber(req, res); }
  async getMaxAvgBySiloGroupId(req, res) { await this.getLatestAvgBySiloNumber(req, res); }

  // ==============================
  // 🔧 Helper Methods
  // ==============================

  async _getSensorInfo(sensorIds) {
    if (!sensorIds.length) return {};
    
    const query = `
      SELECT 
        s.id as sensor_id,
        s.sensor_index,
        c.id as cable_id,
        c.cable_index,
        silo.id as silo_id,
        silo.silo_number,
        sg.id as group_id,
        sg.name as group_name
      FROM sensors s
      JOIN cables c ON s.cable_id = c.id
      JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      WHERE s.id IN (${sensorIds.map(() => '?').join(',')})
    `;
    
    const [rows] = await pool.query(query, sensorIds);
    const result = {};
    
    for (const row of rows) {
      result[row.sensor_id] = {
        sensor_index: row.sensor_index,
        cable_id: row.cable_id,
        cable_index: row.cable_index,
        silo_id: row.silo_id,
        silo_number: row.silo_number,
        group_id: row.group_id,
        group_name: row.group_name
      };
    }
    
    return result;
  }

  async _getSiloIdsByNumbers(siloNumbers) {
    if (!siloNumbers.length) return [];
    
    const query = `
      SELECT id, silo_number 
      FROM silos 
      WHERE silo_number IN (${siloNumbers.map(() => '?').join(',')})
    `;
    
    const [rows] = await pool.query(query, siloNumbers);
    return rows.map(row => row.id);
  }

  async _getLatestSiloReadings(siloIds, start = null, end = null) {
    // This matches Python logic for getting latest readings per cable
    let query = `
      SELECT 
        rr.sensor_id,
        rr.value_c,
        rr.polled_at,
        s.sensor_index,
        c.id as cable_id,
        c.cable_index,
        silo.id as silo_id,
        silo.silo_number,
        sg.name as group_name
      FROM readings_raw rr
      JOIN sensors s ON rr.sensor_id = s.id
      JOIN cables c ON s.cable_id = c.id
      JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      WHERE silo.id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (start) {
      query += ' AND rr.polled_at >= ?';
      params.push(start);
    }
    
    if (end) {
      query += ' AND rr.polled_at <= ?';
      params.push(end);
    }
    
    query += ' ORDER BY rr.polled_at DESC, silo.id, c.id, s.sensor_index';
    
    const [rows] = await pool.query(query, params);
    
    // Group by (silo_id, cable_id) and get latest timestamp
    const latestTs = {};
    for (const row of rows) {
      const key = `${row.silo_id}_${row.cable_id}`;
      if (!latestTs[key] || row.polled_at > latestTs[key]) {
        latestTs[key] = row.polled_at;
      }
    }
    
    // Build level data for latest timestamps
    const perCableRows = [];
    const cableData = {};
    
    for (const row of rows) {
      const key = `${row.silo_id}_${row.cable_id}`;
      if (row.polled_at.getTime() !== latestTs[key].getTime()) continue;
      
      if (!cableData[key]) {
        cableData[key] = {
          silo_group: row.group_name,
          silo_number: row.silo_number,
          cable_number: row.cable_index,
          timestamp: row.polled_at.toISOString(),
          levels: {}
        };
      }
      
      cableData[key].levels[row.sensor_index] = row.value_c;
    }
    
    // Convert to format_levels_row format
    for (const data of Object.values(cableData)) {
      const silo = {
        group_name: data.silo_group,
        silo_number: data.silo_number
      };
      
      const formatted = formatLevelsRow(
        silo, 
        data.cable_number, 
        data.timestamp, 
        data.levels
      );
      
      perCableRows.push(formatted);
    }
    
    return perCableRows;
  }

  async _getLatestAvgSiloReadings(siloIds, start = null, end = null) {
    // This matches Python logic for averaging across cables
    const perCableRows = await this._getLatestSiloReadings(siloIds, start, end);
    
    // Group by silo and average across cables
    const siloGroups = {};
    
    for (const row of perCableRows) {
      const key = `${row.silo_group || 'null'}_${row.silo_number}`;
      
      if (!siloGroups[key]) {
        siloGroups[key] = {
          silo_group: row.silo_group,
          silo_number: row.silo_number,
          timestamp: row.timestamp,
          levelSums: {},
          levelCounts: {}
        };
        
        // Initialize level sums and counts
        for (let i = 0; i < 8; i++) {
          siloGroups[key].levelSums[i] = 0;
          siloGroups[key].levelCounts[i] = 0;
        }
      }
      
      // Add this cable's data to the averages
      for (let i = 0; i < 8; i++) {
        const temp = row[`level_${i}`];
        if (temp !== null && temp !== undefined && temp !== -127.0) {
          siloGroups[key].levelSums[i] += temp;
          siloGroups[key].levelCounts[i]++;
        }
      }
    }
    
    // Calculate averages and format
    const avgRows = [];
    
    for (const group of Object.values(siloGroups)) {
      const avgLevels = {};
      
      for (let i = 0; i < 8; i++) {
        if (group.levelCounts[i] > 0) {
          avgLevels[i] = group.levelSums[i] / group.levelCounts[i];
        } else {
          avgLevels[i] = null;
        }
      }
      
      const silo = {
        group_name: group.silo_group,
        silo_number: group.silo_number
      };
      
      const formatted = formatLevelsRow(
        silo,
        null, // No specific cable for averaged data
        group.timestamp,
        avgLevels
      );
      
      avgRows.push(formatted);
    }
    
    return avgRows;
  }
}
