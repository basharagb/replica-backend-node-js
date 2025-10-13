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

  // 🔹 جلب جميع التنبيهات النشطة مع التنسيق المطابق للنظام القديم
  async getActiveAlerts(req, res) {
    try {
      const { 
        window_hours = 2.0, 
        page = 1, 
        limit = 50,
        end 
      } = req.query;
      
      const options = {
        endDate: end,
        page: parseInt(page),
        limit: parseInt(limit),
        windowHours: parseFloat(window_hours)
      };
      
      const result = await alertRepo.findActiveAlerts(options);
      
      if (!result.alerts || result.alerts.length === 0) {
        return res.json([]);
      }
      
      // Format each alert to match old Python system structure
      const formattedAlerts = [];
      
      for (const alert of result.alerts) {
        const timestampAnchor = alert.lastSeenAt || alert.firstSeenAt || new Date();
        
        // Get snapshot of silo levels at alert time
        const levelValues = await alertRepo.getSnapshotLevelsAtTimestamp(
          alert.siloId, 
          timestampAnchor, 
          options.windowHours
        );
        
        // Format the alert response to match Python system
        const formattedAlert = formatAlertResponse(alert, levelValues, null);
        formattedAlerts.push(formattedAlert);
      }
      
      // Return paginated response in old system format
      const response = formatPaginatedResponse(
        formattedAlerts, 
        result.pagination, 
        'Active alerts retrieved successfully'
      );
      
      res.json(response);
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
}
