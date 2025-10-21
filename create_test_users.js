import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUsers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'silos',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Check if users table exists, if not create it
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      console.log('📝 Creating users table...');
      await connection.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'technician', 'operator') DEFAULT 'operator',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          last_login_at TIMESTAMP NULL
        )
      `);
      console.log('✅ Users table created');
    }

    // Create test users
    const testUsers = [
      { username: 'ahmed', password: 'ahmed', email: 'ahmed@silos.com', role: 'admin' },
      { username: 'hussein', password: 'hussein', email: 'hussein@silos.com', role: 'technician' },
      { username: 'bashar', password: 'bashar', email: 'bashar@silos.com', role: 'operator' },
      { username: 'admin', password: 'admin', email: 'admin@silos.com', role: 'admin' },
      { username: 'test', password: 'test', email: 'test@silos.com', role: 'operator' }
    ];

    console.log('\n👥 Creating test users...');
    
    for (const user of testUsers) {
      try {
        // Hash password
        const passwordHash = await bcrypt.hash(user.password, 10);
        
        // Insert user
        await connection.query(
          'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [user.username, user.email, passwordHash, user.role]
        );
        
        console.log(`✅ Created user: ${user.username} (${user.role})`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  User ${user.username} already exists`);
        } else {
          console.error(`❌ Error creating user ${user.username}:`, error.message);
        }
      }
    }

    // Show final user list
    console.log('\n📋 Final user list:');
    const [users] = await connection.query('SELECT id, username, email, role, is_active FROM users');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.role}) - ${user.email}`);
    });

    await connection.end();
    console.log('\n✅ Test users setup complete!');
    console.log('\n🔐 You can now login with:');
    console.log('  - ahmed/ahmed (Admin)');
    console.log('  - hussein/hussein (Technician)');
    console.log('  - bashar/bashar (Operator)');
    console.log('  - admin/admin (Admin)');
    console.log('  - test/test (Operator)');

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

createTestUsers();
