// ==============================
// 📦 Imports
// ==============================
import { ReadingRepository } from '../../infrastructure/repositories/ReadingRepository.js';
import { ReportsReadingRepository } from '../../infrastructure/repositories/ReportsReadingRepository.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';

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
      res.json(readings); // Direct data response
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
      res.json(readings); // Direct data response
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف المستشعر
  async getMaxBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findMaxBySensorId(sensorIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أعلى القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب معرف الكابل
  async getByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findByCableId(cableIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الكابل
  async getLatestByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findLatestByCableId(cableIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أحدث القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الكابل
  async getMaxByCableId(req, res) {
    try {
      const cableIds = Array.isArray(req.query.cable_id) 
        ? req.query.cable_id.map(id => parseInt(id))
        : [parseInt(req.query.cable_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findMaxByCableId(cableIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أعلى القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب معرف الصومعة
  async getBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف الصومعة
  async getLatestBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findLatestBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أحدث القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف الصومعة
  async getMaxBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findMaxBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أعلى القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب معرف الصومعة
  async getAvgBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findAvgBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب القراءات المتوسطة بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب معرف الصومعة
  async getLatestAvgBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findLatestAvgBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أحدث القراءات المتوسطة بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب معرف الصومعة
  async getMaxAvgBySiloId(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findMaxAvgBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أعلى القراءات المتوسطة بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب رقم الصومعة
  async getBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findBySiloNumber(siloNumbers, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب رقم الصومعة
  async getLatestBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من أرقامها
      const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
      const readings = await readingRepo.findLatestBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أحدث القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب رقم الصومعة
  async getMaxBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من أرقامها
      const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
      const readings = await readingRepo.findMaxBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أعلى القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب رقم الصومعة
  async getAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من أرقامها
      const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
      const readings = await readingRepo.findAvgBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب القراءات المتوسطة بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب رقم الصومعة
  async getLatestAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من أرقامها
      const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
      const readings = await readingRepo.findLatestAvgBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أحدث القراءات المتوسطة بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب رقم الصومعة
  async getMaxAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من أرقامها
      const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
      const readings = await readingRepo.findMaxAvgBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أعلى القراءات المتوسطة بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب معرف مجموعة الصوامع
  async getBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findBySiloGroupId(siloGroupIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف مجموعة الصوامع
  async getLatestBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من مجموعاتها
      const siloIds = await this._getSiloIdsByGroupIds(siloGroupIds);
      const readings = await readingRepo.findLatestBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أحدث القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات حسب معرف مجموعة الصوامع
  async getMaxBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من مجموعاتها
      const siloIds = await this._getSiloIdsByGroupIds(siloGroupIds);
      const readings = await readingRepo.findMaxBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أعلى القراءات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب معرف مجموعة الصوامع
  async getAvgBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من مجموعاتها
      const siloIds = await this._getSiloIdsByGroupIds(siloGroupIds);
      const readings = await readingRepo.findAvgBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب القراءات المتوسطة بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب معرف مجموعة الصوامع
  async getLatestAvgBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من مجموعاتها
      const siloIds = await this._getSiloIdsByGroupIds(siloGroupIds);
      const readings = await readingRepo.findLatestAvgBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أحدث القراءات المتوسطة بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أعلى القراءات المتوسطة حسب معرف مجموعة الصوامع
  async getMaxAvgBySiloGroupId(req, res) {
    try {
      const siloGroupIds = Array.isArray(req.query.silo_group_id) 
        ? req.query.silo_group_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_group_id)];
      
      const { start, end } = req.query;
      
      // نحتاج أولاً للحصول على معرفات الصوامع من مجموعاتها
      const siloIds = await this._getSiloIdsByGroupIds(siloGroupIds);
      const readings = await readingRepo.findMaxAvgBySiloId(siloIds, start, end);
      res.json(responseFormatter.success(readings, 'تم جلب أعلى القراءات المتوسطة بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 دالة مساعدة للحصول على معرفات الصوامع من أرقامها
  async _getSiloIdsByNumbers(siloNumbers) {
    // هذه دالة مساعدة - يجب تنفيذها باستخدام SiloRepository
    const { SiloRepository } = await import('../../infrastructure/repositories/SiloRepository.js');
    const siloRepo = new SiloRepository();
    
    const silos = await Promise.all(
      siloNumbers.map(num => siloRepo.findByNumber(num))
    );
    
    return silos.filter(silo => silo !== null).map(silo => silo.id);
  }

  // 🔹 دالة مساعدة للحصول على معرفات الصوامع من معرفات المجموعات
  async _getSiloIdsByGroupIds(siloGroupIds) {
    // هذه دالة مساعدة - يجب تنفيذها باستخدام استعلام مباشر
    const { pool } = await import('../../infrastructure/database/db.js');
    
    const query = `
      SELECT id FROM silos 
      WHERE silo_group_id IN (${siloGroupIds.map(() => '?').join(',')})
    `;
    
    const [rows] = await pool.query(query, siloGroupIds);
    return rows.map(row => row.id);
  }
}
