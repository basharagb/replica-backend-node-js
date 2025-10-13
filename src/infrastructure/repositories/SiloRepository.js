// ==============================
// 📦 Imports
// ==============================
import { pool } from '../database/db.js';
import { Silo } from '../../domain/entities/Silo.js';
import { logger } from '../config/logger.js';

// ==============================
// 🏗️ Repository Class
// ==============================
export class SiloRepository {
  // 🔹 جلب جميع الصوامع
  async findAll() {
    const query = `
      SELECT id, silo_number, silo_group_id, cable_count
      FROM silos
      ORDER BY silo_number ASC
    `;

    try {
      const [rows] = await pool.query(query);

      // 🧠 تحويل النتائج إلى كيانات Silo
      return rows.map(row => new Silo({
        id: row.id,
        siloNumber: row.silo_number,
        siloGroupId: row.silo_group_id,
        cableCount: row.cable_count
      }));

    } catch (err) {
      logger.error(`[SiloRepository.findAll] ❌ ${err.message}`);
      throw new Error('Database error while fetching silos');
    }
  }

  // 🔹 جلب صومعة واحدة حسب ID
  async findById(id) {
    const query = `
      SELECT id, silo_number, silo_group_id, cable_count
      FROM silos
      WHERE id = ?
      LIMIT 1
    `;

    try {
      const [rows] = await pool.query(query, [id]);

      if (rows.length === 0) return null;

      const row = rows[0];
      return new Silo({
        id: row.id,
        siloNumber: row.silo_number,
        siloGroupId: row.silo_group_id,
        cableCount: row.cable_count
      });

    } catch (err) {
      logger.error(`[SiloRepository.findById] ❌ ${err.message}`);
      throw new Error(`Failed to fetch silo with id ${id}`);
    }
  }

  // 🔹 جلب صومعة حسب رقمها (silo_number)
  async findByNumber(siloNumber) {
    const query = `
      SELECT id, silo_number, silo_group_id, cable_count
      FROM silos
      WHERE silo_number = ?
      LIMIT 1
    `;

    try {
      const [rows] = await pool.query(query, [siloNumber]);

      if (rows.length === 0) return null;

      const row = rows[0];
      return new Silo({
        id: row.id,
        siloNumber: row.silo_number,
        siloGroupId: row.silo_group_id,
        cableCount: row.cable_count
      });

    } catch (err) {
      logger.error(`[SiloRepository.findByNumber] ❌ ${err.message}`);
      throw new Error(`Failed to fetch silo number ${siloNumber}`);
    }
  }
}