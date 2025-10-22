import { pool } from './src/infrastructure/database/optimizedDb.js';

async function insertSampleData() {
  try {
    console.log('📊 Inserting sample data...');
    
    // Insert sample materials if not exists
    const [materialCount] = await pool.query('SELECT COUNT(*) as count FROM material_types');
    if (materialCount[0].count === 0) {
      await pool.query(`
        INSERT INTO material_types (name, name_ar, description, color_code, density, icon_path) VALUES
        ('Wheat', 'قمح', 'Premium wheat grains', '#F4A460', 0.780, '/icons/wheat.svg'),
        ('Corn', 'ذرة', 'Yellow corn kernels', '#FFD700', 0.720, '/icons/corn.svg'),
        ('Barley', 'شعير', 'Barley grains', '#DEB887', 0.650, '/icons/barley.svg'),
        ('Rice', 'أرز', 'White rice grains', '#F5F5DC', 0.750, '/icons/rice.svg'),
        ('Soybean', 'فول الصويا', 'Soybean seeds', '#9ACD32', 0.750, '/icons/soybean.svg')
      `);
      console.log('✅ Sample materials inserted');
    }

    // Insert sample inventory if not exists
    const [inventoryCount] = await pool.query('SELECT COUNT(*) as count FROM warehouse_inventory');
    if (inventoryCount[0].count === 0) {
      await pool.query(`
        INSERT INTO warehouse_inventory (silo_id, material_type_id, quantity, entry_date, supplier, quality_grade, notes) VALUES
        (1, 1, 45.5, '2025-10-15', 'شركة الحبوب الذهبية', 'A+', 'قمح عالي الجودة'),
        (2, 2, 32.0, '2025-10-16', 'مزارع الذرة المتحدة', 'A', 'ذرة صفراء ممتازة'),
        (3, 3, 28.7, '2025-10-17', 'تجار الشعير', 'A', 'شعير للعلف'),
        (4, 4, 15.2, '2025-10-18', 'مستوردو الأرز', 'A+', 'أرز أبيض فاخر'),
        (5, 5, 22.8, '2025-10-19', 'شركة فول الصويا', 'A', 'فول صويا للزيت')
      `);
      console.log('✅ Sample inventory inserted');
    }

    // Insert sample shipments if not exists
    const [shipmentsCount] = await pool.query('SELECT COUNT(*) as count FROM shipments');
    if (shipmentsCount[0].count === 0) {
      await pool.query(`
        INSERT INTO shipments (shipment_type, reference_number, silo_id, material_type_id, quantity, scheduled_date, truck_plate, driver_name, supplier_customer, status, notes) VALUES
        ('INCOMING', 'IN-202510-001', 1, 1, 25.0, '2025-10-24 10:00:00', 'ABC-123', 'أحمد محمد', 'شركة الحبوب الذهبية', 'SCHEDULED', '2 طن قمح بعد يومين كما هو مخطط'),
        ('OUTGOING', 'OUT-202510-001', 1, 1, 15.0, '2025-10-25 14:00:00', 'XYZ-789', 'محمد علي', 'مطاحن الشرق', 'SCHEDULED', 'شحنة قمح للعميل الرئيسي'),
        ('INCOMING', 'IN-202510-002', 2, 2, 30.0, '2025-10-26 09:00:00', 'DEF-456', 'علي أحمد', 'مزارع الذرة', 'SCHEDULED', 'شحنة ذرة جديدة'),
        ('COMPLETED', 'IN-202510-003', 3, 3, 20.0, '2025-10-20 11:00:00', 'GHI-789', 'سالم محمود', 'تجار الشعير', 'COMPLETED', 'شحنة شعير مكتملة'),
        ('INCOMING', 'IN-202510-004', 4, 4, 18.5, '2025-10-27 15:30:00', 'JKL-012', 'محمود سالم', 'مستوردو الأرز', 'SCHEDULED', 'شحنة أرز فاخر'),
        ('OUTGOING', 'OUT-202510-002', 2, 2, 12.0, '2025-10-28 08:00:00', 'MNO-345', 'خالد أحمد', 'مصنع العلف', 'SCHEDULED', 'شحنة ذرة للعلف')
      `);
      console.log('✅ Sample shipments inserted');
    }

    // Get counts
    const [finalMaterialCount] = await pool.query('SELECT COUNT(*) as count FROM material_types');
    const [finalInventoryCount] = await pool.query('SELECT COUNT(*) as count FROM warehouse_inventory');
    const [finalShipmentsCount] = await pool.query('SELECT COUNT(*) as count FROM shipments');

    console.log('🎉 Sample data insertion completed!');
    console.log(`📦 Materials: ${finalMaterialCount[0].count}`);
    console.log(`🏭 Inventory items: ${finalInventoryCount[0].count}`);
    console.log(`🚛 Shipments: ${finalShipmentsCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
  } finally {
    await pool.end();
  }
}

insertSampleData();
