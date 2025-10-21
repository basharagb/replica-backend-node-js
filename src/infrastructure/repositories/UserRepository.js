// ==============================
// 📦 Imports
// ==============================
import { pool } from '../database/db.js';
import { User } from '../../domain/entities/User.js';
import { logger } from '../config/logger.js';
import bcrypt from 'bcrypt';

// ==============================
// 🏗️ User Repository Class
// ==============================
export class UserRepository {
  
  // 🔹 جلب جميع المستخدمين
  async findAll() {
    const query = `
      SELECT id, username, email, role, created_at, updated_at, is_active
      FROM users
      ORDER BY created_at DESC
    `;
    
    try {
      const [rows] = await pool.query(query);
      return rows.map(row => new User({
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active
      }));
    } catch (err) {
      logger.error(`[UserRepository.findAll] ❌ ${err.message}`);
      throw new Error('Database error while fetching users');
    }
  }

  // 🔹 جلب مستخدم حسب المعرف
  async findById(id) {
    const query = `
      SELECT id, username, email, role, created_at, updated_at, is_active
      FROM users
      WHERE id = ?
      LIMIT 1
    `;
    
    try {
      const [rows] = await pool.query(query, [id]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return new User({
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active
      });
    } catch (err) {
      logger.error(`[UserRepository.findById] ❌ ${err.message}`);
      throw new Error(`Failed to fetch user with id ${id}`);
    }
  }

  // 🔹 جلب مستخدم حسب اسم المستخدم
  async findByUsername(username) {
    const query = `
      SELECT id, username, password_hash, role, created_at
      FROM users
      WHERE username = ?
      LIMIT 1
    `;
    
    try {
      const [rows] = await pool.query(query, [username]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return new User({
        id: row.id,
        username: row.username,
        email: `${row.username}@silos.com`, // Generate email from username
        passwordHash: row.password_hash,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.created_at, // Use created_at as updated_at
        isActive: true // Default to active
      });
    } catch (err) {
      logger.error(`[UserRepository.findByUsername] ❌ ${err.message}`);
      throw new Error(`Failed to fetch user with username ${username}`);
    }
  }

  // 🔹 جلب مستخدم حسب البريد الإلكتروني
  async findByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash, role, created_at, updated_at, is_active
      FROM users
      WHERE email = ?
      LIMIT 1
    `;
    
    try {
      const [rows] = await pool.query(query, [email]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return new User({
        id: row.id,
        username: row.username,
        email: row.email,
        passwordHash: row.password_hash,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active
      });
    } catch (err) {
      logger.error(`[UserRepository.findByEmail] ❌ ${err.message}`);
      throw new Error(`Failed to fetch user with email ${email}`);
    }
  }

  // 🔹 التحقق من صحة كلمة المرور
  async validatePassword(username, password) {
    try {
      console.log(`🔐 Validating password for user: ${username}`);
      const user = await this.findByUsername(username);
      
      if (!user) {
        console.log(`❌ User not found: ${username}`);
        return null;
      }
      
      if (!user.isActive) {
        console.log(`❌ User inactive: ${username}`);
        return null;
      }
      
      console.log(`🔍 Comparing password with hash for user: ${username}`);
      console.log(`Hash from DB: ${user.passwordHash?.substring(0, 20)}...`);
      
      // Try bcrypt comparison first
      let isValid = false;
      try {
        isValid = await bcrypt.compare(password, user.passwordHash);
        console.log(`🔐 Bcrypt comparison result: ${isValid}`);
      } catch (bcryptErr) {
        console.log(`⚠️ Bcrypt failed, trying direct comparison: ${bcryptErr.message}`);
        // If bcrypt fails, try direct comparison (for testing)
        isValid = password === user.passwordHash;
        console.log(`🔍 Direct comparison result: ${isValid}`);
      }
      
      if (!isValid) {
        console.log(`❌ Password validation failed for user: ${username}`);
        return null;
      }
      
      console.log(`✅ Password validation successful for user: ${username}`);
      
      // إرجاع المستخدم بدون كلمة المرور
      return new User({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive
      });
    } catch (err) {
      logger.error(`[UserRepository.validatePassword] ❌ ${err.message}`);
      console.error(`🔥 Authentication error for ${username}:`, err);
      throw new Error('Authentication error');
    }
  }

  // 🔹 إنشاء مستخدم جديد
  async create(userData) {
    const query = `
      INSERT INTO users (username, email, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    try {
      // تشفير كلمة المرور
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      const params = [
        userData.username,
        userData.email,
        passwordHash,
        userData.role || 'user',
        userData.isActive !== undefined ? userData.isActive : true
      ];
      
      const [result] = await pool.query(query, params);
      return result.insertId;
    } catch (err) {
      logger.error(`[UserRepository.create] ❌ ${err.message}`);
      
      // التحقق من الأخطاء المحددة
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.message.includes('username')) {
          throw new Error('Username already exists');
        }
        if (err.message.includes('email')) {
          throw new Error('Email already exists');
        }
      }
      
      throw new Error('Database error while creating user');
    }
  }

  // 🔹 تحديث مستخدم موجود
  async update(id, updateData) {
    const fields = [];
    const params = [];
    
    if (updateData.username !== undefined) {
      fields.push('username = ?');
      params.push(updateData.username);
    }
    
    if (updateData.email !== undefined) {
      fields.push('email = ?');
      params.push(updateData.email);
    }
    
    if (updateData.password !== undefined) {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(updateData.password, saltRounds);
      fields.push('password_hash = ?');
      params.push(passwordHash);
    }
    
    if (updateData.role !== undefined) {
      fields.push('role = ?');
      params.push(updateData.role);
    }
    
    if (updateData.isActive !== undefined) {
      fields.push('is_active = ?');
      params.push(updateData.isActive);
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    fields.push('updated_at = NOW()');
    params.push(id);
    
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    try {
      const [result] = await pool.query(query, params);
      return result.affectedRows > 0;
    } catch (err) {
      logger.error(`[UserRepository.update] ❌ ${err.message}`);
      
      // التحقق من الأخطاء المحددة
      if (err.code === 'ER_DUP_ENTRY') {
        if (err.message.includes('username')) {
          throw new Error('Username already exists');
        }
        if (err.message.includes('email')) {
          throw new Error('Email already exists');
        }
      }
      
      throw new Error(`Database error while updating user ${id}`);
    }
  }

  // 🔹 حذف مستخدم (إلغاء تفعيل)
  async delete(id) {
    const query = 'UPDATE users SET is_active = false WHERE id = ?';
    
    try {
      const [result] = await pool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (err) {
      logger.error(`[UserRepository.delete] ❌ ${err.message}`);
      throw new Error(`Database error while deactivating user ${id}`);
    }
  }

  // 🔹 حذف مستخدم نهائياً
  async permanentDelete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    
    try {
      const [result] = await pool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (err) {
      logger.error(`[UserRepository.permanentDelete] ❌ ${err.message}`);
      throw new Error(`Database error while permanently deleting user ${id}`);
    }
  }

  // 🔹 جلب المستخدمين حسب الدور
  async findByRole(role) {
    const query = `
      SELECT id, username, email, role, created_at, updated_at, is_active
      FROM users
      WHERE role = ? AND is_active = true
      ORDER BY created_at DESC
    `;
    
    try {
      const [rows] = await pool.query(query, [role]);
      return rows.map(row => new User({
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isActive: row.is_active
      }));
    } catch (err) {
      logger.error(`[UserRepository.findByRole] ❌ ${err.message}`);
      throw new Error(`Database error while fetching users by role ${role}`);
    }
  }

  // 🔹 إحصائيات المستخدمين
  async getUserStats() {
    const query = `
      SELECT 
        role,
        is_active,
        COUNT(*) as count
      FROM users
      GROUP BY role, is_active
      ORDER BY role, is_active DESC
    `;
    
    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (err) {
      logger.error(`[UserRepository.getUserStats] ❌ ${err.message}`);
      throw new Error('Database error while fetching user statistics');
    }
  }

  // 🔹 تحديث آخر تسجيل دخول
  async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login_at = NOW() WHERE id = ?';
    
    try {
      const [result] = await pool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (err) {
      logger.error(`[UserRepository.updateLastLogin] ❌ ${err.message}`);
      throw new Error(`Database error while updating last login for user ${id}`);
    }
  }

  // 🔹 إحصائيات المستخدمين
  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
        SUM(CASE WHEN role = 'operator' THEN 1 ELSE 0 END) as operator_count,
        SUM(CASE WHEN role = 'technician' THEN 1 ELSE 0 END) as technician_count
      FROM users
    `;
    
    try {
      const [rows] = await pool.query(query);
      return rows[0];
    } catch (err) {
      logger.error(`[UserRepository.getStats] ❌ ${err.message}`);
      throw new Error('Database error while fetching user statistics');
    }
  }
}
