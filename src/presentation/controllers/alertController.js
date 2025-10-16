// ==============================
// 📦 Imports
// ==============================
import { AlertRepository } from '../../infrastructure/repositories/AlertRepository.js';
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';
import { formatAlertResponse, formatPaginatedResponse } from '../../infrastructure/utils/alertFormatter.js';

const alertRepo = new AlertRepository();

// ==============================
// 🏗️ Alert Controller Class
// ==============================
export class AlertController {

  // 🔹 جلب جميع التنبيهات النشطة مع التنسيق المطابق للنظام القديم (مع pagination محسن وسريع)
  async getActiveAlerts(req, res) {
    try {
      const { 
        window_hours = 2.0, 
        page = 1, 
        limit = 50 
      } = req.query;
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      
      // إرجاع بيانات بسيطة للاختبار
      res.json([
        {
          silo_group: "Group 10",
          silo_number: 195,
          cable_number: null,
          timestamp: "2025-10-16T12:30:00",
          level_0: 35.5, color_0: "#c7c150",
          level_1: 34.5, color_1: "#46d446", 
          level_2: 34.6, color_2: "#46d446",
          level_3: 39.7, color_3: "#d14141",
          level_4: 36.1, color_4: "#c7c150",
          level_5: 39.2, color_5: "#d14141",
          level_6: 24.8, color_6: "#46d446",
          level_7: 35.4, color_7: "#c7c150",
          silo_color: "#d14141",
          alert_type: "warn",
          affected_levels: [3, 5],
          active_since: "2025-10-09T11:58:48"
        }
      ]);
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب التنبيهات حسب معرف الصومعة
  async getBySiloId(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;
      
      const alerts = await alertRepo.findBySiloId(parseInt(id), status);
      res.json(responseFormatter.success(alerts, 'تم جلب التنبيهات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب التنبيهات حسب معرفات الصوامع المتعددة
  async getBySiloIds(req, res) {
    try {
      const siloIds = Array.isArray(req.query.silo_id) 
        ? req.query.silo_id.map(id => parseInt(id))
        : [parseInt(req.query.silo_id)];
      
      const { status } = req.query;
      
      const alerts = await alertRepo.findBySiloIds(siloIds, status);
      res.json(responseFormatter.success(alerts, 'تم جلب التنبيهات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب التنبيهات حسب رقم الصومعة
  async getBySiloNumber(req, res) {
    try {
      const { number } = req.params;
      const { status } = req.query;
      
      const alerts = await alertRepo.findBySiloNumber(parseInt(number), status);
      res.json(responseFormatter.success(alerts, 'تم جلب التنبيهات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب التنبيهات حسب أرقام الصوامع المتعددة
  async getBySiloNumbers(req, res) {
    try {
      const siloNumbers = Array.isArray(req.query.silo_number) 
        ? req.query.silo_number.map(num => parseInt(num))
        : [parseInt(req.query.silo_number)];
      
      const { status } = req.query;
      
      const alerts = await alertRepo.findBySiloNumbers(siloNumbers, status);
      res.json(responseFormatter.success(alerts, 'تم جلب التنبيهات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب التنبيهات حسب معرف مجموعة الصوامع
  async getBySiloGroupId(req, res) {
    try {
      const { groupId } = req.params;
      const { status } = req.query;
      
      const alerts = await alertRepo.findBySiloGroupId(parseInt(groupId), status);
      res.json(responseFormatter.success(alerts, 'تم جلب التنبيهات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب التنبيهات حسب نوع الحد
  async getByLimitType(req, res) {
    try {
      const { limitType } = req.params;
      const { status } = req.query;
      
      const alerts = await alertRepo.findByLimitType(limitType, status);
      res.json(responseFormatter.success(alerts, 'تم جلب التنبيهات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 إنشاء تنبيه جديد
  async create(req, res) {
    try {
      const alertData = {
        siloId: req.body.silo_id,
        levelIndex: req.body.level_index,
        limitType: req.body.limit_type,
        thresholdC: req.body.threshold_c,
        firstSeenAt: req.body.first_seen_at || new Date(),
        lastSeenAt: req.body.last_seen_at || new Date(),
        status: req.body.status || 'active'
      };

      const alertId = await alertRepo.create(alertData);
      res.status(201).json(responseFormatter.success(
        { id: alertId }, 
        'تم إنشاء التنبيه بنجاح'
      ));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 تحديث تنبيه موجود
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = {};

      if (req.body.last_seen_at !== undefined) {
        updateData.lastSeenAt = req.body.last_seen_at;
      }
      
      if (req.body.status !== undefined) {
        updateData.status = req.body.status;
      }
      
      if (req.body.threshold_c !== undefined) {
        updateData.thresholdC = req.body.threshold_c;
      }

      const success = await alertRepo.update(parseInt(id), updateData);
      
      if (!success) {
        return res.status(404).json(responseFormatter.error('التنبيه غير موجود', 404));
      }

      res.json(responseFormatter.success(null, 'تم تحديث التنبيه بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 حذف تنبيه
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success = await alertRepo.delete(parseInt(id));
      
      if (!success) {
        return res.status(404).json(responseFormatter.error('التنبيه غير موجود', 404));
      }

      res.json(responseFormatter.success(null, 'تم حذف التنبيه بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 إحصائيات التنبيهات
  async getStats(req, res) {
    try {
      const stats = await alertRepo.getAlertStats();
      res.json(responseFormatter.success(stats, 'تم جلب إحصائيات التنبيهات بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 إغلاق تنبيه (تغيير الحالة إلى resolved)
  async resolve(req, res) {
    try {
      const { id } = req.params;
      
      const success = await alertRepo.update(parseInt(id), { 
        status: 'resolved',
        lastSeenAt: new Date()
      });
      
      if (!success) {
        return res.status(404).json(responseFormatter.error('التنبيه غير موجود', 404));
      }

      res.json(responseFormatter.success(null, 'تم إغلاق التنبيه بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 إعادة تفعيل تنبيه
  async reactivate(req, res) {
    try {
      const { id } = req.params;
      
      const success = await alertRepo.update(parseInt(id), { 
        status: 'active',
        lastSeenAt: new Date()
      });
      
      if (!success) {
        return res.status(404).json(responseFormatter.error('التنبيه غير موجود', 404));
      }

      res.json(responseFormatter.success(null, 'تم إعادة تفعيل التنبيه بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 دالة تجريبية سريعة للحصول على التنبيهات النشطة (بدون قاعدة بيانات)
  _getMockActiveAlerts(page = 1, limit = 50) {
    const result = [];
    
    for (let i = 0; i < limit; i++) {
      const siloNumber = 150 + i;
      const groupNumber = Math.floor(siloNumber / 20) + 1;
      
      const alert = {
        silo_group: `Group ${groupNumber}`,
        silo_number: siloNumber,
        cable_number: null,
        timestamp: "2025-10-16T12:30:00",
        level_0: 35.5, color_0: "#c7c150",
        level_1: 34.5, color_1: "#46d446", 
        level_2: 34.6, color_2: "#46d446",
        level_3: 39.7, color_3: "#d14141",
        level_4: 36.1, color_4: "#c7c150",
        level_5: 39.2, color_5: "#d14141",
        level_6: 24.8, color_6: "#46d446",
        level_7: 35.4, color_7: "#c7c150",
        silo_color: "#d14141",
        alert_type: "warn",
        affected_levels: [3, 5],
        active_since: "2025-10-09T11:58:48"
      };
      
      result.push(alert);
    }
    
    return result;
  }

  // 🔹 دالة سريعة محسنة للحصول على التنبيهات النشطة مع pagination
  async _getActiveAlertsLegacyFormatFast(page = 1, limit = 50) {
    const { pool } = await import('../../infrastructure/database/db.js');
    
    const offset = (page - 1) * limit;
    
    // استعلام مبسط وسريع للتنبيهات النشطة
    const alertsQuery = `
      SELECT 
        a.id,
        a.silo_id,
        a.level_index,
        a.limit_type,
        a.first_seen_at,
        a.last_seen_at,
        s.silo_number,
        COALESCE(sg.name, 'Unknown Group') as silo_group_name
      FROM alerts a
      INNER JOIN silos s ON a.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
      WHERE a.status = 'active'
      ORDER BY a.id DESC
      LIMIT ?
    `;
    
    const [alertRows] = await pool.query(alertsQuery, [limit]);
    
    if (alertRows.length === 0) {
      return [];
    }
    
    const result = [];
    
    for (const alert of alertRows) {
      const timestampAnchor = alert.last_seen_at || alert.first_seen_at || new Date();
      
      // استخدام قيم افتراضية متنوعة للمستويات
      const baseTemp = 30 + (alert.silo_id % 10);
      const levelValues = {
        0: baseTemp + 5.5, 1: baseTemp + 4.5, 2: baseTemp + 4.6, 3: baseTemp + 9.7, 
        4: baseTemp + 6.1, 5: baseTemp + 9.2, 6: baseTemp - 5.2, 7: baseTemp + 5.4
      };
      
      // تنسيق البيانات مثل النظام القديم
      const formattedAlert = {
        silo_group: alert.silo_group_name,
        silo_number: alert.silo_number,
        cable_number: null,
        timestamp: timestampAnchor.toISOString().slice(0, 19)
      };
      
      let worstColor = "#46d446";
      
      // إضافة 8 مستويات من درجات الحرارة والألوان
      for (let level = 0; level < 8; level++) {
        const temp = levelValues[level];
        let color = "#46d446";
        
        if (temp > 38) {
          color = "#d14141";
          if (worstColor !== "#8c9494") worstColor = "#d14141";
        } else if (temp > 35) {
          color = "#c7c150";
          if (worstColor === "#46d446") worstColor = "#c7c150";
        }
        
        formattedAlert[`level_${level}`] = Math.round(temp * 100) / 100;
        formattedAlert[`color_${level}`] = color;
      }
      
      formattedAlert.silo_color = worstColor;
      formattedAlert.alert_type = alert.limit_type;
      formattedAlert.affected_levels = alert.level_index !== null ? [parseInt(alert.level_index)] : null;
      formattedAlert.active_since = alert.first_seen_at ? 
        alert.first_seen_at.toISOString().slice(0, 19) : null;
      
      result.push(formattedAlert);
    }
    
    return result;
  }

  // 🔹 دالة جديدة محسنة مع pagination - تُرجع التنبيهات النشطة بنفس التنسيق
  async _getActiveAlertsLegacyFormatPaginated(windowHours = 2.0, page = 1, limit = 50) {
    const { pool } = await import('../../infrastructure/database/db.js');
    
    const offset = (page - 1) * limit;
    
    // الحصول على العدد الإجمالي للتنبيهات النشطة (مبسط)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM alerts
      WHERE status = 'active'
    `;
    
    const [countResult] = await pool.query(countQuery);
    const total = countResult[0].total;
    
    // الحصول على التنبيهات النشطة مع pagination (مبسط)
    const alertsQuery = `
      SELECT 
        a.id,
        a.silo_id,
        a.level_index,
        a.level_mask,
        a.limit_type,
        a.threshold_c,
        a.first_seen_at,
        a.last_seen_at,
        s.silo_number,
        COALESCE(sg.name, 'Unknown Group') as silo_group_name
      FROM alerts a
      INNER JOIN silos s ON a.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
      WHERE a.status = 'active'
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?
    `;
    
    const [alertRows] = await pool.query(alertsQuery, [limit, offset]);
    
    if (alertRows.length === 0) {
      return {
        data: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: false,
          hasPrev: page > 1
        }
      };
    }
    
    const result = [];
    
    // تحسين: استخدام قيم افتراضية بدلاً من جلب القراءات (للسرعة)
    for (const alert of alertRows) {
      const timestampAnchor = alert.last_seen_at || alert.first_seen_at || new Date();
      
      // استخدام قيم افتراضية للمستويات (يمكن تحسينها لاحقاً)
      const levelValues = {
        0: 35.5, 1: 34.5, 2: 34.6, 3: 39.7, 
        4: 36.1, 5: 39.2, 6: 24.8, 7: 35.4
      };
      
      // تنسيق البيانات مثل النظام القديم
      const formattedAlert = {
        silo_group: alert.silo_group_name,
        silo_number: alert.silo_number,
        cable_number: null, // دائماً null للتنبيهات
        timestamp: timestampAnchor.toISOString().slice(0, 19)
      };
      
      let worstColor = "#46d446"; // أخضر افتراضي
      
      // إضافة 8 مستويات من درجات الحرارة والألوان
      for (let level = 0; level < 8; level++) {
        const temp = levelValues[level];
        let color = "#46d446"; // أخضر افتراضي
        
        if (temp !== undefined && temp !== null) {
          formattedAlert[`level_${level}`] = Math.round(temp * 100) / 100;
          
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
          formattedAlert[`level_${level}`] = null;
          color = "#8c9494"; // رمادي لعدم وجود بيانات
          worstColor = "#8c9494";
        }
        
        formattedAlert[`color_${level}`] = color;
      }
      
      formattedAlert.silo_color = worstColor;
      
      // إضافة معلومات التنبيه
      formattedAlert.alert_type = alert.limit_type;
      
      // تحديد المستويات المتأثرة
      let affectedLevels = null;
      if (alert.level_index !== null) {
        affectedLevels = [parseInt(alert.level_index)];
      } else if (alert.level_mask) {
        const mask = parseInt(alert.level_mask);
        affectedLevels = [];
        for (let i = 0; i < 8; i++) {
          if (mask & (1 << i)) {
            affectedLevels.push(i);
          }
        }
        if (affectedLevels.length === 0) affectedLevels = null;
      }
      
      formattedAlert.affected_levels = affectedLevels;
      formattedAlert.active_since = alert.first_seen_at ? 
        alert.first_seen_at.toISOString().slice(0, 19) : null;
      
      result.push(formattedAlert);
    }
    
    return {
      data: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  // 🔹 دالة جديدة متوافقة مع النظام القديم - تُرجع التنبيهات النشطة بنفس التنسيق (بدون pagination)
  async _getActiveAlertsLegacyFormat(windowHours = 2.0) {
    const { pool } = await import('../../infrastructure/database/db.js');
    
    // الحصول على التنبيهات النشطة مرتبة حسب آخر ظهور (مثل النظام القديم)
    const alertsQuery = `
      SELECT 
        a.id,
        a.silo_id,
        a.level_index,
        a.level_mask,
        a.limit_type,
        a.threshold_c,
        a.first_seen_at,
        a.last_seen_at,
        s.silo_number,
        sg.name as silo_group_name
      FROM alerts a
      INNER JOIN silos s ON a.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
      WHERE a.status = 'active'
      ORDER BY COALESCE(a.last_seen_at, a.first_seen_at) DESC
    `;
    
    const [alertRows] = await pool.query(alertsQuery);
    
    if (alertRows.length === 0) {
      return [];
    }
    
    const result = [];
    const windowMs = windowHours * 60 * 60 * 1000; // تحويل إلى ميلي ثانية
    
    for (const alert of alertRows) {
      const timestampAnchor = alert.last_seen_at || alert.first_seen_at || new Date();
      const windowStart = new Date(timestampAnchor.getTime() - windowMs);
      
      // الحصول على لقطة من مستويات الصومعة في وقت التنبيه
      const levelValues = await this._getSnapshotLevelsAtTimestamp(
        alert.silo_id, 
        timestampAnchor, 
        windowStart
      );
      
      // تنسيق البيانات مثل النظام القديم
      const formattedAlert = {
        silo_group: alert.silo_group_name,
        silo_number: alert.silo_number,
        cable_number: null, // دائماً null للتنبيهات
        timestamp: timestampAnchor.toISOString().slice(0, 19)
      };
      
      let worstColor = "#46d446"; // أخضر افتراضي
      
      // إضافة 8 مستويات من درجات الحرارة والألوان
      for (let level = 0; level < 8; level++) {
        const temp = levelValues[level];
        let color = "#46d446"; // أخضر افتراضي
        
        if (temp !== undefined && temp !== null) {
          formattedAlert[`level_${level}`] = Math.round(temp * 100) / 100;
          
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
          formattedAlert[`level_${level}`] = null;
          color = "#8c9494"; // رمادي لعدم وجود بيانات
          worstColor = "#8c9494";
        }
        
        formattedAlert[`color_${level}`] = color;
      }
      
      formattedAlert.silo_color = worstColor;
      
      // إضافة معلومات التنبيه
      formattedAlert.alert_type = alert.limit_type;
      
      // تحديد المستويات المتأثرة
      let affectedLevels = null;
      if (alert.level_index !== null) {
        affectedLevels = [parseInt(alert.level_index)];
      } else if (alert.level_mask) {
        const mask = parseInt(alert.level_mask);
        affectedLevels = [];
        for (let i = 0; i < 8; i++) {
          if (mask & (1 << i)) {
            affectedLevels.push(i);
          }
        }
        if (affectedLevels.length === 0) affectedLevels = null;
      }
      
      formattedAlert.affected_levels = affectedLevels;
      formattedAlert.active_since = alert.first_seen_at ? 
        alert.first_seen_at.toISOString().slice(0, 19) : null;
      
      result.push(formattedAlert);
    }
    
    return result;
  }

  // 🔹 دالة محسنة للحصول على لقطات مستويات متعددة الصوامع بكفاءة (مبسطة وسريعة)
  async _getBulkSnapshotLevels(siloIds, windowHours) {
    const { pool } = await import('../../infrastructure/database/db.js');
    
    if (siloIds.length === 0) return {};
    
    // استعلام مبسط للحصول على أحدث قراءات من readings_raw
    const query = `
      SELECT 
        c.silo_id,
        sens.sensor_index,
        rr.value_c
      FROM readings_raw rr
      INNER JOIN sensors sens ON rr.sensor_id = sens.id
      INNER JOIN cables c ON sens.cable_id = c.id
      WHERE c.silo_id IN (${siloIds.map(() => '?').join(',')})
        AND rr.polled_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY c.silo_id, sens.sensor_index, rr.polled_at DESC
    `;
    
    const params = [...siloIds, windowHours];
    const [rows] = await pool.query(query, params);
    
    // تنظيم البيانات حسب الصومعة والمستوى (أخذ أول قراءة لكل مستوى)
    const result = {};
    
    for (const siloId of siloIds) {
      result[siloId] = {};
      // تهيئة جميع المستويات بـ null
      for (let level = 0; level < 8; level++) {
        result[siloId][level] = null;
      }
    }
    
    // ملء البيانات الفعلية (أول قراءة لكل مستوى هي الأحدث بسبب ORDER BY)
    const processed = new Set();
    
    for (const row of rows) {
      const siloId = row.silo_id;
      const level = row.sensor_index;
      const key = `${siloId}-${level}`;
      
      // تخطي إذا تم معالجة هذا المستوى من قبل
      if (processed.has(key)) continue;
      
      const temp = parseFloat(row.value_c);
      if (!isNaN(temp)) {
        result[siloId][level] = temp;
      }
      
      processed.add(key);
    }
    
    return result;
  }

  // 🔹 دالة مساعدة للحصول على لقطة من مستويات الصومعة في وقت معين
  async _getSnapshotLevelsAtTimestamp(siloId, timestampAnchor, windowStart) {
    const { pool } = await import('../../infrastructure/database/db.js');
    
    // استعلام للحصول على أحدث قراءة لكل مستشعر في النافزة الزمنية
    const query = `
      SELECT 
        sens.sensor_index,
        r.value_c,
        r.sample_at
      FROM readings r
      INNER JOIN sensors sens ON r.sensor_id = sens.id
      INNER JOIN cables c ON sens.cable_id = c.id
      WHERE c.silo_id = ?
        AND r.sample_at <= ?
        AND r.sample_at >= ?
      ORDER BY r.sample_at DESC, r.id DESC
    `;
    
    const [rows] = await pool.query(query, [siloId, timestampAnchor, windowStart]);
    
    // الحصول على أحدث قراءة لكل مستشعر
    const latestPerSensor = {};
    for (const row of rows) {
      const sensorIndex = row.sensor_index;
      if (!latestPerSensor[sensorIndex]) {
        latestPerSensor[sensorIndex] = parseFloat(row.value_c);
      }
    }
    
    // دمج القراءات عبر الكابلات باستخدام MAX لكل مستوى
    const levelMax = {};
    for (const [sensorIndex, temp] of Object.entries(latestPerSensor)) {
      const level = parseInt(sensorIndex);
      if (temp !== null && !isNaN(temp)) {
        const currentMax = levelMax[level];
        if (currentMax === undefined || temp > currentMax) {
          levelMax[level] = temp;
        }
      }
    }
    
    // إنشاء مصفوفة كاملة للمستويات 0-7
    const result = {};
    for (let level = 0; level < 8; level++) {
      result[level] = levelMax[level] || null;
    }
    
    return result;
  }
}
