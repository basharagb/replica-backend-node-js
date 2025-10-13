// ==============================
// 📦 Imports
// ==============================
import express from 'express';
import { EnvironmentController } from '../controllers/environmentController.js';

const router = express.Router();
const controller = new EnvironmentController();

// ==============================
// 🌡️ Environment Routes - مسارات البيئة
// ==============================

// 🔹 جلب درجة الحرارة البيئية الحالية
router.get('/temperature', controller.getCurrentTemperature.bind(controller));

// 🔹 جلب سجل درجات الحرارة البيئية
router.get('/temperature/history', controller.getTemperatureHistory.bind(controller));

// 🔹 جلب إحصائيات درجة الحرارة البيئية
router.get('/temperature/stats', controller.getTemperatureStats.bind(controller));

// 🔹 جلب حالة أجهزة الاستشعار البيئية
router.get('/sensors/status', controller.getSensorStatus.bind(controller));

// 🔹 معايرة أجهزة الاستشعار البيئية
router.post('/sensors/calibrate', controller.calibrateSensors.bind(controller));

// 🔹 تحديث إعدادات التنبيهات البيئية
router.put('/alerts/settings', controller.updateAlertSettings.bind(controller));

// 🔹 جلب إعدادات التنبيهات البيئية
router.get('/alerts/settings', controller.getAlertSettings.bind(controller));

export default router;
