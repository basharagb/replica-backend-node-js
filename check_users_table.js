import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsersTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'silos',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Check users table structure
    console.log('\n🔍 Users table structure:');
    const [columns] = await connection.query('DESCRIBE users');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

checkUsersTable();
