// ==============================
// 🧩 Imports
// ==============================
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// ==============================
// 🏗️ إنشاء Pool Connection
// ==============================
export const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,       // عدد الاتصالات القصوى
  queueLimit: 0,             // لا حدود للطوابير
  connectTimeout: 10000,     // مهلة الاتصال 10 ثواني
  timezone: '+00:00',        // UTC time
  decimalNumbers: true,      // للحفاظ على دقة القيم العشرية
});

// ==============================
// 🧠 اختبار الاتصال عند التشغيل
// ==============================
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 AS test');
    logger.success(`✅ Database connected successfully (MySQL host: ${env.DB_HOST})`);
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
})();

// ==============================
// 🧹 إغلاق الاتصال عند الإيقاف
// ==============================
process.on('SIGINT', async () => {
  try {
    await pool.end();
    logger.info('🧹 MySQL pool closed.');
    process.exit(0);
  } catch (err) {
    logger.error('Error closing MySQL pool:', err);
    process.exit(1);
  }
});