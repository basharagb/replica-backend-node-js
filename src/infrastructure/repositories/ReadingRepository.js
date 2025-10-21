// ==============================
// 📦 Imports
// ==============================
import { pool } from '../database/db.js';
import { Reading } from '../../domain/entities/Reading.js';
import { logger } from '../config/logger.js';

// ==============================
// 🏗️ Reading Repository Class
// ==============================
export class ReadingRepository {
  
  // 🔹 جلب القراءات حسب معرف المستشعر
  async findBySensorId(sensorIds, startDate = null, endDate = null) {
    let query = `
      SELECT id, sensor_id, value_c, polled_at
      FROM readings_raw
      WHERE sensor_id IN (${sensorIds.map(() => '?').join(',')})
    `;
    
    const params = [...sensorIds];
    
    if (startDate) {
      query += ' AND polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND polled_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY polled_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findBySensorId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by sensor');
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف المستشعر
  async findLatestBySensorId(sensorIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.id, r1.sensor_id, r1.value_c, r1.polled_at
      FROM readings_raw r1
      INNER JOIN (
        SELECT sensor_id, MAX(polled_at) as max_polled_at
        FROM readings_raw
        WHERE sensor_id IN (${sensorIds.map(() => '?').join(',')})
    `;
    
    const params = [...sensorIds];
    
    if (startDate) {
      query += ' AND polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY sensor_id
      ) r2 ON r1.sensor_id = r2.sensor_id AND r1.polled_at = r2.max_polled_at
      ORDER BY r1.sensor_id
    `;
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestBySensorId] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest readings by sensor');
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف المستشعر
  async findMaxBySensorId(sensorIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.id, r1.sensor_id, r1.value_c, r1.polled_at
      FROM readings_raw r1
      INNER JOIN (
        SELECT sensor_id, MAX(value_c) as max_value_c
        FROM readings_raw
        WHERE sensor_id IN (${sensorIds.map(() => '?').join(',')})
    `;
    
    const params = [...sensorIds];
    
    if (startDate) {
      query += ' AND polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY sensor_id
      ) r2 ON r1.sensor_id = r2.sensor_id AND r1.value_c = r2.max_value_c
      ORDER BY r1.sensor_id
    `;
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findMaxBySensorId] ❌ ${err.message}`);
      throw new Error('Database error while fetching max readings by sensor');
    }
  }

  // 🔹 جلب القراءات حسب معرف الكابل
  async findByCableId(cableIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.value_c, r.polled_at
      FROM readings_raw r
      INNER JOIN sensors s ON r.sensor_id = s.id
      WHERE s.cable_id IN (${cableIds.map(() => '?').join(',')})
    `;
    
    const params = [...cableIds];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY r.polled_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findByCableId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by cable');
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الكابل
  async findLatestByCableId(cableIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.id, r1.sensor_id, r1.value_c, r1.polled_at
      FROM readings_raw r1
      INNER JOIN sensors s ON r1.sensor_id = s.id
      INNER JOIN (
        SELECT r.sensor_id, MAX(r.polled_at) as max_polled_at
        FROM readings_raw r
        INNER JOIN sensors s2 ON r.sensor_id = s2.id
        WHERE s2.cable_id IN (${cableIds.map(() => '?').join(',')})
    `;
    
    const params = [...cableIds];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY r.sensor_id
      ) r2 ON r1.sensor_id = r2.sensor_id AND r1.polled_at = r2.max_polled_at
      WHERE s.cable_id IN (${cableIds.map(() => '?').join(',')})
      ORDER BY s.cable_id, s.sensor_index
    `;
    
    params.push(...cableIds);
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestByCableId] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest readings by cable');
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الكابل
  async findMaxByCableId(cableIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.id, r1.sensor_id, r1.value_c, r1.polled_at
      FROM readings_raw r1
      INNER JOIN sensors s ON r1.sensor_id = s.id
      INNER JOIN (
        SELECT r.sensor_id, MAX(r.value_c) as max_value_c
        FROM readings_raw r
        INNER JOIN sensors s2 ON r.sensor_id = s2.id
        WHERE s2.cable_id IN (${cableIds.map(() => '?').join(',')})
    `;
    
    const params = [...cableIds];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY r.sensor_id
      ) r2 ON r1.sensor_id = r2.sensor_id AND r1.value_c = r2.max_value_c
      WHERE s.cable_id IN (${cableIds.map(() => '?').join(',')})
      ORDER BY s.cable_id, s.sensor_index
    `;
    
    params.push(...cableIds);
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findMaxByCableId] ❌ ${err.message}`);
      throw new Error('Database error while fetching max readings by cable');
    }
  }

  // 🔹 جلب القراءات حسب معرف الصومعة
  async findBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.value_c, r.polled_at
      FROM readings_raw r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY r.polled_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo');
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الصومعة
  async findLatestBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.id, r1.sensor_id, r1.value_c, r1.polled_at
      FROM readings_raw r1
      INNER JOIN sensors s ON r1.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN (
        SELECT r.sensor_id, MAX(r.polled_at) as max_polled_at
        FROM readings_raw r
        INNER JOIN sensors s2 ON r.sensor_id = s2.id
        INNER JOIN cables c2 ON s2.cable_id = c2.id
        WHERE c2.silo_id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY r.sensor_id
      ) r2 ON r1.sensor_id = r2.sensor_id AND r1.polled_at = r2.max_polled_at
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
      ORDER BY c.silo_id, c.cable_index, s.sensor_index
    `;
    
    params.push(...siloIds);
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest readings by silo');
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الصومعة
  async findMaxBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.id, r1.sensor_id, r1.value_c, r1.polled_at
      FROM readings_raw r1
      INNER JOIN sensors s ON r1.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN (
        SELECT r.sensor_id, MAX(r.value_c) as max_value_c
        FROM readings_raw r
        INNER JOIN sensors s2 ON r.sensor_id = s2.id
        INNER JOIN cables c2 ON s2.cable_id = c2.id
        WHERE c2.silo_id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY r.sensor_id
      ) r2 ON r1.sensor_id = r2.sensor_id AND r1.value_c = r2.max_value_c
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
      ORDER BY c.silo_id, c.cable_index, s.sensor_index
    `;
    
    params.push(...siloIds);
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findMaxBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching max readings by silo');
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب معرف الصومعة
  async findAvgBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT 
        c.silo_id,
        s.sensor_index,
        AVG(r.value_c) as avg_value_c,
        COUNT(r.id) as reading_count,
        MAX(r.polled_at) as latest_polled_at
      FROM readings_raw r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
      GROUP BY c.silo_id, s.sensor_index
      ORDER BY c.silo_id, s.sensor_index
    `;
    
    try {
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (err) {
      logger.error(`[ReadingRepository.findAvgBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching average readings by silo');
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب معرف الصومعة
  async findLatestAvgBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT 
        c.silo_id,
        s.sensor_index,
        AVG(r.value_c) as avg_value_c,
        COUNT(r.id) as reading_count,
        r.polled_at
      FROM readings_raw r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN (
        SELECT 
          c2.silo_id,
          s2.sensor_index,
          MAX(r2.polled_at) as max_polled_at
        FROM readings_raw r2
        INNER JOIN sensors s2 ON r2.sensor_id = s2.id
        INNER JOIN cables c2 ON s2.cable_id = c2.id
        WHERE c2.silo_id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (startDate) {
      query += ' AND r2.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r2.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY c2.silo_id, s2.sensor_index
      ) latest ON c.silo_id = latest.silo_id 
                 AND s.sensor_index = latest.sensor_index 
                 AND r.polled_at = latest.max_polled_at
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
      GROUP BY c.silo_id, s.sensor_index, r.polled_at
      ORDER BY c.silo_id, s.sensor_index
    `;
    
    params.push(...siloIds);
    
    try {
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestAvgBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest average readings by silo');
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب معرف الصومعة
  async findMaxAvgBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT 
        c.silo_id,
        s.sensor_index,
        MAX(r.value_c) as max_value_c,
        COUNT(r.id) as reading_count,
        r.polled_at
      FROM readings_raw r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
      GROUP BY c.silo_id, s.sensor_index
      ORDER BY c.silo_id, s.sensor_index
    `;
    
    try {
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (err) {
      logger.error(`[ReadingRepository.findMaxAvgBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching max average readings by silo');
    }
  }

  // 🔹 جلب القراءات حسب رقم الصومعة
  async findBySiloNumber(siloNumbers, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.value_c, r.polled_at
      FROM readings_raw r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      WHERE silo.silo_number IN (${siloNumbers.map(() => '?').join(',')})
    `;
    
    const params = [...siloNumbers];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY r.polled_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findBySiloNumber] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo number');
    }
  }

  // 🔹 جلب القراءات حسب معرف مجموعة الصوامع
  async findBySiloGroupId(siloGroupIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.value_c, r.polled_at
      FROM readings_raw r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      WHERE silo.silo_group_id IN (${siloGroupIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloGroupIds];
    
    if (startDate) {
      query += ' AND r.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.polled_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY r.polled_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        valueC: row.value_c,
        polledAt: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findBySiloGroupId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo group');
    }
  }

  // 🔹 جلب أحدث القراءات حسب رقم الصومعة - formatted for Python compatibility
  async findLatestBySiloNumber(siloNumbers, startDate = null, endDate = null) {
    // Import formatters
    const { formatLevelsRow, flattenRowsPerSilo } = await import('../utils/responseFormatters.js');
    
    // Get silo IDs from numbers
    const siloQuery = `
      SELECT id, silo_number, silo_group_id,
             (SELECT name FROM silo_groups WHERE id = silos.silo_group_id) as group_name
      FROM silos 
      WHERE silo_number IN (${siloNumbers.map(() => '?').join(',')})
    `;
    
    const [siloRows] = await pool.query(siloQuery, siloNumbers);
    const siloIds = siloRows.map(row => row.id);
    
    if (!siloIds.length) return [];
    
    // Get latest readings per cable for these silos
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
    
    if (startDate) {
      query += ' AND rr.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND rr.polled_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY rr.polled_at DESC, silo.id, c.id, s.sensor_index';
    
    try {
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
      
      // Flatten to per-silo format (matches Python _flatten_rows_per_silo)
      const flattened = flattenRowsPerSilo(perCableRows);
      
      return flattened;
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestBySiloNumber] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest readings by silo number');
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب رقم الصومعة
  async findLatestAvgBySiloNumber(siloNumbers, startDate = null, endDate = null) {
    // Get per-cable data first
    const perCableRows = await this.findLatestBySiloNumber(siloNumbers, startDate, endDate);
    
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
    const { formatLevelsRow } = await import('../utils/responseFormatters.js');
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
