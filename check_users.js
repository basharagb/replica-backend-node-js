import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'silos',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Check if users table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('❌ Users table does not exist');
      await connection.end();
      return;
    }

    // Check users table structure
    console.log('\n🔍 Users table structure:');
    const [columns] = await connection.query('DESCRIBE users');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check existing users
    console.log('\n👥 Existing users:');
    const [users] = await connection.query('SELECT id, username, email, role, is_active FROM users LIMIT 10');
    if (users.length === 0) {
      console.log('  No users found in database');
    } else {
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
      });
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

checkUsers();
