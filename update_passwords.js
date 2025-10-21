import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updatePasswords() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'silos',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Update passwords for existing users
    const users = [
      { username: 'ahmed', password: 'ahmed' },
      { username: 'hussein', password: 'hussein' },
      { username: 'bashar', password: 'bashar' }
    ];

    console.log('\n🔐 Updating passwords to bcrypt format:');
    
    for (const user of users) {
      try {
        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash(user.password, 10);
        
        // Update user password
        const [result] = await connection.query(
          'UPDATE users SET password_hash = ? WHERE username = ?',
          [passwordHash, user.username]
        );
        
        if (result.affectedRows > 0) {
          console.log(`✅ Updated password for ${user.username}`);
        } else {
          console.log(`⚠️  User ${user.username} not found`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${user.username}:`, error.message);
      }
    }

    // Verify the updates
    console.log('\n🧪 Verifying password updates:');
    for (const user of users) {
      try {
        const [rows] = await connection.query('SELECT password_hash FROM users WHERE username = ?', [user.username]);
        if (rows.length > 0) {
          const isMatch = await bcrypt.compare(user.password, rows[0].password_hash);
          console.log(`  - ${user.username}: ${isMatch ? '✅ Password verified' : '❌ Password mismatch'}`);
        }
      } catch (error) {
        console.error(`❌ Error verifying ${user.username}:`, error.message);
      }
    }

    await connection.end();
    console.log('\n✅ Password update complete!');

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

updatePasswords();
