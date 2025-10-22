import { pool } from '../database/optimizedDb.js';
import MaterialType from '../../domain/entities/MaterialType.js';
import { logger } from '../config/logger.js';

class MaterialTypeRepository {
  
  // 🔹 Get all material types
  async findAll(includeInactive = false) {
    let query = `
      SELECT 
        id, name, name_ar, description, icon_path, color_code,
        density, unit, notes, is_active, created_at, updated_at
      FROM material_types
    `;
    
    const params = [];
    if (!includeInactive) {
      query += ' WHERE is_active = ?';
      params.push(true);
    }
    
    query += ' ORDER BY name ASC';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => new MaterialType({
        id: row.id,
        name: row.name,
        nameAr: row.name_ar,
        description: row.description,
        iconPath: row.icon_path,
        colorCode: row.color_code,
        density: parseFloat(row.density),
        unit: row.unit,
        notes: row.notes,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (err) {
      logger.error(`[MaterialTypeRepository.findAll] ❌ ${err.message}`);
      throw new Error('Database error while fetching material types');
    }
  }

  // 🔹 Get material type by ID
  async findById(id) {
    const query = `
      SELECT 
        id, name, name_ar, description, icon_path, color_code,
        density, unit, notes, is_active, created_at, updated_at
      FROM material_types
      WHERE id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [id]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return new MaterialType({
        id: row.id,
        name: row.name,
        nameAr: row.name_ar,
        description: row.description,
        iconPath: row.icon_path,
        colorCode: row.color_code,
        density: parseFloat(row.density),
        unit: row.unit,
        notes: row.notes,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
    } catch (err) {
      logger.error(`[MaterialTypeRepository.findById] ❌ ${err.message}`);
      throw new Error(`Database error while fetching material type ${id}`);
    }
  }

  // 🔹 Create new material type
  async create(materialTypeData) {
    const query = `
      INSERT INTO material_types 
      (name, name_ar, description, icon_path, color_code, density, unit, notes, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      materialTypeData.name,
      materialTypeData.nameAr,
      materialTypeData.description || null,
      materialTypeData.iconPath || null,
      materialTypeData.colorCode || '#4ECDC4',
      materialTypeData.density || 1.000,
      materialTypeData.unit || 'tons',
      materialTypeData.notes || null,
      materialTypeData.isActive !== undefined ? materialTypeData.isActive : true
    ];
    
    try {
      const [result] = await pool.query(query, params);
      return await this.findById(result.insertId);
    } catch (err) {
      logger.error(`[MaterialTypeRepository.create] ❌ ${err.message}`);
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('Material type with this name already exists');
      }
      throw new Error('Database error while creating material type');
    }
  }

  // 🔹 Update material type
  async update(id, materialTypeData) {
    const query = `
      UPDATE material_types 
      SET name = ?, name_ar = ?, description = ?, icon_path = ?, 
          color_code = ?, density = ?, unit = ?, notes = ?, is_active = ?
      WHERE id = ?
    `;
    
    const params = [
      materialTypeData.name,
      materialTypeData.nameAr,
      materialTypeData.description,
      materialTypeData.iconPath,
      materialTypeData.colorCode,
      materialTypeData.density,
      materialTypeData.unit,
      materialTypeData.notes,
      materialTypeData.isActive,
      id
    ];
    
    try {
      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        throw new Error('Material type not found');
      }
      return await this.findById(id);
    } catch (err) {
      logger.error(`[MaterialTypeRepository.update] ❌ ${err.message}`);
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('Material type with this name already exists');
      }
      throw new Error(`Database error while updating material type ${id}`);
    }
  }

  // 🔹 Delete material type (soft delete)
  async delete(id) {
    const query = `UPDATE material_types SET is_active = FALSE WHERE id = ?`;
    
    try {
      const [result] = await pool.query(query, [id]);
      if (result.affectedRows === 0) {
        throw new Error('Material type not found');
      }
      return true;
    } catch (err) {
      logger.error(`[MaterialTypeRepository.delete] ❌ ${err.message}`);
      throw new Error(`Database error while deleting material type ${id}`);
    }
  }

  // 🔹 Check if material type is in use
  async isInUse(id) {
    const query = `
      SELECT COUNT(*) as count 
      FROM warehouse_inventory 
      WHERE material_type_id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [id]);
      return rows[0].count > 0;
    } catch (err) {
      logger.error(`[MaterialTypeRepository.isInUse] ❌ ${err.message}`);
      throw new Error('Database error while checking material type usage');
    }
  }

  // 🔹 Get material types with inventory count
  async findAllWithInventoryCount() {
    const query = `
      SELECT 
        mt.id, mt.name, mt.name_ar, mt.description, mt.icon_path, 
        mt.color_code, mt.density, mt.unit, mt.notes, mt.is_active,
        mt.created_at, mt.updated_at,
        COALESCE(SUM(wi.quantity), 0) as total_quantity,
        COUNT(DISTINCT wi.silo_id) as silo_count
      FROM material_types mt
      LEFT JOIN warehouse_inventory wi ON mt.id = wi.material_type_id
      WHERE mt.is_active = TRUE
      GROUP BY mt.id
      ORDER BY mt.name ASC
    `;
    
    try {
      const [rows] = await pool.query(query);
      return rows.map(row => ({
        ...new MaterialType({
          id: row.id,
          name: row.name,
          nameAr: row.name_ar,
          description: row.description,
          iconPath: row.icon_path,
          colorCode: row.color_code,
          density: parseFloat(row.density),
          unit: row.unit,
          notes: row.notes,
          isActive: Boolean(row.is_active),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }).toJSON(),
        totalQuantity: parseFloat(row.total_quantity),
        siloCount: parseInt(row.silo_count)
      }));
    } catch (err) {
      logger.error(`[MaterialTypeRepository.findAllWithInventoryCount] ❌ ${err.message}`);
      throw new Error('Database error while fetching material types with inventory');
    }
  }
}

export default MaterialTypeRepository;
