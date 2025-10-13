// ==============================
// 📦 Imports
// ==============================
import express from 'express';
import { SiloLevelController } from '../controllers/siloLevelController.js';

const router = express.Router();
const controller = new SiloLevelController();

// ==============================
// 📊 Silo Level Routes - مسارات مستوى الصوامع
// ==============================

// 🔹 تقدير مستوى الملء حسب رقم الصومعة
router.get('/by-number', controller.getLevelEstimateByNumber.bind(controller));

// 🔹 تقدير مستوى الملء لعدة صوامع حسب المعرف
router.get('/by-ids', controller.getLevelEstimateByIds.bind(controller));

// 🔹 جلب إحصائيات مستويات الملء لجميع الصوامع
router.get('/stats/all', controller.getAllLevelStats.bind(controller));

// 🔹 تقدير مستوى الملء حسب معرف الصومعة (must be last to avoid conflicts)
router.get('/:id', controller.getLevelEstimateById.bind(controller));

// 🔹 تحديث معايير تقدير مستوى الملء
router.put('/calibration', controller.updateLevelCalibration.bind(controller));

export default router;
