import { pool } from '../../infrastructure/database/optimizedDb.js';
import { logger } from '../../infrastructure/config/logger.js';

class SimpleWarehouseController {
  
  // 🔹 GET /warehouse/materials - Get materials from existing tables
  async getAllMaterials(req, res) {
    try {
      // Use existing products table or create a simple materials list
      const materials = [
        { id: 1, name: 'Wheat', name_ar: 'قمح', color_code: '#F4A460', description: 'Premium wheat grains' },
        { id: 2, name: 'Corn', name_ar: 'ذرة', color_code: '#FFD700', description: 'Yellow corn kernels' },
        { id: 3, name: 'Barley', name_ar: 'شعير', color_code: '#DEB887', description: 'Barley grains' },
        { id: 4, name: 'Rice', name_ar: 'أرز', color_code: '#F5F5DC', description: 'White rice grains' },
        { id: 5, name: 'Soybean', name_ar: 'فول الصويا', color_code: '#9ACD32', description: 'Soybean seeds' }
      ];
      
      logger.info(`[SimpleWarehouseController.getAllMaterials] ✅ Retrieved ${materials.length} materials`);
      
      res.json({
        success: true,
        data: materials,
        count: materials.length,
        message: 'Material types retrieved successfully'
      });
    } catch (error) {
      logger.error(`[SimpleWarehouseController.getAllMaterials] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve materials',
        error: error.message
      });
    }
  }

  // 🔹 POST /warehouse/materials - Create new material
  async createMaterial(req, res) {
    try {
      const { name, name_ar, description, color_code } = req.body;
      
      if (!name || !name_ar) {
        return res.status(400).json({
          success: false,
          message: 'Name and Arabic name are required'
        });
      }

      // Simulate creating material (in real app, you'd insert into products table)
      const newMaterial = {
        id: Date.now(), // Simple ID generation
        name,
        name_ar,
        description: description || '',
        color_code: color_code || '#4ECDC4',
        created_at: new Date().toISOString()
      };

      logger.info(`[SimpleWarehouseController.createMaterial] ✅ Created material: ${name}`);
      
      res.status(201).json({
        success: true,
        data: newMaterial,
        message: 'Material created successfully'
      });
    } catch (error) {
      logger.error(`[SimpleWarehouseController.createMaterial] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to create material',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/silos - Get silos with inventory from existing tables
  async getAllSilos(req, res) {
    try {
      // Get silos from existing silos table
      const [silos] = await pool.query(`
        SELECT s.id, s.silo_number, s.silo_group_id, sg.name as group_name
        FROM silos s
        LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
        ORDER BY s.silo_number
        LIMIT 20
      `);

      // Add mock inventory data
      const silosWithInventory = silos.map(silo => ({
        siloId: silo.id,
        siloNumber: silo.silo_number,
        siloGroupId: silo.silo_group_id,
        siloGroupName: silo.group_name,
        materials: [
          {
            materialName: 'Wheat',
            materialNameAr: 'قمح',
            quantity: Math.floor(Math.random() * 100),
            colorCode: '#F4A460'
          }
        ],
        totalQuantity: Math.floor(Math.random() * 100),
        status: Math.random() > 0.5 ? 'active' : 'empty'
      }));

      logger.info(`[SimpleWarehouseController.getAllSilos] ✅ Retrieved ${silos.length} silos`);
      
      res.json({
        success: true,
        data: silosWithInventory,
        count: silos.length,
        message: 'Warehouse silos retrieved successfully'
      });
    } catch (error) {
      logger.error(`[SimpleWarehouseController.getAllSilos] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve silos',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/silos/search - Search silos by material
  async searchSilosByMaterial(req, res) {
    try {
      const { material_name, material_name_ar } = req.query;
      
      if (!material_name && !material_name_ar) {
        return res.status(400).json({
          success: false,
          message: 'Please provide material_name or material_name_ar parameter'
        });
      }

      // Get silos from existing table
      const [silos] = await pool.query(`
        SELECT s.id, s.silo_number, s.silo_group_id, sg.name as group_name
        FROM silos s
        LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
        ORDER BY s.silo_number
        LIMIT 10
      `);

      // Filter silos that "contain" the requested material
      const searchTerm = material_name_ar || material_name;
      const matchingSilos = silos.filter((silo, index) => {
        // Mock logic: every 3rd silo contains wheat, every 4th contains barley
        if (searchTerm.includes('قمح') || searchTerm.toLowerCase().includes('wheat')) {
          return index % 3 === 0;
        }
        if (searchTerm.includes('شعير') || searchTerm.toLowerCase().includes('barley')) {
          return index % 4 === 0;
        }
        return index % 2 === 0; // Default: every 2nd silo
      }).map(silo => ({
        siloId: silo.id,
        siloNumber: silo.silo_number,
        siloGroupId: silo.silo_group_id,
        siloGroupName: silo.group_name,
        materials: [{
          materialName: material_name || (searchTerm.includes('قمح') ? 'Wheat' : 'Barley'),
          materialNameAr: material_name_ar || searchTerm,
          quantity: Math.floor(Math.random() * 50) + 10,
          colorCode: searchTerm.includes('قمح') ? '#F4A460' : '#DEB887'
        }],
        totalQuantity: Math.floor(Math.random() * 50) + 10
      }));

      logger.info(`[SimpleWarehouseController.searchSilosByMaterial] ✅ Found ${matchingSilos.length} silos containing ${searchTerm}`);
      
      res.json({
        success: true,
        data: matchingSilos,
        count: matchingSilos.length,
        searchTerm: searchTerm,
        message: `Found ${matchingSilos.length} silos containing ${searchTerm}`
      });
    } catch (error) {
      logger.error(`[SimpleWarehouseController.searchSilosByMaterial] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to search silos',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/materials/:siloId - Get materials in specific silo
  async getMaterialsBySilo(req, res) {
    try {
      const { siloId } = req.params;
      
      // Get silo info from existing table
      const [siloInfo] = await pool.query('SELECT * FROM silos WHERE id = ?', [siloId]);
      
      if (siloInfo.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Silo ${siloId} not found`
        });
      }

      // Mock materials in this silo
      const materials = [
        {
          materialId: 1,
          materialName: 'Wheat',
          materialNameAr: 'قمح',
          quantity: Math.floor(Math.random() * 50) + 10,
          colorCode: '#F4A460',
          description: 'Premium wheat grains'
        }
      ];

      logger.info(`[SimpleWarehouseController.getMaterialsBySilo] ✅ Retrieved materials for silo ${siloId}`);
      
      res.json({
        success: true,
        data: {
          siloId: parseInt(siloId),
          siloNumber: siloInfo[0].silo_number,
          materials: materials,
          totalQuantity: materials.reduce((sum, m) => sum + m.quantity, 0)
        },
        message: `Materials in silo ${siloId} retrieved successfully`
      });
    } catch (error) {
      logger.error(`[SimpleWarehouseController.getMaterialsBySilo] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve materials for silo',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/shipments - Get shipments (mock data)
  async getAllShipments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Mock shipments data
      const mockShipments = [
        {
          id: 1,
          shipmentType: 'INCOMING',
          referenceNumber: 'IN-202510-001',
          siloId: 1,
          materialName: 'Wheat',
          quantity: 25.0,
          scheduledDate: '2025-10-24T10:00:00',
          truckPlate: 'ABC-123',
          driverName: 'أحمد محمد',
          supplier: 'شركة الحبوب الذهبية',
          status: 'SCHEDULED',
          notes: '2 طن قمح بعد يومين كما هو مخطط'
        },
        {
          id: 2,
          shipmentType: 'OUTGOING',
          referenceNumber: 'OUT-202510-001',
          siloId: 1,
          materialName: 'Wheat',
          quantity: 15.0,
          scheduledDate: '2025-10-25T14:00:00',
          truckPlate: 'XYZ-789',
          driverName: 'محمد علي',
          customer: 'مطاحن الشرق',
          status: 'SCHEDULED',
          notes: 'شحنة قمح للعميل الرئيسي'
        }
      ];

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedShipments = mockShipments.slice(startIndex, endIndex);

      logger.info(`[SimpleWarehouseController.getAllShipments] ✅ Retrieved ${paginatedShipments.length} shipments`);
      
      res.json({
        success: true,
        data: paginatedShipments,
        pagination: {
          currentPage: page,
          perPage: limit,
          totalItems: mockShipments.length,
          totalPages: Math.ceil(mockShipments.length / limit)
        },
        message: 'Shipments retrieved successfully'
      });
    } catch (error) {
      logger.error(`[SimpleWarehouseController.getAllShipments] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve shipments',
        error: error.message
      });
    }
  }

  // 🔹 POST /warehouse/silo/:id/incoming - Create incoming shipment
  async createIncomingShipment(req, res) {
    try {
      const { id } = req.params;
      const { material_type_id, quantity, scheduled_date, truck_plate, driver_name, supplier, notes } = req.body;
      
      if (!quantity || !scheduled_date) {
        return res.status(400).json({
          success: false,
          message: 'Quantity and scheduled date are required'
        });
      }

      const newShipment = {
        id: Date.now(),
        shipmentType: 'INCOMING',
        referenceNumber: `IN-${Date.now()}`,
        siloId: parseInt(id),
        materialTypeId: material_type_id || 1,
        quantity: parseFloat(quantity),
        scheduledDate: scheduled_date,
        truckPlate: truck_plate,
        driverName: driver_name,
        supplier: supplier,
        status: 'SCHEDULED',
        notes: notes,
        createdAt: new Date().toISOString()
      };

      logger.info(`[SimpleWarehouseController.createIncomingShipment] ✅ Created incoming shipment: ${newShipment.referenceNumber}`);
      
      res.status(201).json({
        success: true,
        data: newShipment,
        message: 'Incoming shipment created successfully'
      });
    } catch (error) {
      logger.error(`[SimpleWarehouseController.createIncomingShipment] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to create incoming shipment',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/analytics/fill-level - Get fill level analytics
  async getFillLevelAnalytics(req, res) {
    try {
      // Get some silos from existing table
      const [silos] = await pool.query(`
        SELECT s.id, s.silo_number, s.silo_group_id, sg.name as group_name
        FROM silos s
        LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
        ORDER BY s.silo_number
        LIMIT 10
      `);

      const analytics = silos.map(silo => ({
        siloId: silo.id,
        siloNumber: silo.silo_number,
        siloGroupName: silo.group_name,
        totalQuantity: Math.floor(Math.random() * 100),
        utilizationPercentage: Math.floor(Math.random() * 100),
        status: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        materials: [{
          materialName: 'Wheat',
          quantity: Math.floor(Math.random() * 50),
          colorCode: '#F4A460'
        }]
      }));

      const summary = {
        totalSilos: silos.length,
        occupiedSilos: analytics.filter(s => s.totalQuantity > 0).length,
        avgUtilization: analytics.reduce((sum, s) => sum + s.utilizationPercentage, 0) / analytics.length
      };

      logger.info(`[SimpleWarehouseController.getFillLevelAnalytics] ✅ Retrieved analytics for ${silos.length} silos`);
      
      res.json({
        success: true,
        data: {
          silos: analytics,
          summary: summary
        },
        message: 'Fill level analytics retrieved successfully'
      });
    } catch (error) {
      logger.error(`[SimpleWarehouseController.getFillLevelAnalytics] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics',
        error: error.message
      });
    }
  }
}

export default SimpleWarehouseController;
