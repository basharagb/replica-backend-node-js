// ==============================
// 📦 Imports
// ==============================
import express from 'express';
import { UserController } from '../controllers/userController.js';

const router = express.Router();
const controller = new UserController();

// ==============================
// 👤 User Routes - مسارات المستخدمين
// ==============================

// 🔹 تسجيل الدخول
router.post('/login', controller.login.bind(controller));

// 🔹 تسجيل الخروج
router.post('/logout', controller.logout.bind(controller));

// 🔹 التحقق من صحة التوكن
router.get('/verify-token', controller.verifyToken.bind(controller));

// 🔹 جلب جميع المستخدمين
router.get('/', controller.getAll.bind(controller));

// 🔹 جلب مستخدم حسب المعرف
router.get('/:id', controller.getById.bind(controller));

// 🔹 جلب المستخدمين حسب الدور
router.get('/role/:role', controller.getByRole.bind(controller));

// 🔹 إحصائيات المستخدمين
router.get('/stats/summary', controller.getStats.bind(controller));

// 🔹 إنشاء مستخدم جديد
router.post('/', controller.create.bind(controller));

// 🔹 تحديث مستخدم موجود
router.put('/:id', controller.update.bind(controller));

// 🔹 حذف مستخدم (إلغاء تفعيل)
router.delete('/:id', controller.delete.bind(controller));

// 🔹 حذف مستخدم نهائياً
router.delete('/:id/permanent', controller.permanentDelete.bind(controller));

// 🔹 تغيير كلمة المرور
router.patch('/:id/change-password', controller.changePassword.bind(controller));

export default router;
