// ==============================
// 📦 Imports
// ==============================
import { pool } from '../database/db.js';
import { Cable } from '../../domain/entities/Cable.js';
import { logger } from '../config/logger.js';

// ==============================
// 🏗️ Cable Repository Class
// ==============================
export class CableRepository {
  
  // 🔹 جلب جميع الكابلات
  async findAll() {
    try {
      const [rows] = await pool.query(`
        SELECT id, silo_id, cable_index, slave_id, channel
        FROM cables
        ORDER BY silo_id ASC, cable_index ASC
      `);
      return rows.map(r => new Cable({
        id: r.id,
        siloId: r.silo_id,
        cableIndex: r.cable_index,
        slaveId: r.slave_id,
        channel: r.channel
      }));
    } catch (err) {
      logger.error('[CableRepository.findAll] ❌', err.message);
      throw new Error('Database error while fetching cables');
    }
  }

  // 🔹 جلب الكابلات حسب معرف الصومعة
  async findBySiloId(siloId) {
    try {
      const [rows] = await pool.query(`
        SELECT id, silo_id, cable_index, slave_id, channel
        FROM cables 
        WHERE silo_id = ?
        ORDER BY cable_index ASC
      `, [siloId]);
      return rows.map(r => new Cable({
        id: r.id,
        siloId: r.silo_id,
        cableIndex: r.cable_index,
        slaveId: r.slave_id,
        channel: r.channel
      }));
    } catch (err) {
      logger.error('[CableRepository.findBySiloId] ❌', err.message);
      throw new Error(`Failed to fetch cables for silo ${siloId}`);
    }
  }

  // 🔹 جلب كابل واحد حسب المعرف
  async findById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT id, silo_id, cable_index, slave_id, channel
        FROM cables 
        WHERE id = ?
        LIMIT 1
      `, [id]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return new Cable({
        id: row.id,
        siloId: row.silo_id,
        cableIndex: row.cable_index,
        slaveId: row.slave_id,
        channel: row.channel
      });
    } catch (err) {
      logger.error('[CableRepository.findById] ❌', err.message);
      throw new Error(`Failed to fetch cable with id ${id}`);
    }
  }

  // 🔹 جلب الكابلات حسب معرفات متعددة
  async findByIds(cableIds) {
    if (!cableIds || cableIds.length === 0) return [];
    
    try {
      const [rows] = await pool.query(`
        SELECT id, silo_id, cable_index, slave_id, channel
        FROM cables 
        WHERE id IN (${cableIds.map(() => '?').join(',')})
        ORDER BY silo_id ASC, cable_index ASC
      `, cableIds);
      
      return rows.map(r => new Cable({
        id: r.id,
        siloId: r.silo_id,
        cableIndex: r.cable_index,
        slaveId: r.slave_id,
        channel: r.channel
      }));
    } catch (err) {
      logger.error('[CableRepository.findByIds] ❌', err.message);
      throw new Error('Database error while fetching cables by IDs');
    }
  }

  // 🔹 جلب الكابلات حسب معرفات الصوامع المتعددة
  async findBySiloIds(siloIds) {
    if (!siloIds || siloIds.length === 0) return [];
    
    try {
      const [rows] = await pool.query(`
        SELECT id, silo_id, cable_index, slave_id, channel
        FROM cables 
        WHERE silo_id IN (${siloIds.map(() => '?').join(',')})
        ORDER BY silo_id ASC, cable_index ASC
      `, siloIds);
      
      return rows.map(r => new Cable({
        id: r.id,
        siloId: r.silo_id,
        cableIndex: r.cable_index,
        slaveId: r.slave_id,
        channel: r.channel
      }));
    } catch (err) {
      logger.error('[CableRepository.findBySiloIds] ❌', err.message);
      throw new Error('Database error while fetching cables by silo IDs');
    }
  }

  // 🔹 جلب الكابلات حسب رقم الصومعة
  async findBySiloNumber(siloNumber) {
    try {
      const [rows] = await pool.query(`
        SELECT c.id, c.silo_id, c.cable_index, c.slave_id, c.channel
        FROM cables c
        INNER JOIN silos s ON c.silo_id = s.id
        WHERE s.silo_number = ?
        ORDER BY c.cable_index ASC
      `, [siloNumber]);
      
      return rows.map(r => new Cable({
        id: r.id,
        siloId: r.silo_id,
        cableIndex: r.cable_index,
        slaveId: r.slave_id,
        channel: r.channel
      }));
    } catch (err) {
      logger.error('[CableRepository.findBySiloNumber] ❌', err.message);
      throw new Error(`Failed to fetch cables for silo number ${siloNumber}`);
    }
  }

  // 🔹 جلب الكابلات حسب أرقام الصوامع المتعددة
  async findBySiloNumbers(siloNumbers) {
    if (!siloNumbers || siloNumbers.length === 0) return [];
    
    try {
      const [rows] = await pool.query(`
        SELECT c.id, c.silo_id, c.cable_index, c.slave_id, c.channel
        FROM cables c
        INNER JOIN silos s ON c.silo_id = s.id
        WHERE s.silo_number IN (${siloNumbers.map(() => '?').join(',')})
        ORDER BY s.silo_number ASC, c.cable_index ASC
      `, siloNumbers);
      
      return rows.map(r => new Cable({
        id: r.id,
        siloId: r.silo_id,
        cableIndex: r.cable_index,
        slaveId: r.slave_id,
        channel: r.channel
      }));
    } catch (err) {
      logger.error('[CableRepository.findBySiloNumbers] ❌', err.message);
      throw new Error('Database error while fetching cables by silo numbers');
    }
  }
}