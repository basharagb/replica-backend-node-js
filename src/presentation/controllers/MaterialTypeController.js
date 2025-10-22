import MaterialTypeRepository from '../../infrastructure/repositories/MaterialTypeRepository.js';
import WarehouseInventoryRepository from '../../infrastructure/repositories/WarehouseInventoryRepository.js';
import { logger } from '../../infrastructure/config/logger.js';

class MaterialTypeController {
  constructor() {
    this.materialTypeRepository = new MaterialTypeRepository();
    this.warehouseInventoryRepository = new WarehouseInventoryRepository();
  }

  // 🔹 GET /warehouse/materials - Get all material types
  async getAllMaterials(req, res) {
    try {
      const includeInactive = req.query.include_inactive === 'true';
      const withInventory = req.query.with_inventory === 'true';
      
      let materials;
      if (withInventory) {
        materials = await this.materialTypeRepository.findAllWithInventoryCount();
      } else {
        materials = await this.materialTypeRepository.findAll(includeInactive);
      }
      
      logger.info(`[MaterialTypeController.getAllMaterials] ✅ Retrieved ${materials.length} material types`);
      
      res.json({
        success: true,
        data: materials,
        count: materials.length,
        message: 'Material types retrieved successfully'
      });
    } catch (error) {
      logger.error(`[MaterialTypeController.getAllMaterials] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve material types',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/materials/:id - Get material type by ID
  async getMaterialById(req, res) {
    try {
      const { id } = req.params;
      const material = await this.materialTypeRepository.findById(id);
      
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Material type not found'
        });
      }
      
      logger.info(`[MaterialTypeController.getMaterialById] ✅ Retrieved material type ${id}`);
      
      res.json({
        success: true,
        data: material,
        message: 'Material type retrieved successfully'
      });
    } catch (error) {
      logger.error(`[MaterialTypeController.getMaterialById] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve material type',
        error: error.message
      });
    }
  }

  // 🔹 POST /warehouse/materials - Create new material type
  async createMaterial(req, res) {
    try {
      const materialData = {
        name: req.body.name,
        nameAr: req.body.name_ar,
        description: req.body.description,
        iconPath: req.body.icon_path,
        colorCode: req.body.color_code,
        density: req.body.density,
        unit: req.body.unit,
        notes: req.body.notes,
        isActive: req.body.is_active
      };
      
      // Validation
      if (!materialData.name || !materialData.nameAr) {
        return res.status(400).json({
          success: false,
          message: 'Material name (English and Arabic) is required'
        });
      }
      
      const material = await this.materialTypeRepository.create(materialData);
      
      logger.info(`[MaterialTypeController.createMaterial] ✅ Created material type: ${material.name}`);
      
      res.status(201).json({
        success: true,
        data: material,
        message: 'Material type created successfully'
      });
    } catch (error) {
      logger.error(`[MaterialTypeController.createMaterial] ❌ ${error.message}`);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create material type',
        error: error.message
      });
    }
  }

  // 🔹 PATCH /warehouse/materials/:id - Update material type
  async updateMaterial(req, res) {
    try {
      const { id } = req.params;
      
      // Check if material exists
      const existingMaterial = await this.materialTypeRepository.findById(id);
      if (!existingMaterial) {
        return res.status(404).json({
          success: false,
          message: 'Material type not found'
        });
      }
      
      const materialData = {
        name: req.body.name || existingMaterial.name,
        nameAr: req.body.name_ar || existingMaterial.nameAr,
        description: req.body.description !== undefined ? req.body.description : existingMaterial.description,
        iconPath: req.body.icon_path !== undefined ? req.body.icon_path : existingMaterial.iconPath,
        colorCode: req.body.color_code || existingMaterial.colorCode,
        density: req.body.density !== undefined ? req.body.density : existingMaterial.density,
        unit: req.body.unit || existingMaterial.unit,
        notes: req.body.notes !== undefined ? req.body.notes : existingMaterial.notes,
        isActive: req.body.is_active !== undefined ? req.body.is_active : existingMaterial.isActive
      };
      
      const material = await this.materialTypeRepository.update(id, materialData);
      
      logger.info(`[MaterialTypeController.updateMaterial] ✅ Updated material type ${id}`);
      
      res.json({
        success: true,
        data: material,
        message: 'Material type updated successfully'
      });
    } catch (error) {
      logger.error(`[MaterialTypeController.updateMaterial] ❌ ${error.message}`);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update material type',
        error: error.message
      });
    }
  }

  // 🔹 DELETE /warehouse/materials/:id - Delete material type (soft delete)
  async deleteMaterial(req, res) {
    try {
      const { id } = req.params;
      
      // Check if material exists
      const existingMaterial = await this.materialTypeRepository.findById(id);
      if (!existingMaterial) {
        return res.status(404).json({
          success: false,
          message: 'Material type not found'
        });
      }
      
      // Check if material is in use
      const isInUse = await this.materialTypeRepository.isInUse(id);
      if (isInUse) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete material type that is currently in use in inventory'
        });
      }
      
      await this.materialTypeRepository.delete(id);
      
      logger.info(`[MaterialTypeController.deleteMaterial] ✅ Deleted material type ${id}`);
      
      res.json({
        success: true,
        message: 'Material type deleted successfully'
      });
    } catch (error) {
      logger.error(`[MaterialTypeController.deleteMaterial] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to delete material type',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/materials/:siloId - Get materials in specific silo
  async getMaterialsBySilo(req, res) {
    try {
      const { siloId } = req.params;
      
      // Get inventory for this silo
      const inventoryItems = await this.warehouseInventoryRepository.findBySiloId(siloId);
      
      if (inventoryItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No materials found in silo ${siloId}`
        });
      }
      
      // Extract material information with quantities
      const materials = inventoryItems.map(item => ({
        materialId: item.inventory.materialTypeId,
        materialName: item.material.name,
        materialNameAr: item.material.nameAr,
        description: item.material.description || null,
        colorCode: item.material.colorCode,
        iconPath: item.material.iconPath,
        density: item.material.density,
        unit: item.material.unit,
        inventory: {
          quantity: item.inventory.quantity,
          availableQuantity: item.inventory.availableQuantity,
          reservedQuantity: item.inventory.reservedQuantity,
          entryDate: item.inventory.entryDate,
          expiryDate: item.inventory.expiryDate,
          batchNumber: item.inventory.batchNumber,
          supplier: item.inventory.supplier,
          qualityGrade: item.inventory.qualityGrade,
          notes: item.inventory.notes
        }
      }));
      
      // Calculate totals
      const totals = {
        totalQuantity: materials.reduce((sum, m) => sum + m.inventory.quantity, 0),
        totalAvailable: materials.reduce((sum, m) => sum + m.inventory.availableQuantity, 0),
        totalReserved: materials.reduce((sum, m) => sum + m.inventory.reservedQuantity, 0),
        materialCount: materials.length
      };
      
      logger.info(`[MaterialTypeController.getMaterialsBySilo] ✅ Retrieved ${materials.length} materials for silo ${siloId}`);
      
      res.json({
        success: true,
        data: {
          siloId: parseInt(siloId),
          materials: materials,
          totals: totals
        },
        message: `Materials in silo ${siloId} retrieved successfully`
      });
    } catch (error) {
      logger.error(`[MaterialTypeController.getMaterialsBySilo] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve materials for silo',
        error: error.message
      });
    }
  }
}

export default MaterialTypeController;
