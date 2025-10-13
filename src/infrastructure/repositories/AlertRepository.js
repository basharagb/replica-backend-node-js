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
  
  // 🔹 جلب جميع التنبيهات النشطة
  async findActiveAlerts(endDate = null) {
    let query = `
      SELECT 
        id, silo_id, level_index, limit_type, threshold_c, 
        first_seen_at, last_seen_at, status
      FROM alerts
      WHERE status = 'active'
    `;
    
    const params = [];
    
    if (endDate) {
      query += ' AND last_seen_at <= ?';
      params.push(endDate);
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
