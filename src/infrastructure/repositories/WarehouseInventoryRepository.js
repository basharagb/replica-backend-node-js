import { pool } from '../database/optimizedDb.js';
import WarehouseInventory from '../../domain/entities/WarehouseInventory.js';
import { logger } from '../config/logger.js';

class WarehouseInventoryRepository {
  
  // 🔹 Get all inventory items with silo and material details
  async findAll(filters = {}) {
    let query = `
      SELECT 
        wi.id, wi.silo_id, wi.material_type_id, wi.quantity, 
        wi.reserved_quantity, wi.available_quantity, wi.entry_date,
        wi.expiry_date, wi.batch_number, wi.supplier, wi.quality_grade,
        wi.purchase_price, wi.notes, wi.last_updated,
        s.silo_number, s.silo_group_id,
        sg.name as silo_group_name,
        mt.name as material_name, mt.name_ar as material_name_ar,
        mt.color_code, mt.icon_path
      FROM warehouse_inventory wi
      INNER JOIN silos s ON wi.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
      INNER JOIN material_types mt ON wi.material_type_id = mt.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.siloId) {
      query += ' AND wi.silo_id = ?';
      params.push(filters.siloId);
    }
    
    if (filters.materialTypeId) {
      query += ' AND wi.material_type_id = ?';
      params.push(filters.materialTypeId);
    }
    
    if (filters.minQuantity) {
      query += ' AND wi.quantity >= ?';
      params.push(filters.minQuantity);
    }
    
    if (filters.expiringSoon) {
      query += ' AND wi.expiry_date IS NOT NULL AND wi.expiry_date <= DATE_ADD(NOW(), INTERVAL ? DAY)';
      params.push(filters.expiringSoon);
    }
    
    query += ' ORDER BY s.silo_number ASC, mt.name ASC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        inventory: new WarehouseInventory({
          id: row.id,
          siloId: row.silo_id,
          materialTypeId: row.material_type_id,
          quantity: parseFloat(row.quantity),
          reservedQuantity: parseFloat(row.reserved_quantity),
          availableQuantity: parseFloat(row.available_quantity),
          entryDate: row.entry_date,
          expiryDate: row.expiry_date,
          batchNumber: row.batch_number,
          supplier: row.supplier,
          qualityGrade: row.quality_grade,
          purchasePrice: row.purchase_price ? parseFloat(row.purchase_price) : null,
          notes: row.notes,
          lastUpdated: row.last_updated
        }),
        silo: {
          siloNumber: row.silo_number,
          siloGroupId: row.silo_group_id,
          siloGroupName: row.silo_group_name
        },
        material: {
          name: row.material_name,
          nameAr: row.material_name_ar,
          colorCode: row.color_code,
          iconPath: row.icon_path
        }
      }));
    } catch (err) {
      logger.error(`[WarehouseInventoryRepository.findAll] ❌ ${err.message}`);
      throw new Error('Database error while fetching warehouse inventory');
    }
  }

  // 🔹 Get inventory by silo ID
  async findBySiloId(siloId) {
    const query = `
      SELECT 
        wi.id, wi.silo_id, wi.material_type_id, wi.quantity, 
        wi.reserved_quantity, wi.available_quantity, wi.entry_date,
        wi.expiry_date, wi.batch_number, wi.supplier, wi.quality_grade,
        wi.purchase_price, wi.notes, wi.last_updated,
        mt.name as material_name, mt.name_ar as material_name_ar,
        mt.color_code, mt.icon_path, mt.density, mt.unit
      FROM warehouse_inventory wi
      INNER JOIN material_types mt ON wi.material_type_id = mt.id
      WHERE wi.silo_id = ?
      ORDER BY wi.quantity DESC
    `;
    
    try {
      const [rows] = await pool.query(query, [siloId]);
      return rows.map(row => ({
        inventory: new WarehouseInventory({
          id: row.id,
          siloId: row.silo_id,
          materialTypeId: row.material_type_id,
          quantity: parseFloat(row.quantity),
          reservedQuantity: parseFloat(row.reserved_quantity),
          availableQuantity: parseFloat(row.available_quantity),
          entryDate: row.entry_date,
          expiryDate: row.expiry_date,
          batchNumber: row.batch_number,
          supplier: row.supplier,
          qualityGrade: row.quality_grade,
          purchasePrice: row.purchase_price ? parseFloat(row.purchase_price) : null,
          notes: row.notes,
          lastUpdated: row.last_updated
        }),
        material: {
          name: row.material_name,
          nameAr: row.material_name_ar,
          colorCode: row.color_code,
          iconPath: row.icon_path,
          density: parseFloat(row.density),
          unit: row.unit
        }
      }));
    } catch (err) {
      logger.error(`[WarehouseInventoryRepository.findBySiloId] ❌ ${err.message}`);
      throw new Error(`Database error while fetching inventory for silo ${siloId}`);
    }
  }

  // 🔹 Get inventory by ID
  async findById(id) {
    const query = `
      SELECT 
        id, silo_id, material_type_id, quantity, reserved_quantity, 
        available_quantity, entry_date, expiry_date, batch_number, 
        supplier, quality_grade, purchase_price, notes, last_updated
      FROM warehouse_inventory
      WHERE id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [id]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return new WarehouseInventory({
        id: row.id,
        siloId: row.silo_id,
        materialTypeId: row.material_type_id,
        quantity: parseFloat(row.quantity),
        reservedQuantity: parseFloat(row.reserved_quantity),
        availableQuantity: parseFloat(row.available_quantity),
        entryDate: row.entry_date,
        expiryDate: row.expiry_date,
        batchNumber: row.batch_number,
        supplier: row.supplier,
        qualityGrade: row.quality_grade,
        purchasePrice: row.purchase_price ? parseFloat(row.purchase_price) : null,
        notes: row.notes,
        lastUpdated: row.last_updated
      });
    } catch (err) {
      logger.error(`[WarehouseInventoryRepository.findById] ❌ ${err.message}`);
      throw new Error(`Database error while fetching inventory item ${id}`);
    }
  }

  // 🔹 Create new inventory item
  async create(inventoryData) {
    const query = `
      INSERT INTO warehouse_inventory 
      (silo_id, material_type_id, quantity, reserved_quantity, entry_date, 
       expiry_date, batch_number, supplier, quality_grade, purchase_price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      inventoryData.siloId,
      inventoryData.materialTypeId,
      inventoryData.quantity || 0,
      inventoryData.reservedQuantity || 0,
      inventoryData.entryDate || new Date(),
      inventoryData.expiryDate || null,
      inventoryData.batchNumber || null,
      inventoryData.supplier || null,
      inventoryData.qualityGrade || 'A',
      inventoryData.purchasePrice || null,
      inventoryData.notes || null
    ];
    
    try {
      const [result] = await pool.query(query, params);
      return await this.findById(result.insertId);
    } catch (err) {
      logger.error(`[WarehouseInventoryRepository.create] ❌ ${err.message}`);
      throw new Error('Database error while creating inventory item');
    }
  }

  // 🔹 Update inventory item
  async update(id, inventoryData) {
    const query = `
      UPDATE warehouse_inventory 
      SET quantity = ?, reserved_quantity = ?, expiry_date = ?, 
          batch_number = ?, supplier = ?, quality_grade = ?, 
          purchase_price = ?, notes = ?
      WHERE id = ?
    `;
    
    const params = [
      inventoryData.quantity,
      inventoryData.reservedQuantity,
      inventoryData.expiryDate,
      inventoryData.batchNumber,
      inventoryData.supplier,
      inventoryData.qualityGrade,
      inventoryData.purchasePrice,
      inventoryData.notes,
      id
    ];
    
    try {
      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        throw new Error('Inventory item not found');
      }
      return await this.findById(id);
    } catch (err) {
      logger.error(`[WarehouseInventoryRepository.update] ❌ ${err.message}`);
      throw new Error(`Database error while updating inventory item ${id}`);
    }
  }

  // 🔹 Delete inventory item
  async delete(id) {
    const query = `DELETE FROM warehouse_inventory WHERE id = ?`;
    
    try {
      const [result] = await pool.query(query, [id]);
      if (result.affectedRows === 0) {
        throw new Error('Inventory item not found');
      }
      return true;
    } catch (err) {
      logger.error(`[WarehouseInventoryRepository.delete] ❌ ${err.message}`);
      throw new Error(`Database error while deleting inventory item ${id}`);
    }
  }

  // 🔹 Get warehouse summary statistics
  async getWarehouseSummary() {
    const query = `
      SELECT 
        COUNT(DISTINCT wi.silo_id) as occupied_silos,
        COUNT(DISTINCT wi.material_type_id) as material_types_count,
        SUM(wi.quantity) as total_quantity,
        SUM(wi.available_quantity) as total_available,
        SUM(wi.reserved_quantity) as total_reserved,
        AVG(wi.quantity) as avg_quantity_per_silo,
        COUNT(CASE WHEN wi.expiry_date IS NOT NULL AND wi.expiry_date <= DATE_ADD(NOW(), INTERVAL 30 DAY) THEN 1 END) as expiring_soon_count
      FROM warehouse_inventory wi
      WHERE wi.quantity > 0
    `;
    
    try {
      const [rows] = await pool.query(query);
      const summary = rows[0];
      
      return {
        occupiedSilos: parseInt(summary.occupied_silos) || 0,
        materialTypesCount: parseInt(summary.material_types_count) || 0,
        totalQuantity: parseFloat(summary.total_quantity) || 0,
        totalAvailable: parseFloat(summary.total_available) || 0,
        totalReserved: parseFloat(summary.total_reserved) || 0,
        avgQuantityPerSilo: parseFloat(summary.avg_quantity_per_silo) || 0,
        expiringSoonCount: parseInt(summary.expiring_soon_count) || 0
      };
    } catch (err) {
      logger.error(`[WarehouseInventoryRepository.getWarehouseSummary] ❌ ${err.message}`);
      throw new Error('Database error while fetching warehouse summary');
    }
  }
}

export default WarehouseInventoryRepository;
