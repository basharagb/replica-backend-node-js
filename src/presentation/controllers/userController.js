// ==============================
// 📦 Imports
// ==============================
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';
import { responseFormatter } from '../../infrastructure/utils/responseFormatter.js';
import { handleError } from '../../infrastructure/utils/errorHandler.js';
import jwt from 'jsonwebtoken';

const userRepo = new UserRepository();

// ==============================
// 🏗️ User Controller Class
// ==============================
export class UserController {

  // 🔹 تسجيل الدخول
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json(
          responseFormatter.error('اسم المستخدم وكلمة المرور مطلوبان', 400)
        );
      }

      const user = await userRepo.validatePassword(username, password);

      if (!user) {
        return res.status(401).json(
          responseFormatter.error('اسم المستخدم أو كلمة المرور غير صحيحة', 401)
        );
      }

      // إنشاء JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'silo-monitoring-secret',
        { expiresIn: '24h' }
      );

      // تحديث آخر تسجيل دخول
      await userRepo.updateLastLogin(user.id);

      const responseData = {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };

      res.json(responseFormatter.success(responseData, 'تم تسجيل الدخول بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب جميع المستخدمين
  async getAll(req, res) {
    try {
      const users = await userRepo.findAll();
      res.json(responseFormatter.success(users, 'تم جلب المستخدمين بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب مستخدم حسب المعرف
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userRepo.findById(parseInt(id));

      if (!user) {
        return res.status(404).json(responseFormatter.error('المستخدم غير موجود', 404));
      }

      res.json(responseFormatter.success(user, 'تم جلب المستخدم بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 جلب المستخدمين حسب الدور
  async getByRole(req, res) {
    try {
      const { role } = req.params;
      const users = await userRepo.findByRole(role);
      res.json(responseFormatter.success(users, 'تم جلب المستخدمين بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 إنشاء مستخدم جديد
  async create(req, res) {
    try {
      const userData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role || 'user',
        isActive: req.body.is_active !== undefined ? req.body.is_active : true
      };

      // التحقق من البيانات المطلوبة
      if (!userData.username || !userData.email || !userData.password) {
        return res.status(400).json(
          responseFormatter.error('اسم المستخدم والبريد الإلكتروني وكلمة المرور مطلوبة', 400)
        );
      }

      const userId = await userRepo.create(userData);
      res.status(201).json(responseFormatter.success(
        { id: userId }, 
        'تم إنشاء المستخدم بنجاح'
      ));
    } catch (err) {
      if (err.message.includes('already exists')) {
        return res.status(409).json(responseFormatter.error(err.message, 409));
      }
      handleError(res, err);
    }
  }

  // 🔹 تحديث مستخدم موجود
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = {};

      if (req.body.username !== undefined) {
        updateData.username = req.body.username;
      }
      
      if (req.body.email !== undefined) {
        updateData.email = req.body.email;
      }
      
      if (req.body.password !== undefined) {
        updateData.password = req.body.password;
      }
      
      if (req.body.role !== undefined) {
        updateData.role = req.body.role;
      }
      
      if (req.body.is_active !== undefined) {
        updateData.isActive = req.body.is_active;
      }

      const success = await userRepo.update(parseInt(id), updateData);
      
      if (!success) {
        return res.status(404).json(responseFormatter.error('المستخدم غير موجود', 404));
      }

      res.json(responseFormatter.success(null, 'تم تحديث المستخدم بنجاح'));
    } catch (err) {
      if (err.message.includes('already exists')) {
        return res.status(409).json(responseFormatter.error(err.message, 409));
      }
      handleError(res, err);
    }
  }

  // 🔹 حذف مستخدم (إلغاء تفعيل)
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const success = await userRepo.delete(parseInt(id));
      
      if (!success) {
        return res.status(404).json(responseFormatter.error('المستخدم غير موجود', 404));
      }

      res.json(responseFormatter.success(null, 'تم إلغاء تفعيل المستخدم بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 حذف مستخدم نهائياً
  async permanentDelete(req, res) {
    try {
      const { id } = req.params;
      
      const success = await userRepo.permanentDelete(parseInt(id));
      
      if (!success) {
        return res.status(404).json(responseFormatter.error('المستخدم غير موجود', 404));
      }

      res.json(responseFormatter.success(null, 'تم حذف المستخدم نهائياً'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 إحصائيات المستخدمين
  async getStats(req, res) {
    try {
      const stats = await userRepo.getUserStats();
      res.json(responseFormatter.success(stats, 'تم جلب إحصائيات المستخدمين بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 تغيير كلمة المرور
  async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        return res.status(400).json(
          responseFormatter.error('كلمة المرور الحالية والجديدة مطلوبتان', 400)
        );
      }

      // التحقق من كلمة المرور الحالية
      const user = await userRepo.findById(parseInt(id));
      if (!user) {
        return res.status(404).json(responseFormatter.error('المستخدم غير موجود', 404));
      }

      const isValidPassword = await userRepo.validatePassword(user.username, current_password);
      if (!isValidPassword) {
        return res.status(401).json(
          responseFormatter.error('كلمة المرور الحالية غير صحيحة', 401)
        );
      }

      // تحديث كلمة المرور
      const success = await userRepo.update(parseInt(id), { password: new_password });
      
      if (!success) {
        return res.status(500).json(
          responseFormatter.error('فشل في تحديث كلمة المرور', 500)
        );
      }

      res.json(responseFormatter.success(null, 'تم تغيير كلمة المرور بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }

  // 🔹 التحقق من صحة التوكن
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json(
          responseFormatter.error('التوكن مطلوب', 401)
        );
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'silo-monitoring-secret');
      const user = await userRepo.findById(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json(
          responseFormatter.error('التوكن غير صالح', 401)
        );
      }

      res.json(responseFormatter.success({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }, 'التوكن صالح'));
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json(
          responseFormatter.error('التوكن غير صالح أو منتهي الصلاحية', 401)
        );
      }
      handleError(res, err);
    }
  }

  // 🔹 تسجيل الخروج (إضافة التوكن إلى القائمة السوداء - اختياري)
  async logout(req, res) {
    try {
      // في التطبيق الحقيقي، يمكن إضافة التوكن إلى قائمة سوداء
      // هنا نكتفي بإرسال رسالة نجاح
      res.json(responseFormatter.success(null, 'تم تسجيل الخروج بنجاح'));
    } catch (err) {
      handleError(res, err);
    }
  }
}
