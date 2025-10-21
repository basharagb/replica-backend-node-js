import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabaseSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'silos',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check readings_raw table structure
    if (tables.some(table => Object.values(table)[0] === 'readings_raw')) {
      console.log('\n🔍 readings_raw table structure:');
      const [columns] = await connection.query('DESCRIBE readings_raw');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      // Check sample data
      console.log('\n📊 Sample data from readings_raw (first 3 rows):');
      const [sampleData] = await connection.query('SELECT * FROM readings_raw LIMIT 3');
      console.log(sampleData);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

checkDatabaseSchema();
