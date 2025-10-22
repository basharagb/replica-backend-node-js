import { pool } from './src/infrastructure/database/optimizedDb.js';

async function createTables() {
  try {
    console.log('🗄️ Creating Phase Two tables...');
    
    // Create material_types table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS material_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        name_ar VARCHAR(100) NOT NULL,
        description TEXT,
        icon_path VARCHAR(255),
        color_code VARCHAR(7) DEFAULT '#4ECDC4',
        density DECIMAL(8,3) DEFAULT 1.000,
        unit VARCHAR(20) DEFAULT 'tons',
        notes TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_active (is_active)
      )
    `);
    console.log('✅ material_types table created');

    // Create warehouse_inventory table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS warehouse_inventory (
        id INT PRIMARY KEY AUTO_INCREMENT,
        silo_id INT NOT NULL,
        material_type_id INT NOT NULL,
        quantity DECIMAL(10,3) NOT NULL DEFAULT 0.000,
        reserved_quantity DECIMAL(10,3) DEFAULT 0.000,
        available_quantity DECIMAL(10,3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
        entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expiry_date DATE NULL,
        batch_number VARCHAR(50),
        supplier VARCHAR(100),
        quality_grade VARCHAR(20) DEFAULT 'A',
        purchase_price DECIMAL(10,2),
        notes TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (silo_id) REFERENCES silos(id) ON DELETE CASCADE,
        FOREIGN KEY (material_type_id) REFERENCES material_types(id) ON DELETE RESTRICT,
        INDEX idx_silo_material (silo_id, material_type_id),
        INDEX idx_batch (batch_number),
        INDEX idx_expiry (expiry_date)
      )
    `);
    console.log('✅ warehouse_inventory table created');

    // Create shipments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        shipment_type ENUM('INCOMING', 'OUTGOING') NOT NULL,
        reference_number VARCHAR(50) UNIQUE NOT NULL,
        silo_id INT NOT NULL,
        material_type_id INT NOT NULL,
        quantity DECIMAL(10,3) NOT NULL,
        scheduled_date DATETIME NOT NULL,
        actual_date DATETIME NULL,
        truck_plate VARCHAR(20),
        driver_name VARCHAR(100),
        driver_phone VARCHAR(20),
        supplier_customer VARCHAR(100),
        status ENUM('SCHEDULED', 'IN_TRANSIT', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
        confirmation_code VARCHAR(10),
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (silo_id) REFERENCES silos(id) ON DELETE CASCADE,
        FOREIGN KEY (material_type_id) REFERENCES material_types(id) ON DELETE RESTRICT,
        INDEX idx_reference (reference_number),
        INDEX idx_scheduled_date (scheduled_date),
        INDEX idx_status (status),
        INDEX idx_type_status (shipment_type, status)
      )
    `);
    console.log('✅ shipments table created');

    // Insert sample material types
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM material_types');
    if (countResult[0].count === 0) {
      await pool.query(`
        INSERT INTO material_types (name, name_ar, description, color_code, density, icon_path) VALUES
        ('Wheat', 'قمح', 'Premium wheat grains', '#F4A460', 0.780, '/icons/wheat.svg'),
        ('Corn', 'ذرة', 'Yellow corn kernels', '#FFD700', 0.720, '/icons/corn.svg'),
        ('Barley', 'شعير', 'Barley grains', '#DEB887', 0.650, '/icons/barley.svg'),
        ('Rice', 'أرز', 'White rice grains', '#F5F5DC', 0.750, '/icons/rice.svg'),
        ('Soybean', 'فول الصويا', 'Soybean seeds', '#9ACD32', 0.750, '/icons/soybean.svg'),
        ('Oats', 'شوفان', 'Oat grains', '#D2B48C', 0.410, '/icons/oats.svg')
      `);
      console.log('✅ Sample material types inserted');
    }

    // Insert sample inventory data
    const [inventoryCount] = await pool.query('SELECT COUNT(*) as count FROM warehouse_inventory');
    if (inventoryCount[0].count === 0) {
      await pool.query(`
        INSERT INTO warehouse_inventory (silo_id, material_type_id, quantity, entry_date, supplier, quality_grade, notes) VALUES
        (1, 1, 45.5, '2025-10-15', 'شركة الحبوب الذهبية', 'A+', 'قمح عالي الجودة'),
        (2, 2, 32.0, '2025-10-16', 'مزارع الذرة المتحدة', 'A', 'ذرة صفراء ممتازة'),
        (3, 3, 28.7, '2025-10-17', 'تجار الشعير', 'A', 'شعير للعلف'),
        (1, 4, 15.2, '2025-10-18', 'مستوردو الأرز', 'A+', 'أرز أبيض فاخر'),
        (4, 5, 22.8, '2025-10-19', 'شركة فول الصويا', 'A', 'فول صويا للزيت')
      `);
      console.log('✅ Sample inventory data inserted');
    }

    // Insert sample shipments
    const [shipmentsCount] = await pool.query('SELECT COUNT(*) as count FROM shipments');
    if (shipmentsCount[0].count === 0) {
      await pool.query(`
        INSERT INTO shipments (shipment_type, reference_number, silo_id, material_type_id, quantity, scheduled_date, truck_plate, driver_name, supplier_customer, status, notes) VALUES
        ('INCOMING', 'IN-202510-001', 1, 1, 25.0, '2025-10-24 10:00:00', 'ABC-123', 'أحمد محمد', 'شركة الحبوب الذهبية', 'SCHEDULED', '2 طن قمح بعد يومين كما هو مخطط'),
        ('OUTGOING', 'OUT-202510-001', 1, 1, 15.0, '2025-10-25 14:00:00', 'XYZ-789', 'محمد علي', 'مطاحن الشرق', 'SCHEDULED', 'شحنة قمح للعميل الرئيسي'),
        ('INCOMING', 'IN-202510-002', 2, 2, 30.0, '2025-10-26 09:00:00', 'DEF-456', 'علي أحمد', 'مزارع الذرة', 'SCHEDULED', 'شحنة ذرة جديدة'),
        ('COMPLETED', 'IN-202510-003', 3, 3, 20.0, '2025-10-20 11:00:00', 'GHI-789', 'سالم محمود', 'تجار الشعير', 'COMPLETED', 'شحنة شعير مكتملة')
      `);
      console.log('✅ Sample shipments inserted');
    }

    console.log('🎉 All Phase Two tables created successfully!');
    console.log('📊 Database is ready for testing');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await pool.end();
  }
}

createTables();
