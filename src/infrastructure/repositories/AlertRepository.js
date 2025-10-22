// ==============================
// 📦 Imports
// ==============================
import { pool } from '../database/db.js';
import { Alert } from '../../domain/entities/Alert.js';
import { logger } from '../config/logger.js';

// ==============================
// 🏗️ Alert Repository Class
// ==============================
export class AlertRepository {
  
  // 🔹 جلب جميع التنبيهات النشطة مع دعم التصفح
  async findActiveAlerts(options = {}) {
    const { endDate = null, page = 1, limit = 50, windowHours = 2.0 } = options;
    
    let query = `
      SELECT 
        a.id, a.silo_id, a.level_index, a.limit_type, a.threshold_c, 
        a.first_seen_at, a.last_seen_at, a.status, a.level_mask,
        s.silo_number, s.silo_group_id,
        sg.name as silo_group_name
      FROM alerts a
      INNER JOIN silos s ON a.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
      WHERE 1=1  -- Get all alerts regardless of status
    `;
    
    const params = [];
    
    if (endDate) {
      query += ' AND COALESCE(a.last_seen_at, a.first_seen_at) <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY COALESCE(a.last_seen_at, a.first_seen_at) DESC';
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    try {
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM alerts a
        INNER JOIN silos s ON a.silo_id = s.id
        WHERE 1=1  -- Count all alerts regardless of status
      `;
      
      const countParams = [];
      if (endDate) {
        countQuery += ' AND COALESCE(a.last_seen_at, a.first_seen_at) <= ?';
        countParams.push(endDate);
      }
      
      const [countResult] = await pool.query(countQuery, countParams);
      const total = countResult[0].total;
      
      const [rows] = await pool.query(query, params);
      
      const alerts = rows.map(row => ({
        id: row.id,
        siloId: row.silo_id,
        siloNumber: row.silo_number,
        siloGroupId: row.silo_group_id,
        siloGroupName: row.silo_group_name,
        levelIndex: row.level_index,
        levelMask: row.level_mask,
        limitType: row.limit_type,
        thresholdC: row.threshold_c,
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        status: row.status
      }));
      
      return {
        alerts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (err) {
      logger.error(`[AlertRepository.findActiveAlerts] ❌ ${err.message}`);
      throw new Error('Database error while fetching active alerts');
    }
  }

  // 🔹 جلب التنبيهات حسب معرف الصومعة
  async findBySiloId(siloId, status = null) {
    let query = `
      SELECT 
        id, silo_id, level_index, limit_type, threshold_c, 
        first_seen_at, last_seen_at, status
      FROM alerts
      WHERE silo_id = ?
    `;
    
    const params = [siloId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY last_seen_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Alert({
        id: row.id,
        siloId: row.silo_id,
        levelIndex: row.level_index,
        limitType: row.limit_type,
        thresholdC: row.threshold_c,
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        status: row.status
      }));
    } catch (err) {
      logger.error(`[AlertRepository.findBySiloId] ❌ ${err.message}`);
      throw new Error(`Database error while fetching alerts for silo ${siloId}`);
    }
  }

  // 🔹 جلب التنبيهات حسب معرفات الصوامع المتعددة
  async findBySiloIds(siloIds, status = null) {
    if (!siloIds || siloIds.length === 0) return [];
    
    let query = `
      SELECT 
        id, silo_id, level_index, limit_type, threshold_c, 
        first_seen_at, last_seen_at, status
      FROM alerts
      WHERE silo_id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY silo_id ASC, last_seen_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Alert({
        id: row.id,
        siloId: row.silo_id,
        levelIndex: row.level_index,
        limitType: row.limit_type,
        thresholdC: row.threshold_c,
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        status: row.status
      }));
    } catch (err) {
      logger.error(`[AlertRepository.findBySiloIds] ❌ ${err.message}`);
      throw new Error('Database error while fetching alerts by silo IDs');
    }
  }

  // 🔹 جلب التنبيهات حسب رقم الصومعة
  async findBySiloNumber(siloNumber, status = null) {
    let query = `
      SELECT 
        a.id, a.silo_id, a.level_index, a.limit_type, a.threshold_c, 
        a.first_seen_at, a.last_seen_at, a.status
      FROM alerts a
      INNER JOIN silos s ON a.silo_id = s.id
      WHERE s.silo_number = ?
    `;
    
    const params = [siloNumber];
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY a.last_seen_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Alert({
        id: row.id,
        siloId: row.silo_id,
        levelIndex: row.level_index,
        limitType: row.limit_type,
        thresholdC: row.threshold_c,
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        status: row.status
      }));
    } catch (err) {
      logger.error(`[AlertRepository.findBySiloNumber] ❌ ${err.message}`);
      throw new Error(`Database error while fetching alerts for silo number ${siloNumber}`);
    }
  }

  // 🔹 جلب التنبيهات حسب أرقام الصوامع المتعددة
  async findBySiloNumbers(siloNumbers, status = null) {
    if (!siloNumbers || siloNumbers.length === 0) return [];
    
    let query = `
      SELECT 
        a.id, a.silo_id, a.level_index, a.limit_type, a.threshold_c, 
        a.first_seen_at, a.last_seen_at, a.status
      FROM alerts a
      INNER JOIN silos s ON a.silo_id = s.id
      WHERE s.silo_number IN (${siloNumbers.map(() => '?').join(',')})
    `;
    
    const params = [...siloNumbers];
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY s.silo_number ASC, a.last_seen_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Alert({
        id: row.id,
        siloId: row.silo_id,
        levelIndex: row.level_index,
        limitType: row.limit_type,
        thresholdC: row.threshold_c,
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        status: row.status
      }));
    } catch (err) {
      logger.error(`[AlertRepository.findBySiloNumbers] ❌ ${err.message}`);
      throw new Error('Database error while fetching alerts by silo numbers');
    }
  }

  // 🔹 جلب التنبيهات حسب معرف مجموعة الصوامع
  async findBySiloGroupId(siloGroupId, status = null) {
    let query = `
      SELECT 
        a.id, a.silo_id, a.level_index, a.limit_type, a.threshold_c, 
        a.first_seen_at, a.last_seen_at, a.status
      FROM alerts a
      INNER JOIN silos s ON a.silo_id = s.id
      WHERE s.silo_group_id = ?
    `;
    
    const params = [siloGroupId];
    
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY s.silo_number ASC, a.last_seen_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Alert({
        id: row.id,
        siloId: row.silo_id,
        levelIndex: row.level_index,
        limitType: row.limit_type,
        thresholdC: row.threshold_c,
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        status: row.status
      }));
    } catch (err) {
      logger.error(`[AlertRepository.findBySiloGroupId] ❌ ${err.message}`);
      throw new Error(`Database error while fetching alerts for silo group ${siloGroupId}`);
    }
  }

  // 🔹 جلب التنبيهات حسب نوع الحد
  async findByLimitType(limitType, status = null) {
    let query = `
      SELECT 
        id, silo_id, level_index, limit_type, threshold_c, 
        first_seen_at, last_seen_at, status
      FROM alerts
      WHERE limit_type = ?
    `;
    
    const params = [limitType];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY last_seen_at DESC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new Alert({
        id: row.id,
        siloId: row.silo_id,
        levelIndex: row.level_index,
        limitType: row.limit_type,
        thresholdC: row.threshold_c,
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        status: row.status
      }));
    } catch (err) {
      logger.error(`[AlertRepository.findByLimitType] ❌ ${err.message}`);
      throw new Error(`Database error while fetching alerts by limit type ${limitType}`);
    }
  }

  // 🔹 إنشاء تنبيه جديد
  async create(alertData) {
    const query = `
      INSERT INTO alerts (
        silo_id, level_index, limit_type, threshold_c, 
        first_seen_at, last_seen_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      alertData.siloId,
      alertData.levelIndex,
      alertData.limitType,
      alertData.thresholdC,
      alertData.firstSeenAt,
      alertData.lastSeenAt,
      alertData.status || 'active'
    ];
    
    try {
      const [result] = await pool.query(query, params);
      return result.insertId;
    } catch (err) {
      logger.error(`[AlertRepository.create] ❌ ${err.message}`);
      throw new Error('Database error while creating alert');
    }
  }

  // 🔹 تحديث تنبيه موجود
  async update(id, updateData) {
    const fields = [];
    const params = [];
    
    if (updateData.lastSeenAt !== undefined) {
      fields.push('last_seen_at = ?');
      params.push(updateData.lastSeenAt);
    }
    
    if (updateData.status !== undefined) {
      fields.push('status = ?');
      params.push(updateData.status);
    }
    
    if (updateData.thresholdC !== undefined) {
      fields.push('threshold_c = ?');
      params.push(updateData.thresholdC);
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    params.push(id);
    
    const query = `
      UPDATE alerts 
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    try {
      const [result] = await pool.query(query, params);
      return result.affectedRows > 0;
    } catch (err) {
      logger.error(`[AlertRepository.update] ❌ ${err.message}`);
      throw new Error(`Database error while updating alert ${id}`);
    }
  }

  // 🔹 حذف تنبيه
  async delete(id) {
    const query = 'DELETE FROM alerts WHERE id = ?';
    
    try {
      const [result] = await pool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (err) {
      logger.error(`[AlertRepository.delete] ❌ ${err.message}`);
      throw new Error(`Database error while deleting alert ${id}`);
    }
  }

  // 🔹 جلب لقطة من مستويات الصومعة في وقت التنبيه
  async getSnapshotLevelsAtTimestamp(siloId, timestamp, windowHours = 2.0) {
    const windowStart = new Date(timestamp.getTime() - (windowHours * 60 * 60 * 1000));
    
    const query = `
      SELECT 
        r.sensor_id, r.value_c, r.polled_at,
        s.sensor_index, c.cable_index
      FROM readings_raw r
      INNER JOIN sensors s ON r.sensor_id = s.id
      INNER JOIN cables c ON s.cable_id = c.id
      WHERE c.silo_id = ?
        AND r.polled_at <= ?
        AND r.polled_at >= ?
      ORDER BY r.polled_at DESC, r.sensor_id ASC, r.id DESC
    `;
    
    try {
      const [rows] = await pool.query(query, [siloId, timestamp, windowStart]);
      
      // Get latest reading per sensor
      const latestPerSensor = {};
      for (const row of rows) {
        if (!latestPerSensor[row.sensor_id]) {
          latestPerSensor[row.sensor_id] = row;
        }
      }
      
      // Collapse across cables by level index using MAX temperature
      const levelMax = {};
      for (const reading of Object.values(latestPerSensor)) {
        const level = reading.sensor_index;
        const temp = reading.value_c;
        
        if (temp !== null && temp !== undefined) {
          const roundedTemp = Math.round(temp * 100) / 100;
          if (levelMax[level] === undefined || roundedTemp > levelMax[level]) {
            levelMax[level] = roundedTemp;
          }
        }
      }
      
      // Ensure all 8 levels are present (0-7)
      const completeLevels = {};
      for (let i = 0; i < 8; i++) {
        completeLevels[i] = levelMax[i] || null;
      }
      
      return completeLevels;
    } catch (err) {
      logger.error(`[AlertRepository.getSnapshotLevelsAtTimestamp] ❌ ${err.message}`);
      throw new Error('Database error while fetching snapshot levels');
    }
  }

  // 🔹 إحصائيات التنبيهات
  async getAlertStats() {
    const query = `
      SELECT 
        status,
        limit_type,
        COUNT(*) as count
      FROM alerts
      GROUP BY status, limit_type
      ORDER BY status, limit_type
    `;
    
    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (err) {
      logger.error(`[AlertRepository.getAlertStats] ❌ ${err.message}`);
      throw new Error('Database error while fetching alert statistics');
    }
  }
}
