import { pool } from '../../infrastructure/database/optimizedDb.js';
import { logger } from '../../infrastructure/config/logger.js';

class TestController {
  // 🔹 GET /test/warehouse - Simple test endpoint
  async testWarehouse(req, res) {
    try {
      // Test database connection
      const [rows] = await pool.query('SELECT 1 as test');
      
      // Test if material_types table exists
      let materialTypesExists = false;
      try {
        await pool.query('SELECT COUNT(*) FROM material_types');
        materialTypesExists = true;
      } catch (err) {
        materialTypesExists = false;
      }
      
      logger.info(`[TestController.testWarehouse] ✅ Test successful`);
      
      res.json({
        success: true,
        data: {
          database_connection: true,
          material_types_table_exists: materialTypesExists,
          test_query_result: rows[0],
          timestamp: new Date().toISOString()
        },
        message: 'Warehouse test endpoint working'
      });
    } catch (error) {
      logger.error(`[TestController.testWarehouse] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Test failed',
        error: error.message
      });
    }
  }

  // 🔹 GET /test/shipments - Test shipments endpoint
  async testShipments(req, res) {
    try {
      // Test if shipments table exists
      let shipmentsExists = false;
      try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM shipments');
        shipmentsExists = true;
        
        logger.info(`[TestController.testShipments] ✅ Shipments table exists with ${rows[0].count} records`);
        
        res.json({
          success: true,
          data: {
            shipments_table_exists: shipmentsExists,
            shipments_count: rows[0].count,
            timestamp: new Date().toISOString()
          },
          message: 'Shipments test successful'
        });
      } catch (err) {
        logger.error(`[TestController.testShipments] ❌ ${err.message}`);
        res.status(500).json({
          success: false,
          message: 'Shipments table does not exist',
          error: err.message
        });
      }
    } catch (error) {
      logger.error(`[TestController.testShipments] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Shipments test failed',
        error: error.message
      });
    }
  }

  // 🔹 GET /test/materials - Test materials endpoint
  async testMaterials(req, res) {
    try {
      // Create material_types table if it doesn't exist
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      // Insert sample data if table is empty
      const [countResult] = await pool.query('SELECT COUNT(*) as count FROM material_types');
      if (countResult[0].count === 0) {
        await pool.query(`
          INSERT INTO material_types (name, name_ar, description, color_code, density, icon_path) VALUES
          ('Wheat', 'قمح', 'Premium wheat grains', '#F4A460', 0.780, '/icons/wheat.svg'),
          ('Corn', 'ذرة', 'Yellow corn kernels', '#FFD700', 0.720, '/icons/corn.svg'),
          ('Barley', 'شعير', 'Barley grains', '#DEB887', 0.650, '/icons/barley.svg'),
          ('Rice', 'أرز', 'White rice grains', '#F5F5DC', 0.750, '/icons/rice.svg'),
          ('Soybean', 'فول الصويا', 'Soybean seeds', '#9ACD32', 0.750, '/icons/soybean.svg')
        `);
      }
      
      // Get all materials
      const [materials] = await pool.query('SELECT * FROM material_types ORDER BY name');
      
      logger.info(`[TestController.testMaterials] ✅ Retrieved ${materials.length} materials`);
      
      res.json({
        success: true,
        data: materials,
        count: materials.length,
        message: 'Materials test successful'
      });
    } catch (error) {
      logger.error(`[TestController.testMaterials] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Materials test failed',
        error: error.message
      });
    }
  }
}

export default TestController;
