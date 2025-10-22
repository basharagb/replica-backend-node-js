const WarehouseInventoryRepository = require('../../infrastructure/repositories/WarehouseInventoryRepository');
const ShipmentRepository = require('../../infrastructure/repositories/ShipmentRepository');
const MaterialTypeRepository = require('../../infrastructure/repositories/MaterialTypeRepository');
const logger = require('../../infrastructure/utils/logger');

class WarehouseAnalyticsController {
  constructor() {
    this.warehouseInventoryRepository = new WarehouseInventoryRepository();
    this.shipmentRepository = new ShipmentRepository();
    this.materialTypeRepository = new MaterialTypeRepository();
  }

  // 🔹 GET /warehouse/analytics/fill-level - Get fill level analytics for all silos
  async getFillLevelAnalytics(req, res) {
    try {
      const inventoryItems = await this.warehouseInventoryRepository.findAll();
      
      // Group by silo and calculate fill levels
      const silosMap = new Map();
      
      inventoryItems.forEach(item => {
        const siloId = item.inventory.siloId;
        if (!silosMap.has(siloId)) {
          silosMap.set(siloId, {
            siloId: siloId,
            siloNumber: item.silo.siloNumber,
            siloGroupId: item.silo.siloGroupId,
            siloGroupName: item.silo.siloGroupName,
            totalQuantity: 0,
            totalAvailable: 0,
            totalReserved: 0,
            materials: [],
            utilizationPercentage: 0,
            status: 'empty'
          });
        }
        
        const silo = silosMap.get(siloId);
        silo.totalQuantity += item.inventory.quantity;
        silo.totalAvailable += item.inventory.availableQuantity;
        silo.totalReserved += item.inventory.reservedQuantity;
        silo.materials.push({
          materialId: item.inventory.materialTypeId,
          materialName: item.material.name,
          materialNameAr: item.material.nameAr,
          quantity: item.inventory.quantity,
          colorCode: item.material.colorCode,
          iconPath: item.material.iconPath
        });
      });
      
      // Calculate utilization and status for each silo
      const silos = Array.from(silosMap.values()).map(silo => {
        // Assuming max capacity of 100 tons per silo (this should come from silo configuration)
        const maxCapacity = 100;
        silo.utilizationPercentage = Math.min((silo.totalQuantity / maxCapacity) * 100, 100);
        
        if (silo.utilizationPercentage === 0) {
          silo.status = 'empty';
        } else if (silo.utilizationPercentage < 25) {
          silo.status = 'low';
        } else if (silo.utilizationPercentage < 75) {
          silo.status = 'medium';
        } else if (silo.utilizationPercentage < 95) {
          silo.status = 'high';
        } else {
          silo.status = 'full';
        }
        
        return silo;
      });
      
      // Calculate overall statistics
      const totalSilos = silos.length;
      const occupiedSilos = silos.filter(s => s.totalQuantity > 0).length;
      const emptySilos = totalSilos - occupiedSilos;
      const avgUtilization = silos.reduce((sum, s) => sum + s.utilizationPercentage, 0) / totalSilos;
      
      logger.info(`[WarehouseAnalyticsController.getFillLevelAnalytics] ✅ Retrieved fill level analytics for ${totalSilos} silos`);
      
      res.json({
        success: true,
        data: {
          silos: silos,
          summary: {
            totalSilos,
            occupiedSilos,
            emptySilos,
            avgUtilization: Math.round(avgUtilization * 100) / 100
          }
        },
        message: 'Fill level analytics retrieved successfully'
      });
    } catch (error) {
      logger.error(`[WarehouseAnalyticsController.getFillLevelAnalytics] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve fill level analytics',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/analytics/prediction - Get inventory prediction analytics
  async getInventoryPrediction(req, res) {
    try {
      const daysAhead = parseInt(req.query.days) || 30;
      const dateFrom = new Date();
      const dateTo = new Date();
      dateTo.setDate(dateTo.getDate() + daysAhead);
      
      // Get upcoming shipments
      const upcomingShipments = await this.shipmentRepository.findAll({
        dateFrom: dateFrom.toISOString().split('T')[0],
        dateTo: dateTo.toISOString().split('T')[0]
      });
      
      // Get current inventory
      const currentInventory = await this.warehouseInventoryRepository.findAll();
      
      // Calculate predictions based on scheduled shipments
      const predictions = new Map();
      
      // Initialize with current inventory
      currentInventory.forEach(item => {
        const key = `${item.inventory.siloId}-${item.inventory.materialTypeId}`;
        predictions.set(key, {
          siloId: item.inventory.siloId,
          siloNumber: item.silo.siloNumber,
          materialTypeId: item.inventory.materialTypeId,
          materialName: item.material.name,
          materialNameAr: item.material.nameAr,
          currentQuantity: item.inventory.quantity,
          predictedQuantity: item.inventory.quantity,
          incomingQuantity: 0,
          outgoingQuantity: 0,
          colorCode: item.material.colorCode
        });
      });
      
      // Apply scheduled shipments
      upcomingShipments.shipments.forEach(shipmentItem => {
        const shipment = shipmentItem.shipment;
        const key = `${shipment.siloId}-${shipment.materialTypeId}`;
        
        if (!predictions.has(key)) {
          predictions.set(key, {
            siloId: shipment.siloId,
            siloNumber: shipmentItem.silo.siloNumber,
            materialTypeId: shipment.materialTypeId,
            materialName: shipmentItem.material.name,
            materialNameAr: shipmentItem.material.nameAr,
            currentQuantity: 0,
            predictedQuantity: 0,
            incomingQuantity: 0,
            outgoingQuantity: 0,
            colorCode: shipmentItem.material.colorCode
          });
        }
        
        const prediction = predictions.get(key);
        
        if (shipment.shipmentType === 'INCOMING' && shipment.status !== 'CANCELLED') {
          prediction.incomingQuantity += shipment.quantity;
          prediction.predictedQuantity += shipment.quantity;
        } else if (shipment.shipmentType === 'OUTGOING' && shipment.status !== 'CANCELLED') {
          prediction.outgoingQuantity += shipment.quantity;
          prediction.predictedQuantity -= shipment.quantity;
        }
      });
      
      const predictionArray = Array.from(predictions.values());
      
      // Calculate summary statistics
      const totalCurrentQuantity = predictionArray.reduce((sum, p) => sum + p.currentQuantity, 0);
      const totalPredictedQuantity = predictionArray.reduce((sum, p) => sum + p.predictedQuantity, 0);
      const totalIncoming = predictionArray.reduce((sum, p) => sum + p.incomingQuantity, 0);
      const totalOutgoing = predictionArray.reduce((sum, p) => sum + p.outgoingQuantity, 0);
      
      logger.info(`[WarehouseAnalyticsController.getInventoryPrediction] ✅ Generated prediction for ${daysAhead} days ahead`);
      
      res.json({
        success: true,
        data: {
          predictions: predictionArray,
          summary: {
            daysAhead,
            totalCurrentQuantity,
            totalPredictedQuantity,
            totalIncoming,
            totalOutgoing,
            netChange: totalIncoming - totalOutgoing
          }
        },
        message: 'Inventory prediction retrieved successfully'
      });
    } catch (error) {
      logger.error(`[WarehouseAnalyticsController.getInventoryPrediction] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory prediction',
        error: error.message
      });
    }
  }

  // 🔹 GET /warehouse/analytics/shipments - Get shipment analytics and reports
  async getShipmentAnalytics(req, res) {
    try {
      const dateFrom = req.query.date_from;
      const dateTo = req.query.date_to;
      
      // Get shipment statistics
      const shipmentStats = await this.shipmentRepository.getShipmentStats(dateFrom, dateTo);
      
      // Group statistics by type and status
      const analytics = {
        incoming: {
          scheduled: 0,
          inTransit: 0,
          arrived: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          totalQuantity: 0
        },
        outgoing: {
          scheduled: 0,
          inTransit: 0,
          arrived: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          totalQuantity: 0
        }
      };
      
      shipmentStats.forEach(stat => {
        const type = stat.shipmentType.toLowerCase();
        const status = stat.status.toLowerCase().replace('_', '');
        
        if (analytics[type] && analytics[type].hasOwnProperty(status)) {
          analytics[type][status] = stat.count;
          analytics[type].totalQuantity += stat.totalQuantity;
        }
      });
      
      // Calculate totals
      const totalShipments = shipmentStats.reduce((sum, stat) => sum + stat.count, 0);
      const totalQuantity = shipmentStats.reduce((sum, stat) => sum + stat.totalQuantity, 0);
      
      // Calculate completion rates
      const incomingTotal = Object.values(analytics.incoming).reduce((sum, val) => 
        typeof val === 'number' && val !== analytics.incoming.totalQuantity ? sum + val : sum, 0
      );
      const outgoingTotal = Object.values(analytics.outgoing).reduce((sum, val) => 
        typeof val === 'number' && val !== analytics.outgoing.totalQuantity ? sum + val : sum, 0
      );
      
      const incomingCompletionRate = incomingTotal > 0 ? 
        (analytics.incoming.completed / incomingTotal) * 100 : 0;
      const outgoingCompletionRate = outgoingTotal > 0 ? 
        (analytics.outgoing.completed / outgoingTotal) * 100 : 0;
      
      logger.info(`[WarehouseAnalyticsController.getShipmentAnalytics] ✅ Retrieved shipment analytics`);
      
      res.json({
        success: true,
        data: {
          analytics,
          summary: {
            totalShipments,
            totalQuantity,
            incomingCompletionRate: Math.round(incomingCompletionRate * 100) / 100,
            outgoingCompletionRate: Math.round(outgoingCompletionRate * 100) / 100,
            dateRange: {
              from: dateFrom,
              to: dateTo
            }
          }
        },
        message: 'Shipment analytics retrieved successfully'
      });
    } catch (error) {
      logger.error(`[WarehouseAnalyticsController.getShipmentAnalytics] ❌ ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve shipment analytics',
        error: error.message
      });
    }
  }
}

module.exports = WarehouseAnalyticsController;
