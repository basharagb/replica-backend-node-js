const pool = require('../database/optimizedDb');
const Shipment = require('../../domain/entities/Shipment');
const logger = require('../utils/logger');

class ShipmentRepository {
  
  // 🔹 Get all shipments with filters and pagination
  async findAll(filters = {}, page = 1, limit = 50) {
    let query = `
      SELECT 
        sh.id, sh.shipment_type, sh.reference_number, sh.silo_id, 
        sh.material_type_id, sh.quantity, sh.scheduled_date, sh.actual_date,
        sh.truck_plate, sh.driver_name, sh.driver_phone, sh.supplier_customer,
        sh.status, sh.confirmation_code, sh.notes, sh.created_by,
        sh.created_at, sh.updated_at,
        s.silo_number, s.silo_group_id,
        sg.name as silo_group_name,
        mt.name as material_name, mt.name_ar as material_name_ar,
        mt.color_code, mt.icon_path
      FROM shipments sh
      INNER JOIN silos s ON sh.silo_id = s.id
      LEFT JOIN silo_groups sg ON s.silo_group_id = sg.id
      INNER JOIN material_types mt ON sh.material_type_id = mt.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.shipmentType) {
      query += ' AND sh.shipment_type = ?';
      params.push(filters.shipmentType);
    }
    
    if (filters.status) {
      query += ' AND sh.status = ?';
      params.push(filters.status);
    }
    
    if (filters.siloId) {
      query += ' AND sh.silo_id = ?';
      params.push(filters.siloId);
    }
    
    if (filters.materialTypeId) {
      query += ' AND sh.material_type_id = ?';
      params.push(filters.materialTypeId);
    }
    
    if (filters.dateFrom) {
      query += ' AND sh.scheduled_date >= ?';
      params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query += ' AND sh.scheduled_date <= ?';
      params.push(filters.dateTo);
    }
    
    if (filters.truckPlate) {
      query += ' AND sh.truck_plate LIKE ?';
      params.push(`%${filters.truckPlate}%`);
    }
    
    if (filters.driverName) {
      query += ' AND sh.driver_name LIKE ?';
      params.push(`%${filters.driverName}%`);
    }
    
    if (filters.supplierCustomer) {
      query += ' AND sh.supplier_customer LIKE ?';
      params.push(`%${filters.supplierCustomer}%`);
    }
    
    if (filters.referenceNumber) {
      query += ' AND sh.reference_number LIKE ?';
      params.push(`%${filters.referenceNumber}%`);
    }
    
    // Count total for pagination
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;
    
    // Add pagination
    query += ' ORDER BY sh.scheduled_date DESC, sh.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);
    
    try {
      const [rows] = await pool.query(query, params);
      const shipments = rows.map(row => ({
        shipment: new Shipment({
          id: row.id,
          shipmentType: row.shipment_type,
          referenceNumber: row.reference_number,
          siloId: row.silo_id,
          materialTypeId: row.material_type_id,
          quantity: parseFloat(row.quantity),
          scheduledDate: row.scheduled_date,
          actualDate: row.actual_date,
          truckPlate: row.truck_plate,
          driverName: row.driver_name,
          driverPhone: row.driver_phone,
          supplierCustomer: row.supplier_customer,
          status: row.status,
          confirmationCode: row.confirmation_code,
          notes: row.notes,
          createdBy: row.created_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at
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
      
      return {
        shipments,
        pagination: {
          currentPage: page,
          perPage: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1
        }
      };
    } catch (err) {
      logger.error(`[ShipmentRepository.findAll] ❌ ${err.message}`);
      throw new Error('Database error while fetching shipments');
    }
  }

  // 🔹 Get shipment by ID
  async findById(id) {
    const query = `
      SELECT 
        id, shipment_type, reference_number, silo_id, material_type_id,
        quantity, scheduled_date, actual_date, truck_plate, driver_name,
        driver_phone, supplier_customer, status, confirmation_code,
        notes, created_by, created_at, updated_at
      FROM shipments
      WHERE id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [id]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return new Shipment({
        id: row.id,
        shipmentType: row.shipment_type,
        referenceNumber: row.reference_number,
        siloId: row.silo_id,
        materialTypeId: row.material_type_id,
        quantity: parseFloat(row.quantity),
        scheduledDate: row.scheduled_date,
        actualDate: row.actual_date,
        truckPlate: row.truck_plate,
        driverName: row.driver_name,
        driverPhone: row.driver_phone,
        supplierCustomer: row.supplier_customer,
        status: row.status,
        confirmationCode: row.confirmation_code,
        notes: row.notes,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
    } catch (err) {
      logger.error(`[ShipmentRepository.findById] ❌ ${err.message}`);
      throw new Error(`Database error while fetching shipment ${id}`);
    }
  }

  // 🔹 Get shipment by reference number
  async findByReferenceNumber(referenceNumber) {
    const query = `
      SELECT 
        id, shipment_type, reference_number, silo_id, material_type_id,
        quantity, scheduled_date, actual_date, truck_plate, driver_name,
        driver_phone, supplier_customer, status, confirmation_code,
        notes, created_by, created_at, updated_at
      FROM shipments
      WHERE reference_number = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [referenceNumber]);
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return new Shipment({
        id: row.id,
        shipmentType: row.shipment_type,
        referenceNumber: row.reference_number,
        siloId: row.silo_id,
        materialTypeId: row.material_type_id,
        quantity: parseFloat(row.quantity),
        scheduledDate: row.scheduled_date,
        actualDate: row.actual_date,
        truckPlate: row.truck_plate,
        driverName: row.driver_name,
        driverPhone: row.driver_phone,
        supplierCustomer: row.supplier_customer,
        status: row.status,
        confirmationCode: row.confirmation_code,
        notes: row.notes,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
    } catch (err) {
      logger.error(`[ShipmentRepository.findByReferenceNumber] ❌ ${err.message}`);
      throw new Error(`Database error while fetching shipment ${referenceNumber}`);
    }
  }

  // 🔹 Create new shipment
  async create(shipmentData) {
    // Generate reference number if not provided
    if (!shipmentData.referenceNumber) {
      shipmentData.referenceNumber = Shipment.generateReferenceNumber(shipmentData.shipmentType);
    }
    
    const query = `
      INSERT INTO shipments 
      (shipment_type, reference_number, silo_id, material_type_id, quantity,
       scheduled_date, truck_plate, driver_name, driver_phone, supplier_customer,
       status, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      shipmentData.shipmentType,
      shipmentData.referenceNumber,
      shipmentData.siloId,
      shipmentData.materialTypeId,
      shipmentData.quantity,
      shipmentData.scheduledDate,
      shipmentData.truckPlate || null,
      shipmentData.driverName || null,
      shipmentData.driverPhone || null,
      shipmentData.supplierCustomer || null,
      shipmentData.status || 'SCHEDULED',
      shipmentData.notes || null,
      shipmentData.createdBy || null
    ];
    
    try {
      const [result] = await pool.query(query, params);
      return await this.findById(result.insertId);
    } catch (err) {
      logger.error(`[ShipmentRepository.create] ❌ ${err.message}`);
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('Shipment with this reference number already exists');
      }
      throw new Error('Database error while creating shipment');
    }
  }

  // 🔹 Update shipment
  async update(id, shipmentData) {
    const query = `
      UPDATE shipments 
      SET quantity = ?, scheduled_date = ?, actual_date = ?, truck_plate = ?,
          driver_name = ?, driver_phone = ?, supplier_customer = ?, status = ?,
          confirmation_code = ?, notes = ?
      WHERE id = ?
    `;
    
    const params = [
      shipmentData.quantity,
      shipmentData.scheduledDate,
      shipmentData.actualDate,
      shipmentData.truckPlate,
      shipmentData.driverName,
      shipmentData.driverPhone,
      shipmentData.supplierCustomer,
      shipmentData.status,
      shipmentData.confirmationCode,
      shipmentData.notes,
      id
    ];
    
    try {
      const [result] = await pool.query(query, params);
      if (result.affectedRows === 0) {
        throw new Error('Shipment not found');
      }
      return await this.findById(id);
    } catch (err) {
      logger.error(`[ShipmentRepository.update] ❌ ${err.message}`);
      throw new Error(`Database error while updating shipment ${id}`);
    }
  }

  // 🔹 Update shipment status
  async updateStatus(id, status, confirmationCode = null) {
    const query = `
      UPDATE shipments 
      SET status = ?, confirmation_code = ?, actual_date = CASE 
        WHEN status = 'IN_PROGRESS' AND actual_date IS NULL THEN NOW()
        ELSE actual_date 
      END
      WHERE id = ?
    `;
    
    try {
      const [result] = await pool.query(query, [status, confirmationCode, id]);
      if (result.affectedRows === 0) {
        throw new Error('Shipment not found');
      }
      return await this.findById(id);
    } catch (err) {
      logger.error(`[ShipmentRepository.updateStatus] ❌ ${err.message}`);
      throw new Error(`Database error while updating shipment status ${id}`);
    }
  }

  // 🔹 Delete shipment
  async delete(id) {
    const query = `DELETE FROM shipments WHERE id = ?`;
    
    try {
      const [result] = await pool.query(query, [id]);
      if (result.affectedRows === 0) {
        throw new Error('Shipment not found');
      }
      return true;
    } catch (err) {
      logger.error(`[ShipmentRepository.delete] ❌ ${err.message}`);
      throw new Error(`Database error while deleting shipment ${id}`);
    }
  }

  // 🔹 Get shipment statistics
  async getShipmentStats(dateFrom = null, dateTo = null) {
    let query = `
      SELECT 
        shipment_type,
        status,
        COUNT(*) as count,
        SUM(quantity) as total_quantity,
        AVG(quantity) as avg_quantity
      FROM shipments
      WHERE 1=1
    `;
    
    const params = [];
    
    if (dateFrom) {
      query += ' AND scheduled_date >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      query += ' AND scheduled_date <= ?';
      params.push(dateTo);
    }
    
    query += ' GROUP BY shipment_type, status ORDER BY shipment_type, status';
    
    try {
      const [rows] = await pool.query(query, params);
      return rows.map(row => ({
        shipmentType: row.shipment_type,
        status: row.status,
        count: parseInt(row.count),
        totalQuantity: parseFloat(row.total_quantity),
        avgQuantity: parseFloat(row.avg_quantity)
      }));
    } catch (err) {
      logger.error(`[ShipmentRepository.getShipmentStats] ❌ ${err.message}`);
      throw new Error('Database error while fetching shipment statistics');
    }
  }
}

module.exports = ShipmentRepository;
