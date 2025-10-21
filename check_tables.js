import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'silos',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Check if both tables exist
    const [tables] = await connection.query("SHOW TABLES LIKE 'readings%'");
    
    console.log('\n📋 Reading tables found:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Check structure of both tables if they exist
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n🔍 ${tableName} table structure:`);
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
      
      // Check row count
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  📊 Row count: ${count[0].count}`);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkTables();
