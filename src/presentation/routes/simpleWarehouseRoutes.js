import express from 'express';
import SimpleWarehouseController from '../controllers/SimpleWarehouseController.js';

const router = express.Router();
const warehouseController = new SimpleWarehouseController();

// ========================================
// 🏭 PHASE TWO: SIMPLE WAREHOUSE APIs (Using Existing Tables)
// ========================================

// 📦 Material Types APIs
router.get('/materials', (req, res) => warehouseController.getAllMaterials(req, res));
router.post('/materials', (req, res) => warehouseController.createMaterial(req, res));
router.get('/materials/:siloId', (req, res) => warehouseController.getMaterialsBySilo(req, res));

// 🏭 Warehouse Silos APIs
router.get('/silos', (req, res) => warehouseController.getAllSilos(req, res));
router.get('/silos/search', (req, res) => warehouseController.searchSilosByMaterial(req, res));

// 🚛 Shipments APIs
router.get('/shipments', (req, res) => warehouseController.getAllShipments(req, res));
router.get('/shipments/incoming', (req, res) => warehouseController.getAllShipments(req, res));
router.get('/shipments/outgoing', (req, res) => warehouseController.getAllShipments(req, res));
router.get('/shipments/search', (req, res) => warehouseController.getAllShipments(req, res));
router.post('/silo/:id/incoming', (req, res) => warehouseController.createIncomingShipment(req, res));
router.post('/silo/:id/outgoing', (req, res) => warehouseController.createIncomingShipment(req, res));

// 📊 Analytics APIs
router.get('/analytics/fill-level', (req, res) => warehouseController.getFillLevelAnalytics(req, res));
router.get('/analytics/prediction', (req, res) => warehouseController.getFillLevelAnalytics(req, res));
router.get('/analytics/shipments', (req, res) => warehouseController.getFillLevelAnalytics(req, res));

// 📈 Additional APIs
router.get('/summary', (req, res) => warehouseController.getFillLevelAnalytics(req, res));

export default router;
