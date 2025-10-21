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
      SELECT sensor_id, value_c, polled_at
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
      return rows.map(row => ({
        sensor_id: row.sensor_id,
        temperature: parseFloat(row.value_c),
        timestamp: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findBySensorId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by sensor');
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف المستشعر
  async findLatestBySensorId(sensorIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.sensor_id, r1.value_c, r1.polled_at,
             s.sensor_index, c.cable_index, c.silo_id, silo.silo_number,
             sg.name as silo_group_name
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
      INNER JOIN sensors s ON r1.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      ORDER BY r1.sensor_id
    `;
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        sensor_id: row.sensor_id,
        temperature: parseFloat(row.value_c),
        timestamp: row.polled_at,
        sensorIndex: row.sensor_index,
        cableIndex: row.cable_index,
        siloId: row.silo_id,
        siloNumber: row.silo_number,
        siloGroup: row.silo_group_name
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestBySensorId] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest readings by sensor');
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف المستشعر
  async findMaxBySensorId(sensorIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.sensor_id, r1.value_c, r1.polled_at
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
      return rows.map(row => ({
        sensor_id: row.sensor_id,
        temperature: parseFloat(row.value_c),
        timestamp: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findMaxBySensorId] ❌ ${err.message}`);
      throw new Error('Database error while fetching max readings by sensor');
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
      logger.error(`[ReadingRepository.findByCableId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by cable');
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الكابل
  async findLatestByCableId(cableIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.sensor_id, r1.value_c, r1.polled_at
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
      return rows.map(row => ({
        sensor_id: row.sensor_id,
        temperature: parseFloat(row.value_c),
        timestamp: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestByCableId] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest readings by cable');
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الكابل
  async findMaxByCableId(cableIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.id, r1.sensor_id, r1.hour_start, r1.value_c, r1.sample_at
      FROM readings r1
      INNER JOIN sensors s ON r1.sensor_id = s.id
      INNER JOIN (
        SELECT r.sensor_id, MAX(r.value_c) as max_value_c
        FROM readings r
        INNER JOIN sensors s2 ON r.sensor_id = s2.id
        WHERE s2.cable_id IN (${cableIds.map(() => '?').join(',')})
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
        hourStart: row.hour_start,
        valueC: row.value_c,
        sampleAt: row.sample_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findMaxByCableId] ❌ ${err.message}`);
      throw new Error('Database error while fetching max readings by cable');
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
      logger.error(`[ReadingRepository.findBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo');
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الصومعة
  async findLatestBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.sensor_id, r1.value_c, r1.polled_at
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
      return rows.map(row => ({
        sensor_id: row.sensor_id,
        temperature: parseFloat(row.value_c),
        timestamp: row.polled_at
      }));
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestBySiloId] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest readings by silo');
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الصومعة
  async findMaxBySiloId(siloIds, startDate = null, endDate = null) {
    let query = `
      SELECT r1.id, r1.sensor_id, r1.hour_start, r1.value_c, r1.sample_at
      FROM readings r1
      INNER JOIN sensors s ON r1.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      INNER JOIN (
        SELECT r.sensor_id, MAX(r.value_c) as max_value_c
        FROM readings r
        INNER JOIN sensors s2 ON r.sensor_id = s2.id
        INNER JOIN cables c2 ON s2.cable_id = c2.id
        WHERE c2.silo_id IN (${siloIds.map(() => '?').join(',')})
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
        hourStart: row.hour_start,
        valueC: row.value_c,
        sampleAt: row.sample_at
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
        MAX(r.sample_at) as latest_sample_at
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
        COUNT(r.sensor_id) as reading_count,
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
      return rows.map(row => ({
        silo_id: row.silo_id,
        sensor_index: row.sensor_index,
        avg_temperature: parseFloat(row.avg_value_c),
        reading_count: row.reading_count,
        timestamp: row.polled_at
      }));
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
        r.sample_at
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
      logger.error(`[ReadingRepository.findBySiloNumber] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo number');
    }
  }

  // 🔹 جلب أحدث القراءات حسب رقم الصومعة (Latest - from readings_raw table)
  async findLatestBySiloNumber(siloNumbers, startDate = null, endDate = null) {
    let query = `
      SELECT 
        r1.sensor_id, 
        r1.value_c, 
        r1.polled_at,
        s.sensor_index,
        c.cable_index,
        c.id as cable_id,
        silo.id as silo_id,
        silo.silo_number,
        sg.name as group_name,
        sg.id as group_id
      FROM readings_raw r1
      INNER JOIN (
        SELECT c.id as cable_id, MAX(r2.polled_at) as max_polled_at
        FROM readings_raw r2
        INNER JOIN sensors s ON r2.sensor_id = s.id
        INNER JOIN cables c ON s.cable_id = c.id
        INNER JOIN silos silo ON c.silo_id = silo.id
        WHERE silo.silo_number IN (${siloNumbers.map(() => '?').join(',')})
    `;
    
    const params = [...siloNumbers];
    
    if (startDate) {
      query += ' AND r2.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND r2.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY c.id
      ) latest ON r1.polled_at = latest.max_polled_at
      INNER JOIN sensors s ON r1.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id AND c.id = latest.cable_id
      INNER JOIN silos silo ON c.silo_id = silo.id
      LEFT JOIN silo_groups sg ON silo.silo_group_id = sg.id
      ORDER BY silo.silo_number, c.cable_index, s.sensor_index
    `;
    
    try {
      const [rows] = await pool.query(query, params);
      
      if (!rows.length) {
        return [];
      }
      
      // Step 1: Group by silo and cable to create level-based structure
      const grouped = {};
      
      for (const row of rows) {
        const key = `${row.silo_id}_${row.cable_id}`;
        if (!grouped[key]) {
          grouped[key] = {
            silo: {
              id: row.silo_id,
              silo_number: row.silo_number,
              group_name: row.group_name
            },
            cable_number: row.cable_index,
            timestamp: row.polled_at,
            levels: {}
          };
        }
        
        // Add temperature for this sensor level
        grouped[key].levels[row.sensor_index] = parseFloat(row.value_c);
      }
      
      // Step 2: Coalesce all cables in a silo to the same "latest second" bucket (Python logic)
      const latestSecPerSilo = {};
      for (const data of Object.values(grouped)) {
        const siloId = data.silo.id;
        const timestamp = new Date(data.timestamp);
        // Bucket to second precision (strip milliseconds)
        const sec = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 
                           timestamp.getHours(), timestamp.getMinutes(), timestamp.getSeconds());
        
        if (!latestSecPerSilo[siloId] || sec > latestSecPerSilo[siloId]) {
          latestSecPerSilo[siloId] = sec;
        }
      }
      
      // Step 3: Update all cable entries to use the silo's shared timestamp
      const result = Object.values(grouped).map(data => ({
        ...data,
        timestamp: latestSecPerSilo[data.silo.id]
      }));
      
      return result;
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestBySiloNumber] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest readings by silo number');
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب رقم الصومعة (Python-compatible)
  async findLatestAvgBySiloNumber(siloNumbers, startDate = null, endDate = null) {
    try {
      // First, get the latest readings per cable (like the working endpoint)
      const latestData = await this.findLatestBySiloNumber(siloNumbers, startDate, endDate);
      
      if (!latestData.length) {
        return [];
      }
      
      // Group by silo and average across cables per level
      const siloGroups = {};
      
      for (const cableData of latestData) {
        const key = `${cableData.silo.id}`;
        
        if (!siloGroups[key]) {
          siloGroups[key] = {
            silo_id: cableData.silo.id,
            silo_number: cableData.silo.silo_number,
            group_name: cableData.silo.group_name,
            timestamp: cableData.timestamp,
            levelSums: {},
            levelCounts: {}
          };
          
          // Initialize level sums and counts
          for (let i = 0; i < 8; i++) {
            siloGroups[key].levelSums[i] = 0;
            siloGroups[key].levelCounts[i] = 0;
          }
        }
        
        // Add this cable's data to the averages (exclude disconnect values)
        for (let level = 0; level < 8; level++) {
          const temp = cableData.levels[level];
          
          if (temp !== null && temp !== undefined && temp !== -127.0) {
            siloGroups[key].levelSums[level] += temp;
            siloGroups[key].levelCounts[level]++;
          }
        }
      }
      
      // Calculate averages and return structured data
      const result = [];
      
      for (const group of Object.values(siloGroups)) {
        const avgLevels = {};
        
        for (let i = 0; i < 8; i++) {
          if (group.levelCounts[i] > 0) {
            avgLevels[i] = group.levelSums[i] / group.levelCounts[i];
          } else {
            avgLevels[i] = null;
          }
        }
        
        result.push({
          silo_id: group.silo_id,
          silo_number: group.silo_number,
          group_name: group.group_name,
          timestamp: group.timestamp,
          levels: avgLevels
        });
      }
      
      return result;
      
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestAvgBySiloNumber] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest average readings by silo number');
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
      logger.error(`[ReadingRepository.findBySiloGroupId] ❌ ${err.message}`);
      throw new Error('Database error while fetching readings by silo group');
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف مجموعة الصوامع (Latest - from readings_raw table)
  async findLatestBySiloGroupId(siloGroupIds, startDate = null, endDate = null) {
    try {
      // First get silo IDs for the given group IDs
      let siloQuery = `
        SELECT id FROM silos WHERE silo_group_id IN (${siloGroupIds.map(() => '?').join(',')})
      `;
      const [siloRows] = await pool.query(siloQuery, siloGroupIds);
      const siloIds = siloRows.map(row => row.id);
      
      if (siloIds.length === 0) {
        return [];
      }
      
      // Use existing findLatestBySiloId method
      return await this.findLatestBySiloId(siloIds, startDate, endDate);
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestBySiloGroupId] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest readings by silo group');
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب معرف مجموعة الصوامع (Latest - from readings_raw table)
  async findLatestAvgBySiloGroupId(siloGroupIds, startDate = null, endDate = null) {
    try {
      // First get silo numbers for the given group IDs
      let siloQuery = `
        SELECT silo_number FROM silos WHERE silo_group_id IN (${siloGroupIds.map(() => '?').join(',')})
      `;
      const [siloRows] = await pool.query(siloQuery, siloGroupIds);
      const siloNumbers = siloRows.map(row => row.silo_number);
      
      if (siloNumbers.length === 0) {
        return [];
      }
      
      // Use existing findLatestAvgBySiloNumber method
      return await this.findLatestAvgBySiloNumber(siloNumbers, startDate, endDate);
    } catch (err) {
      logger.error(`[ReadingRepository.findLatestAvgBySiloGroupId] ❌ ${err.message}`);
      throw new Error('Database error while fetching latest averaged readings by silo group');
    }
  }
}
