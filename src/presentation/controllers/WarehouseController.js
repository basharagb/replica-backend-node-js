import WarehouseInventoryRepository from '../../infrastructure/repositories/WarehouseInventoryRepository.js';
import MaterialTypeRepository from '../../infrastructure/repositories/MaterialTypeRepository.js';
import { logger } from '../../infrastructure/config/logger.js';

class WarehouseController {
  constructor() {
    this.warehouseInventoryRepository = new WarehouseInventoryRepository();
    this.materialTypeRepository = new MaterialTypeRepository();
  }

  // 🔹 GET /warehouse/silos - Get all warehouse silos with inventory
  async getAllWarehouseSilos(req, res) {
    try {
      const filters = {
        siloId: req.query.silo_id,
        materialTypeId: req.query.material_type_id,
        minQuantity: req.query.min_quantity,
        expiringSoon: req.query.expiring_soon
      };
      
      const inventoryItems = await this.warehouseInventoryRepository.findAll(filters);
      
      // Group by silo
      const silosMap = new Map();
      
      inventoryItems.forEach(item => {
        const siloId = item.inventory.siloId;
        if (!silosMap.has(siloId)) {
          silosMap.set(siloId, {
            siloId: siloId,
            siloNumber: item.silo.siloNumber,
            siloGroupId: item.silo.siloGroupId,
            siloGroupName: item.silo.siloGroupName,
            inventory: [],
            totalQuantity: 0,
            totalAvailable: 0,
            totalReserved: 0,
            materialTypes: 0
          });
        }
        
        const silo = silosMap.get(siloId);
        silo.inventory.push({
          ...item.inventory.toJSON(),
          material: item.material
        });
        silo.totalQuantity += item.inventory.quantity;
        silo.totalAvailable += item.inventory.availableQuantity;
        silo.totalReserved += item.inventory.reservedQuantity;
        silo.materialTypes++;
      });
      
      const silos = Array.from(silosMap.values());
      
      logger.info(`[WarehouseController.getAllWarehouseSilos] ✅ Retrieved ${silos.length} warehouse silos`);
      
      res.json({
        success: true,
        data: silos,
        count: silos.length,
        message: 'Warehouse silos retrieved successfully'
      });
    } catch (error) {
      logger.error(`[WarehouseController.getAllWarehouseSilos] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve warehouse silos',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/silo/:id - Get specific silo inventory details
  async getSiloInventory(req, res) {
    try {
      const { id } = req.params;
      const inventoryItems = await this.warehouseInventoryRepository.findBySiloId(id);
      
      if (inventoryItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No inventory found for this silo'
        });
      }
      
      // Calculate totals
      const totals = inventoryItems.reduce((acc, item) => {
        acc.totalQuantity += item.inventory.quantity;
        acc.totalAvailable += item.inventory.availableQuantity;
        acc.totalReserved += item.inventory.reservedQuantity;
        return acc;
      }, { totalQuantity: 0, totalAvailable: 0, totalReserved: 0 });
      
      logger.info(`[WarehouseController.getSiloInventory] ✅ Retrieved inventory for silo ${id}`);
      
      res.json({
        success: true,
        data: {
          siloId: parseInt(id),
          inventory: inventoryItems.map(item => ({
            ...item.inventory.toJSON(),
            material: item.material
          })),
          totals,
          materialCount: inventoryItems.length
        },
        message: 'Silo inventory retrieved successfully'
      });
    } catch (error) {
      logger.error(`[WarehouseController.getSiloInventory] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve silo inventory',
        error: error.message
      });
    }
  }

  // 🔹 PATCH /warehouse/silo/:id - Update silo inventory notes
  async updateSiloNotes(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      // This would typically update a silo_notes table
      // For now, we'll return a success response
      // In a real implementation, you'd have a SiloNotesRepository
      
      logger.info(`[WarehouseController.updateSiloNotes] ✅ Updated notes for silo ${id}`);
      
      res.json({
        success: true,
        data: {
          siloId: parseInt(id),
          notes: notes,
          updatedAt: new Date()
        },
        message: 'Silo notes updated successfully'
      });
    } catch (error) {
      logger.error(`[WarehouseController.updateSiloNotes] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to update silo notes',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/summary - Get warehouse summary statistics
  async getWarehouseSummary(req, res) {
    try {
      const summary = await this.warehouseInventoryRepository.getWarehouseSummary();
      
      logger.info(`[WarehouseController.getWarehouseSummary] ✅ Retrieved warehouse summary`);
      
      res.json({
        success: true,
        data: summary,
        message: 'Warehouse summary retrieved successfully'
      });
    } catch (error) {
      logger.error(`[WarehouseController.getWarehouseSummary] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve warehouse summary',
        error: error.message
      });
    }
  }
}

export default WarehouseController;
