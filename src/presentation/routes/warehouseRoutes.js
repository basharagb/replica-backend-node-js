import express from 'express';
import MaterialTypeController from '../controllers/MaterialTypeController.js';
import WarehouseController from '../controllers/WarehouseController.js';
import ShipmentController from '../controllers/ShipmentController.js';
import WarehouseAnalyticsController from '../controllers/WarehouseAnalyticsController.js';

const router = express.Router();

// Initialize controllers
const materialTypeController = new MaterialTypeController();
const warehouseController = new WarehouseController();
const shipmentController = new ShipmentController();
const warehouseAnalyticsController = new WarehouseAnalyticsController();

// ========================================
// 🏭 PHASE TWO: WAREHOUSE MANAGEMENT APIs
// ========================================

// 📦 Material Types APIs (5 endpoints)
// GET /warehouse/materials - Get all material types
router.get('/materials', (req, res) => materialTypeController.getAllMaterials(req, res));

// POST /warehouse/materials - Create new material type
router.post('/materials', (req, res) => materialTypeController.createMaterial(req, res));

// PATCH /warehouse/materials/:id - Update material type
router.patch('/materials/:id', (req, res) => materialTypeController.updateMaterial(req, res));

// DELETE /warehouse/materials/:id - Delete material type
router.delete('/materials/:id', (req, res) => materialTypeController.deleteMaterial(req, res));

// GET /warehouse/materials/:siloId - Get materials in specific silo
router.get('/materials/:siloId', (req, res) => materialTypeController.getMaterialsBySilo(req, res));

// 🏭 Warehouse Silos APIs (4 endpoints)
// GET /warehouse/silos - Get all warehouse silos with inventory
router.get('/silos', (req, res) => warehouseController.getAllWarehouseSilos(req, res));

// GET /warehouse/silos/search - Search silos by material type (تحتوي قمح، تحتوي شعير)
router.get('/silos/search', (req, res) => warehouseController.searchSilosByMaterial(req, res));

// GET /warehouse/silo/:id - Get specific silo inventory details
router.get('/silo/:id', (req, res) => warehouseController.getSiloInventory(req, res));

// PATCH /warehouse/silo/:id - Update silo inventory notes
router.patch('/silo/:id', (req, res) => warehouseController.updateSiloNotes(req, res));

// 🚛 Shipments APIs (8 endpoints)
// GET /warehouse/shipments - Get all shipments with pagination
router.get('/shipments', (req, res) => shipmentController.getAllShipments(req, res));

// GET /warehouse/shipments/search - Search shipments by various criteria
router.get('/shipments/search', (req, res) => shipmentController.searchShipments(req, res));

// GET /warehouse/shipments/incoming - Get only incoming shipments
router.get('/shipments/incoming', (req, res) => shipmentController.getIncomingShipments(req, res));

// GET /warehouse/shipments/outgoing - Get only outgoing shipments
router.get('/shipments/outgoing', (req, res) => shipmentController.getOutgoingShipments(req, res));

// POST /warehouse/silo/:id/incoming - Create incoming shipment
router.post('/silo/:id/incoming', (req, res) => shipmentController.createIncomingShipment(req, res));

// POST /warehouse/silo/:id/outgoing - Create outgoing shipment
router.post('/silo/:id/outgoing', (req, res) => shipmentController.createOutgoingShipment(req, res));

// PATCH /warehouse/shipment/:id/confirm - Confirm shipment completion
router.patch('/shipment/:id/confirm', (req, res) => shipmentController.confirmShipment(req, res));

// DELETE /warehouse/shipment/:id - Cancel/Delete shipment
router.delete('/shipment/:id', (req, res) => shipmentController.cancelShipment(req, res));

// 📊 Analytics / Reports APIs (3 endpoints)
// GET /warehouse/analytics/fill-level - Get fill level analytics for all silos
router.get('/analytics/fill-level', (req, res) => warehouseAnalyticsController.getFillLevelAnalytics(req, res));

// GET /warehouse/analytics/prediction - Get inventory prediction analytics
router.get('/analytics/prediction', (req, res) => warehouseAnalyticsController.getInventoryPrediction(req, res));

// GET /warehouse/analytics/shipments - Get shipment analytics and reports
router.get('/analytics/shipments', (req, res) => warehouseAnalyticsController.getShipmentAnalytics(req, res));

// 📈 Additional Warehouse Summary API
// GET /warehouse/summary - Get warehouse summary statistics
router.get('/summary', (req, res) => warehouseController.getWarehouseSummary(req, res));

export default router;
