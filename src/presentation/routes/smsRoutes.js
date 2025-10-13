// ==============================
// 📦 Imports
// ==============================
import express from 'express';
import { SmsController } from '../controllers/smsController.js';

const router = express.Router();
const controller = new SmsController();

// ==============================
// 📱 SMS Routes - مسارات الرسائل النصية
// ==============================

// 🔹 إرسال رسالة SMS
router.post('/', controller.sendMessage.bind(controller));
router.post('/send', controller.sendMessage.bind(controller));

// 🔹 فحص حالة خدمة GSM
router.get('/health', controller.getGsmHealth.bind(controller));

// 🔹 إرسال تنبيه طوارئ
router.post('/emergency', controller.sendEmergencyAlert.bind(controller));

// 🔹 جلب سجل الرسائل المرسلة
router.get('/history', controller.getMessageHistory.bind(controller));

// 🔹 إحصائيات الرسائل
router.get('/stats', controller.getMessageStats.bind(controller));

export default router;
