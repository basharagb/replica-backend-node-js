// ==============================
// 📦 Imports
// ==============================
import { ReadingRepository } from '../../infrastructure/repositories/ReadingRepository.js';
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';

const readingRepo = new ReadingRepository();

// ==============================
// 🏗️ Reading Controller Class
// ==============================
export class ReadingController {

  // 🔹 جلب القراءات حسب معرف المستشعر
  async getBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findBySensorId(sensorIds, start, end);
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب معرف المستشعر
  async getLatestBySensorId(req, res) {
    try {
      const sensorIds = Array.isArray(req.query.sensor_id) 
        ? req.query.sensor_id.map(id => parseInt(id))
        : [parseInt(req.query.sensor_id)];
      
      const { start, end } = req.query;
      
      const readings = await readingRepo.findLatestBySensorId(sensorIds, start, end);
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات حسب رقم الصومعة (للتقارير - من جدول readings)
  async getBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // استخدام جدول readings للتقارير التاريخية
      const readings = await this._getBySiloNumberReportsFormat(siloNumbers, start, end);
      
      // إرجاع البيانات مباشرة بدون تغليف (متوافق مع النظام القديم)
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات حسب رقم الصومعة (متوافق مع النظام القديم)
  async getLatestBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // استخدام الطريقة المتوافقة مع النظام القديم
      const readings = await this._getLatestBySiloNumberLegacyFormat(siloNumbers, start, end);
      
      // إرجاع البيانات مباشرة بدون تغليف (متوافق مع النظام القديم)
      res.json(readings);
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
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب القراءات المتوسطة حسب رقم الصومعة (للتقارير - من جدول readings)
  async getAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // استخدام جدول readings للتقارير المتوسطة التاريخية
      const readings = await this._getAvgBySiloNumberReportsFormat(siloNumbers, start, end);
      
      // إرجاع البيانات مباشرة بدون تغليف (متوافق مع النظام القديم)
      res.json(readings);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب أحدث القراءات المتوسطة حسب رقم الصومعة (متوافق مع النظام القديم)
  async getLatestAvgBySiloNumber(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { start, end } = req.query;
      
      // استخدام الطريقة الجديدة المتوافقة مع النظام القديم
      const readings = await this._getLatestAvgBySiloNumberLegacyFormat(siloNumbers, start, end);
      
      // إرجاع البيانات مباشرة بدون تغليف (متوافق مع النظام القديم)
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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
      res.json(readings);
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

  // 🔹 دالة جديدة متوافقة مع النظام القديم - تستخدم readings_raw للبيانات الحديثة
  async _getLatestAvgBySiloNumberLegacyFormat(siloNumbers, startDate = null, endDate = null) {
    const { pool } = await import('../../infrastructure/database/db.js');
    
    // الحصول على معرفات الصوامع من أرقامها
    const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
    if (siloIds.length === 0) {
      return [];
    }

    // استعلام للحصول على أحدث القراءات من readings_raw (مثل النظام القديم)
    let query = `
      SELECT 
        s.id as silo_id,
        s.silo_number,
        sg.name as silo_group_name,
        sens.sensor_index,
        AVG(CAST(rr.value_c AS DECIMAL(10,2))) as avg_value_c,
        rr.polled_at
      FROM readings_raw rr
      INNER JOIN sensors sens ON rr.sensor_id = sens.id
      INNER JOIN cables c ON sens.cable_id = c.id
      INNER JOIN silos s ON c.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
      INNER JOIN (
        SELECT 
          c2.silo_id,
          sens2.sensor_index,
          MAX(rr2.polled_at) as max_polled_at
        FROM readings_raw rr2
        INNER JOIN sensors sens2 ON rr2.sensor_id = sens2.id
        INNER JOIN cables c2 ON sens2.cable_id = c2.id
        WHERE c2.silo_id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (startDate) {
      query += ' AND rr2.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND rr2.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY c2.silo_id, sens2.sensor_index
      ) latest ON c.silo_id = latest.silo_id 
                 AND sens.sensor_index = latest.sensor_index 
                 AND DATE_FORMAT(rr.polled_at, '%Y-%m-%d %H:%i:%s') = DATE_FORMAT(latest.max_polled_at, '%Y-%m-%d %H:%i:%s')
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
      GROUP BY s.id, s.silo_number, sg.name, sens.sensor_index, DATE_FORMAT(rr.polled_at, '%Y-%m-%d %H:%i:%s')
      ORDER BY s.silo_number, sens.sensor_index
    `;
    
    params.push(...siloIds);
    
    const [rows] = await pool.query(query, params);
    
    // تجميع البيانات حسب الصومعة وتنسيقها مثل النظام القديم
    const siloData = {};
    
    for (const row of rows) {
      const siloId = row.silo_id;
      if (!siloData[siloId]) {
        siloData[siloId] = {
          silo_group: row.silo_group_name,
          silo_number: row.silo_number,
          cable_number: null, // للقراءات المتوسطة
          timestamp: row.polled_at.toISOString().slice(0, 19), // إزالة الميلي ثانية
          levels: {}
        };
      }
      
      // إضافة درجة الحرارة للمستوى المناسب
      const level = row.sensor_index;
      const temp = parseFloat(row.avg_value_c);
      siloData[siloId].levels[level] = temp;
    }
    
    // تحويل البيانات إلى التنسيق المطلوب
    const result = [];
    
    for (const silo of Object.values(siloData)) {
      const formattedSilo = {
        silo_group: silo.silo_group,
        silo_number: silo.silo_number,
        cable_number: silo.cable_number,
        timestamp: silo.timestamp
      };
      
      let worstColor = "#46d446"; // أخضر افتراضي
      
      // إضافة 8 مستويات من درجات الحرارة والألوان
      for (let level = 0; level < 8; level++) {
        const temp = silo.levels[level];
        let color = "#46d446"; // أخضر افتراضي
        
        if (temp !== undefined) {
          formattedSilo[`level_${level}`] = Math.round(temp * 100) / 100;
          
          // تحديد اللون حسب درجة الحرارة (القيم الكبيرة تحتاج معايرة)
          if (temp <= -127 || temp > 50000) {
            color = "#8c9494"; // رمادي للانقطاع أو القيم الخاطئة
            worstColor = "#8c9494";
          } else if (temp > 38) {
            color = "#d14141"; // أحمر للحرج
            if (worstColor !== "#8c9494") worstColor = "#d14141";
          } else if (temp > 35) {
            color = "#c7c150"; // أصفر للتحذير
            if (worstColor === "#46d446") worstColor = "#c7c150";
          }
        } else {
          formattedSilo[`level_${level}`] = null;
          color = "#8c9494"; // رمادي لعدم وجود بيانات
          worstColor = "#8c9494";
        }
        
        formattedSilo[`color_${level}`] = color;
      }
      
      formattedSilo.silo_color = worstColor;
      result.push(formattedSilo);
    }
    
    // ترتيب حسب رقم الصومعة
    result.sort((a, b) => a.silo_number - b.silo_number);
    
    return result;
  }

  // 🔹 دالة للحصول على أحدث القراءات (غير متوسطة) من readings_raw
  async _getLatestBySiloNumberLegacyFormat(siloNumbers, startDate = null, endDate = null) {
    const { pool } = await import('../../infrastructure/database/db.js');
    
    // الحصول على معرفات الصوامع من أرقامها
    const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
    if (siloIds.length === 0) {
      return [];
    }

    // استعلام للحصول على أحدث القراءات من readings_raw لكل مستشعر في كل كابل
    let query = `
      SELECT 
        s.id as silo_id,
        s.silo_number,
        sg.name as silo_group_name,
        c.cable_index,
        sens.sensor_index,
        CAST(rr.value_c AS DECIMAL(10,2)) as value_c,
        rr.polled_at
      FROM readings_raw rr
      INNER JOIN sensors sens ON rr.sensor_id = sens.id
      INNER JOIN cables c ON sens.cable_id = c.id
      INNER JOIN silos s ON c.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
      INNER JOIN (
        SELECT 
          c2.silo_id,
          c2.cable_index,
          sens2.sensor_index,
          MAX(rr2.polled_at) as max_polled_at
        FROM readings_raw rr2
        INNER JOIN sensors sens2 ON rr2.sensor_id = sens2.id
        INNER JOIN cables c2 ON sens2.cable_id = c2.id
        WHERE c2.silo_id IN (${siloIds.map(() => '?').join(',')})
    `;
    
    const params = [...siloIds];
    
    if (startDate) {
      query += ' AND rr2.polled_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND rr2.polled_at <= ?';
      params.push(endDate);
    }
    
    query += `
        GROUP BY c2.silo_id, c2.cable_index, sens2.sensor_index
      ) latest ON c.silo_id = latest.silo_id 
                 AND c.cable_index = latest.cable_index
                 AND sens.sensor_index = latest.sensor_index 
                 AND rr.polled_at = latest.max_polled_at
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
      ORDER BY s.silo_number, c.cable_index, sens.sensor_index
    `;
    
    params.push(...siloIds);
    
    const [rows] = await pool.query(query, params);
    
    // تجميع البيانات حسب الصومعة والكابل
    const siloData = {};
    
    for (const row of rows) {
      const key = `${row.silo_id}_${row.cable_index}`;
      if (!siloData[key]) {
        siloData[key] = {
          silo_group: row.silo_group_name,
          silo_number: row.silo_number,
          cable_number: row.cable_index,
          timestamp: row.polled_at.toISOString().slice(0, 19),
          levels: {}
        };
      }
      
      const level = row.sensor_index;
      const temp = parseFloat(row.value_c);
      siloData[key].levels[level] = temp;
    }
    
    // تحويل البيانات إلى التنسيق المطلوب
    const result = [];
    
    for (const cable of Object.values(siloData)) {
      const formattedCable = {
        silo_group: cable.silo_group,
        silo_number: cable.silo_number,
        cable_number: cable.cable_number,
        timestamp: cable.timestamp
      };
      
      let worstColor = "#46d446"; // أخضر افتراضي
      
      // إضافة 8 مستويات من درجات الحرارة والألوان
      for (let level = 0; level < 8; level++) {
        const temp = cable.levels[level];
        let color = "#46d446"; // أخضر افتراضي
        
        if (temp !== undefined) {
          formattedCable[`level_${level}`] = Math.round(temp * 100) / 100;
          
          // تحديد اللون حسب درجة الحرارة (القيم الكبيرة تحتاج معايرة)
          if (temp <= -127 || temp > 50000) {
            color = "#8c9494"; // رمادي للانقطاع أو القيم الخاطئة
            worstColor = "#8c9494";
          } else if (temp > 38) {
            color = "#d14141"; // أحمر للحرج
            if (worstColor !== "#8c9494") worstColor = "#d14141";
          } else if (temp > 35) {
            color = "#c7c150"; // أصفر للتحذير
            if (worstColor === "#46d446") worstColor = "#c7c150";
          }
        } else {
          formattedCable[`level_${level}`] = null;
          color = "#8c9494"; // رمادي لعدم وجود بيانات
          worstColor = "#8c9494";
        }
        
        formattedCable[`color_${level}`] = color;
      }
      
      formattedCable.silo_color = worstColor;
      result.push(formattedCable);
    }
    
    // ترتيب حسب رقم الصومعة ثم رقم الكابل
    result.sort((a, b) => {
      if (a.silo_number !== b.silo_number) {
        return a.silo_number - b.silo_number;
      }
      return a.cable_number - b.cable_number;
    });
    
    return result;
  }

  // 🔹 دالة للحصول على القراءات التاريخية من جدول readings (للتقارير)
  async _getBySiloNumberReportsFormat(siloNumbers, startDate = null, endDate = null) {
    const { pool } = await import('../../infrastructure/database/db.js');
    
    // الحصول على معرفات الصوامع من أرقامها
    const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
    if (siloIds.length === 0) {
      return [];
    }

    // استعلام للحصول على القراءات التاريخية من جدول readings
    let query = `
      SELECT 
        s.id as silo_id,
        s.silo_number,
        sg.name as silo_group_name,
        c.cable_index,
        sens.sensor_index,
        r.value_c,
        r.sample_at
      FROM readings r
      INNER JOIN sensors sens ON r.sensor_id = sens.id
      INNER JOIN cables c ON sens.cable_id = c.id
      INNER JOIN silos s ON c.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
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
    
    query += ' ORDER BY s.silo_number, c.cable_index, sens.sensor_index, r.sample_at DESC';
    
    const [rows] = await pool.query(query, params);
    
    // تجميع البيانات حسب الصومعة والكابل والوقت
    const groupedData = {};
    
    for (const row of rows) {
      const key = `${row.silo_id}_${row.cable_index}_${row.sample_at.toISOString().slice(0, 19)}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          silo_group: row.silo_group_name,
          silo_number: row.silo_number,
          cable_number: row.cable_index,
          timestamp: row.sample_at.toISOString().slice(0, 19),
          levels: {}
        };
      }
      
      const level = row.sensor_index;
      const temp = parseFloat(row.value_c);
      groupedData[key].levels[level] = temp;
    }
    
    // تحويل البيانات إلى التنسيق المطلوب
    const result = [];
    
    for (const entry of Object.values(groupedData)) {
      const formattedEntry = {
        silo_group: entry.silo_group,
        silo_number: entry.silo_number,
        cable_number: entry.cable_number,
        timestamp: entry.timestamp
      };
      
      let worstColor = "#46d446"; // أخضر افتراضي
      
      // إضافة 8 مستويات من درجات الحرارة والألوان
      for (let level = 0; level < 8; level++) {
        const temp = entry.levels[level];
        let color = "#46d446"; // أخضر افتراضي
        
        if (temp !== undefined) {
          formattedEntry[`level_${level}`] = Math.round(temp * 100) / 100;
          
          // تحديد اللون حسب درجة الحرارة
          if (temp <= -127) {
            color = "#8c9494"; // رمادي للانقطاع
            worstColor = "#8c9494";
          } else if (temp > 38) {
            color = "#d14141"; // أحمر للحرج
            if (worstColor !== "#8c9494") worstColor = "#d14141";
          } else if (temp > 35) {
            color = "#c7c150"; // أصفر للتحذير
            if (worstColor === "#46d446") worstColor = "#c7c150";
          }
        } else {
          formattedEntry[`level_${level}`] = null;
          color = "#8c9494"; // رمادي لعدم وجود بيانات
          worstColor = "#8c9494";
        }
        
        formattedEntry[`color_${level}`] = color;
      }
      
      formattedEntry.silo_color = worstColor;
      result.push(formattedEntry);
    }
    
    // ترتيب حسب رقم الصومعة ثم رقم الكابل ثم الوقت
    result.sort((a, b) => {
      if (a.silo_number !== b.silo_number) {
        return a.silo_number - b.silo_number;
      }
      if (a.cable_number !== b.cable_number) {
        return a.cable_number - b.cable_number;
      }
      return new Date(b.timestamp) - new Date(a.timestamp); // أحدث أولاً
    });
    
    return result;
  }

  // 🔹 دالة للحصول على القراءات المتوسطة التاريخية من جدول readings (للتقارير)
  async _getAvgBySiloNumberReportsFormat(siloNumbers, startDate = null, endDate = null) {
    const { pool } = await import('../../infrastructure/database/db.js');
    
    // الحصول على معرفات الصوامع من أرقامها
    const siloIds = await this._getSiloIdsByNumbers(siloNumbers);
    if (siloIds.length === 0) {
      return [];
    }

    // استعلام للحصول على القراءات المتوسطة التاريخية من جدول readings
    let query = `
      SELECT 
        s.id as silo_id,
        s.silo_number,
        sg.name as silo_group_name,
        sens.sensor_index,
        AVG(r.value_c) as avg_value_c,
        DATE_FORMAT(r.sample_at, '%Y-%m-%d %H:%i:%s') as sample_time
      FROM readings r
      INNER JOIN sensors sens ON r.sensor_id = sens.id
      INNER JOIN cables c ON sens.cable_id = c.id
      INNER JOIN silos s ON c.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
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
      GROUP BY s.id, s.silo_number, sg.name, sens.sensor_index, DATE_FORMAT(r.sample_at, '%Y-%m-%d %H:%i:%s')
      ORDER BY s.silo_number, sample_time DESC, sens.sensor_index
    `;
    
    const [rows] = await pool.query(query, params);
    
    // تجميع البيانات حسب الصومعة والوقت
    const groupedData = {};
    
    for (const row of rows) {
      const key = `${row.silo_id}_${row.sample_time}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          silo_group: row.silo_group_name,
          silo_number: row.silo_number,
          cable_number: null, // للقراءات المتوسطة
          timestamp: row.sample_time,
          levels: {}
        };
      }
      
      const level = row.sensor_index;
      const temp = parseFloat(row.avg_value_c);
      groupedData[key].levels[level] = temp;
    }
    
    // تحويل البيانات إلى التنسيق المطلوب
    const result = [];
    
    for (const entry of Object.values(groupedData)) {
      const formattedEntry = {
        silo_group: entry.silo_group,
        silo_number: entry.silo_number,
        cable_number: entry.cable_number,
        timestamp: entry.timestamp
      };
      
      let worstColor = "#46d446"; // أخضر افتراضي
      
      // إضافة 8 مستويات من درجات الحرارة والألوان
      for (let level = 0; level < 8; level++) {
        const temp = entry.levels[level];
        let color = "#46d446"; // أخضر افتراضي
        
        if (temp !== undefined) {
          formattedEntry[`level_${level}`] = Math.round(temp * 100) / 100;
          
          // تحديد اللون حسب درجة الحرارة
          if (temp <= -127) {
            color = "#8c9494"; // رمادي للانقطاع
            worstColor = "#8c9494";
          } else if (temp > 38) {
            color = "#d14141"; // أحمر للحرج
            if (worstColor !== "#8c9494") worstColor = "#d14141";
          } else if (temp > 35) {
            color = "#c7c150"; // أصفر للتحذير
            if (worstColor === "#46d446") worstColor = "#c7c150";
          }
        } else {
          formattedEntry[`level_${level}`] = null;
          color = "#8c9494"; // رمادي لعدم وجود بيانات
          worstColor = "#8c9494";
        }
        
        formattedEntry[`color_${level}`] = color;
      }
      
      formattedEntry.silo_color = worstColor;
      result.push(formattedEntry);
    }
    
    // ترتيب حسب رقم الصومعة ثم الوقت (أحدث أولاً)
    result.sort((a, b) => {
      if (a.silo_number !== b.silo_number) {
        return a.silo_number - b.silo_number;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    return result;
  }
}
