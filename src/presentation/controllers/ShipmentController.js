const ShipmentRepository = require('../../infrastructure/repositories/ShipmentRepository');
const WarehouseInventoryRepository = require('../../infrastructure/repositories/WarehouseInventoryRepository');
const Shipment = require('../../domain/entities/Shipment');
const logger = require('../../infrastructure/utils/logger');

class ShipmentController {
  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.warehouseInventoryRepository = new WarehouseInventoryRepository();
  }

  // 🔹 GET /warehouse/shipments - Get all shipments with pagination
  async getAllShipments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      
      const filters = {
        shipmentType: req.query.type,
        status: req.query.status,
        siloId: req.query.silo_id,
        materialTypeId: req.query.material_type_id,
        dateFrom: req.query.date_from,
        dateTo: req.query.date_to
      };
      
      const result = await this.shipmentRepository.findAll(filters, page, limit);
      
      logger.info(`[ShipmentController.getAllShipments] ✅ Retrieved ${result.shipments.length} shipments`);
      
      res.json({
        success: true,
        data: result.shipments.map(item => ({
          ...item.shipment.toJSON(),
          silo: item.silo,
          material: item.material
        })),
        pagination: result.pagination,
        message: 'Shipments retrieved successfully'
      });
    } catch (error) {
      logger.error(`[ShipmentController.getAllShipments] ❌ ${error.message}`);
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
      
      const shipmentData = {
        shipmentType: 'INCOMING',
        siloId: parseInt(id),
        materialTypeId: req.body.material_type_id,
        quantity: req.body.quantity,
        scheduledDate: req.body.scheduled_date,
        truckPlate: req.body.truck_plate,
        driverName: req.body.driver_name,
        driverPhone: req.body.driver_phone,
        supplierCustomer: req.body.supplier,
        notes: req.body.notes,
        createdBy: req.user?.id || null
      };
      
      // Validation
      if (!shipmentData.materialTypeId || !shipmentData.quantity || !shipmentData.scheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'Material type, quantity, and scheduled date are required'
        });
      }
      
      if (shipmentData.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than zero'
        });
      }
      
      const shipment = await this.shipmentRepository.create(shipmentData);
      
      logger.info(`[ShipmentController.createIncomingShipment] ✅ Created incoming shipment: ${shipment.referenceNumber}`);
      
      res.status(201).json({
        success: true,
        data: shipment.toJSON(),
        message: 'Incoming shipment created successfully'
      });
    } catch (error) {
      logger.error(`[ShipmentController.createIncomingShipment] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to create incoming shipment',
        error: error.message
      });
    }
  }

  // 🔹 POST /warehouse/silo/:id/outgoing - Create outgoing shipment
  async createOutgoingShipment(req, res) {
    try {
      const { id } = req.params;
      
      const shipmentData = {
        shipmentType: 'OUTGOING',
        siloId: parseInt(id),
        materialTypeId: req.body.material_type_id,
        quantity: req.body.quantity,
        scheduledDate: req.body.scheduled_date,
        truckPlate: req.body.truck_plate,
        driverName: req.body.driver_name,
        driverPhone: req.body.driver_phone,
        supplierCustomer: req.body.customer,
        notes: req.body.notes,
        createdBy: req.user?.id || null
      };
      
      // Validation
      if (!shipmentData.materialTypeId || !shipmentData.quantity || !shipmentData.scheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'Material type, quantity, and scheduled date are required'
        });
      }
      
      if (shipmentData.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than zero'
        });
      }
      
      // Check if enough inventory is available
      const inventoryItems = await this.warehouseInventoryRepository.findBySiloId(id);
      const materialInventory = inventoryItems.find(item => 
        item.inventory.materialTypeId === shipmentData.materialTypeId
      );
      
      if (!materialInventory || materialInventory.inventory.availableQuantity < shipmentData.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient inventory available for this outgoing shipment'
        });
      }
      
      const shipment = await this.shipmentRepository.create(shipmentData);
      
      logger.info(`[ShipmentController.createOutgoingShipment] ✅ Created outgoing shipment: ${shipment.referenceNumber}`);
      
      res.status(201).json({
        success: true,
        data: shipment.toJSON(),
        message: 'Outgoing shipment created successfully'
      });
    } catch (error) {
      logger.error(`[ShipmentController.createOutgoingShipment] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to create outgoing shipment',
        error: error.message
      });
    }
  }

  // 🔹 PATCH /warehouse/shipment/:id/confirm - Confirm shipment completion
  async confirmShipment(req, res) {
    try {
      const { id } = req.params;
      
      const shipment = await this.shipmentRepository.findById(id);
      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }
      
      if (!shipment.canComplete()) {
        return res.status(400).json({
          success: false,
          message: `Cannot confirm shipment with status: ${shipment.status}`
        });
      }
      
      const confirmationCode = Shipment.generateConfirmationCode();
      const updatedShipment = await this.shipmentRepository.updateStatus(id, 'COMPLETED', confirmationCode);
      
      // TODO: Update inventory based on shipment type
      // For incoming: add to inventory
      // For outgoing: remove from inventory
      
      logger.info(`[ShipmentController.confirmShipment] ✅ Confirmed shipment ${id} with code ${confirmationCode}`);
      
      res.json({
        success: true,
        data: updatedShipment.toJSON(),
        message: 'Shipment confirmed successfully'
      });
    } catch (error) {
      logger.error(`[ShipmentController.confirmShipment] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to confirm shipment',
        error: error.message
      });
    }
  }

  // 🔹 DELETE /warehouse/shipment/:id - Cancel/Delete shipment
  async cancelShipment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const shipment = await this.shipmentRepository.findById(id);
      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Shipment not found'
        });
      }
      
      if (!shipment.canCancel()) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel shipment with status: ${shipment.status}`
        });
      }
      
      // Update status to cancelled instead of deleting
      shipment.cancel(reason);
      const updatedShipment = await this.shipmentRepository.updateStatus(
        id, 
        'CANCELLED', 
        null
      );
      
      // Update notes with cancellation reason
      if (reason) {
        await this.shipmentRepository.update(id, {
          ...updatedShipment.toJSON(),
          notes: shipment.notes
        });
      }
      
      logger.info(`[ShipmentController.cancelShipment] ✅ Cancelled shipment ${id}`);
      
      res.json({
        success: true,
        data: updatedShipment.toJSON(),
        message: 'Shipment cancelled successfully'
      });
    } catch (error) {
      logger.error(`[ShipmentController.cancelShipment] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel shipment',
        error: error.message
      });
    }
  }
}

module.exports = ShipmentController;
