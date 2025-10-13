import dotenv from 'dotenv';

// ✅ تحميل متغيرات البيئة من .env
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || '0.0.0.0',

  // 🗄️ إعدادات قاعدة البيانات
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'silos_dump',
  DB_PORT: process.env.DB_PORT || 3306,
};