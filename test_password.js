import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testPassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'silos',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Get ahmed's password hash
    const [users] = await connection.query('SELECT username, password_hash FROM users WHERE username = ?', ['ahmed']);
    
    if (users.length === 0) {
      console.log('❌ User ahmed not found');
      await connection.end();
      return;
    }

    const user = users[0];
    console.log('👤 User:', user.username);
    console.log('🔐 Password hash:', user.password_hash);

    // Test different passwords
    const testPasswords = ['ahmed', 'Ahmed', 'AHMED', 'admin', 'password', '123456'];
    
    console.log('\n🧪 Testing passwords:');
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await bcrypt.compare(testPassword, user.password_hash);
        console.log(`  - "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
      } catch (error) {
        console.log(`  - "${testPassword}": ❌ Error - ${error.message}`);
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPassword();
