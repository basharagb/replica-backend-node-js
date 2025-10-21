// ==============================
// 📦 Imports
// ==============================
import { pool } from '../database/db.js';
import { Reading } from '../../domain/entities/Reading.js';
import { logger } from '../config/logger.js';

// ==============================
// 🏗️ Reports Reading Repository Class (uses 'readings' table)
// ==============================
export class ReportsReadingRepository {
  
  // 🔹 جلب القراءات حسب معرف المستشعر (Reports - from readings table)
  async findBySensorId(sensorIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.hour_start, r.value_c, r.sample_at,
             s.sensor_index, c.cable_index, c.silo_id, silo.silo_number,
             sg.name as silo_group_name
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      WHERE r.sensor_id IN (${sensorIds.map(() => '?').join(',')})
    `;
    
    const params = [...sensorIds];
    
    if (startDate) {
      query += ' AND r.sample_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.sample_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY r.sample_at DESC, r.sensor_id ASC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        temperature: parseFloat(row.value_c),
        timestamp: row.sample_at,
        sensorIndex: row.sensor_index,
        cableIndex: row.cable_index,
        siloId: row.silo_id,
        siloNumber: row.silo_number,
        siloGroup: row.silo_group_name
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findBySensorId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by sensor');
    }
  }

  // 🔹 جلب القراءات حسب معرف الكابل (Reports - from readings table)
  async findByCableId(cableIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.hour_start, r.value_c, r.sample_at,
             s.sensor_index, c.cable_index, c.silo_id, silo.silo_number,
             sg.name as silo_group_name
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      WHERE c.id IN (${cableIds.map(() => '?').join(',')})
    `;
    
    const params = [...cableIds];
    
    if (startDate) {
      query += ' AND r.sample_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.sample_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY r.sample_at DESC, r.sensor_id ASC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        temperature: parseFloat(row.value_c),
        timestamp: row.sample_at,
        sensorIndex: row.sensor_index,
        cableIndex: row.cable_index,
        siloId: row.silo_id,
        siloNumber: row.silo_number,
        siloGroup: row.silo_group_name
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findByCableId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by cable');
    }
  }

  // 🔹 جلب القراءات حسب معرف الصومعة (Reports - from readings table)
  async findBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.hour_start, r.value_c, r.sample_at,
             s.sensor_index, c.cable_index, c.silo_id, silo.silo_number,
             sg.name as silo_group_name
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      WHERE silo.id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (startDate) {
      query += ' AND r.sample_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.sample_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY r.sample_at DESC, r.sensor_id ASC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        temperature: parseFloat(row.value_c),
        timestamp: row.sample_at,
        sensorIndex: row.sensor_index,
        cableIndex: row.cable_index,
        siloId: row.silo_id,
        siloNumber: row.silo_number,
        siloGroup: row.silo_group_name
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo');
    }
  }

  // 🔹 جلب القراءات حسب رقم الصومعة (Reports - from readings table)
  async findBySiloNumber(siloNumbers, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.hour_start, r.value_c, r.sample_at,
             s.sensor_index, c.cable_index, c.silo_id, silo.silo_number,
             sg.name as silo_group_name
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      WHERE silo.silo_number IN (${siloNumbers.map(() => '?').join(',')})
    `;
    
    const params = [...siloNumbers];
    
    if (startDate) {
      query += ' AND r.sample_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.sample_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY r.sample_at DESC, r.sensor_id ASC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        temperature: parseFloat(row.value_c),
        timestamp: row.sample_at,
        sensorIndex: row.sensor_index,
        cableIndex: row.cable_index,
        siloId: row.silo_id,
        siloNumber: row.silo_number,
        siloGroup: row.silo_group_name
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findBySiloNumber] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo number');
    }
  }

  // 🔹 جلب القراءات حسب معرف مجموعة الصوامع (Reports - from readings table)
  async findBySiloGroupId(siloGroupIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.hour_start, r.value_c, r.sample_at,
             s.sensor_index, c.cable_index, c.silo_id, silo.silo_number,
             sg.name as silo_group_name
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      WHERE silo.silo_group_id IN (${siloGroupIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloGroupIds];
    
    if (startDate) {
      query += ' AND r.sample_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.sample_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY r.sample_at DESC, r.sensor_id ASC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        temperature: parseFloat(row.value_c),
        timestamp: row.sample_at,
        sensorIndex: row.sensor_index,
        cableIndex: row.cable_index,
        siloId: row.silo_id,
        siloNumber: row.silo_number,
        siloGroup: row.silo_group_name
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findBySiloGroupId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo group');
    }
  }

  // 🔹 جلب القراءات المجمعة حسب رقم الصومعة (Reports - averaging from readings table)
  async findAvgBySiloNumber(siloNumbers, startDate = null, endDate = null) {
    let query = `
      SELECT silo.silo_number, sg.name as silo_group_name,
             s.sensor_index as level_index,
             AVG(r.value_c) as avg_temperature,
             r.sample_at as timestamp
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      WHERE silo.silo_number IN (${siloNumbers.map(() => '?').join(',')})
        AND r.value_c IS NOT NULL
        AND r.value_c != -127.0
    `;
    
    const params = [...siloNumbers];
    
    if (startDate) {
      query += ' AND r.sample_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.sample_at <= ?';
      params.push(endDate);
    }
    
    query += `
      GROUP BY silo.silo_number, sg.name, s.sensor_index, r.sample_at
      ORDER BY r.sample_at DESC, silo.silo_number ASC, s.sensor_index ASC
    `;
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        siloNumber: row.silo_number,
        siloGroup: row.silo_group_name,
        levelIndex: row.level_index,
        temperature: parseFloat(row.avg_temperature),
        timestamp: row.timestamp
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findAvgBySiloNumber] ❌ ${err.message}`);
      throw new Error('Database error while fetching averaged readings by silo number');
    }
  }

  // 🔹 جلب أعلى القراءات حسب رقم الصومعة (Reports - max from readings table)
  async findMaxBySiloNumber(siloNumbers, startDate = null, endDate = null) {
    let query = `
      SELECT silo.silo_number, sg.name as silo_group_name,
             s.sensor_index as level_index,
             MAX(r.value_c) as max_temperature,
             r.sample_at as timestamp
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      WHERE silo.silo_number IN (${siloNumbers.map(() => '?').join(',')})
        AND r.value_c IS NOT NULL
        AND r.value_c != -127.0
    `;
    
    const params = [...siloNumbers];
    
    if (startDate) {
      query += ' AND r.sample_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r.sample_at <= ?';
      params.push(endDate);
    }
    
    query += `
      GROUP BY silo.silo_number, sg.name, s.sensor_index, r.sample_at
      ORDER BY r.sample_at DESC, silo.silo_number ASC, s.sensor_index ASC
    `;
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        siloNumber: row.silo_number,
        siloGroup: row.silo_group_name,
        levelIndex: row.level_index,
        temperature: parseFloat(row.max_temperature),
        timestamp: row.timestamp
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findMaxBySiloNumber] ❌ ${err.message}`);
      throw new Error('Database error while fetching max readings by silo number');
    }
  }
}
