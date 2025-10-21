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
  
  // 🔹 جلب القراءات حسب معرف المستشعر
  async findBySensorId(sensorIds, startDate = null, endDate = null) {
    let query = `
      SELECT id, sensor_id, hour_start, value_c, sample_at
      FROM readings
      WHERE sensor_id IN (${sensorIds.map(() => '?').join(',')})
    `;
    
    const params = [...sensorIds];
    
    if (startDate) {
      query += ' AND sample_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND sample_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY sample_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        valueC: row.value_c,
        sampleAt: row.sample_at
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findBySensorId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by sensor');
    }
  }

  // 🔹 جلب القراءات حسب معرف الكابل
  async findByCableId(cableIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.hour_start, r.value_c, r.sample_at
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      WHERE s.cable_id IN (${cableIds.map(() => '?').join(',')})
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
    
    query += ' ORDER BY r.sample_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        valueC: row.value_c,
        sampleAt: row.sample_at
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findByCableId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by cable');
    }
  }

  // 🔹 جلب القراءات حسب معرف الصومعة
  async findBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.hour_start, r.value_c, r.sample_at
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
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
    
    query += ' ORDER BY r.sample_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        valueC: row.value_c,
        sampleAt: row.sample_at
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo');
    }
  }

  // 🔹 جلب القراءات حسب رقم الصومعة
  async findBySiloNumber(siloNumbers, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.hour_start, r.value_c, r.sample_at
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
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
    
    query += ' ORDER BY r.sample_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        valueC: row.value_c,
        sampleAt: row.sample_at
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findBySiloNumber] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo number');
    }
  }

  // 🔹 جلب القراءات حسب معرف مجموعة الصوامع
  async findBySiloGroupId(siloGroupIds, startDate = null, endDate = null) {
    let query = `
      SELECT r.id, r.sensor_id, r.hour_start, r.value_c, r.sample_at
      FROM readings r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
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
    
    query += ' ORDER BY r.sample_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Reading({
        id: row.id,
        sensorId: row.sensor_id,
        hourStart: row.hour_start,
        valueC: row.value_c,
        sampleAt: row.sample_at
      }));
    } catch (err) {
      logger.error(`[ReportsReadingRepository.findBySiloGroupId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo group');
    }
  }
}
