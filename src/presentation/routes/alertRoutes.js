// ==============================
// 📦 Imports
// ==============================
import express from 'express';
import { AlertController } from '../controllers/alertController.js';

const router = express.Router();
const controller = new AlertController();

// ==============================
// 🚨 Alert Routes - مسارات التنبيهات
// ==============================

// 🔹 التنبيهات النشطة
router.get('/active', controller.getActiveAlerts.bind(controller));

// 🔹 التنبيهات حسب معرف الصومعة
router.get('/silo/:id', controller.getBySiloId.bind(controller));
router.get('/by-silo-id', controller.getBySiloIds.bind(controller));

// 🔹 التنبيهات حسب رقم الصومعة
router.get('/silo-number/:number', controller.getBySiloNumber.bind(controller));
router.get('/by-silo-number', controller.getBySiloNumbers.bind(controller));

// 🔹 التنبيهات حسب معرف مجموعة الصوامع
router.get('/silo-group/:groupId', controller.getBySiloGroupId.bind(controller));

// 🔹 التنبيهات حسب نوع الحد
router.get('/limit-type/:limitType', controller.getByLimitType.bind(controller));

// 🔹 إحصائيات التنبيهات
router.get('/stats', controller.getStats.bind(controller));

// 🔹 إنشاء تنبيه جديد
router.post('/', controller.create.bind(controller));

// 🔹 تحديث تنبيه موجود
router.put('/:id', controller.update.bind(controller));

// 🔹 حذف تنبيه
router.delete('/:id', controller.delete.bind(controller));

// 🔹 إغلاق تنبيه (تغيير الحالة إلى resolved)
router.patch('/:id/resolve', controller.resolve.bind(controller));

// 🔹 إعادة تفعيل تنبيه
router.patch('/:id/reactivate', controller.reactivate.bind(controller));

export default router;
