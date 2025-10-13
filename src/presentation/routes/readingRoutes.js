// ==============================
// 📦 Imports
// ==============================
import express from 'express';
import { ReadingController } from '../controllers/readingController.js';

const router = express.Router();
const controller = new ReadingController();

// ==============================
// 🌡️ Reading Routes - مسارات القراءات
// ==============================

// 🔹 مسارات القراءات حسب المستشعر
router.get('/by-sensor', controller.getBySensorId.bind(controller));
router.get('/latest/by-sensor', controller.getLatestBySensorId.bind(controller));
router.get('/max/by-sensor', controller.getMaxBySensorId.bind(controller));

// 🔹 مسارات القراءات حسب الكابل
router.get('/by-cable', controller.getByCableId.bind(controller));
router.get('/latest/by-cable', controller.getLatestByCableId.bind(controller));
router.get('/max/by-cable', controller.getMaxByCableId.bind(controller));

// 🔹 مسارات القراءات حسب معرف الصومعة
router.get('/by-silo-id', controller.getBySiloId.bind(controller));
router.get('/latest/by-silo-id', controller.getLatestBySiloId.bind(controller));
router.get('/max/by-silo-id', controller.getMaxBySiloId.bind(controller));

// 🔹 مسارات القراءات المتوسطة حسب معرف الصومعة
router.get('/avg/by-silo-id', controller.getAvgBySiloId.bind(controller));
router.get('/avg/latest/by-silo-id', controller.getLatestAvgBySiloId.bind(controller));
router.get('/avg/max/by-silo-id', controller.getMaxAvgBySiloId.bind(controller));

// 🔹 مسارات القراءات حسب رقم الصومعة
router.get('/by-silo-number', controller.getBySiloNumber.bind(controller));
router.get('/latest/by-silo-number', controller.getLatestBySiloNumber.bind(controller));
router.get('/max/by-silo-number', controller.getMaxBySiloNumber.bind(controller));

// 🔹 مسارات القراءات المتوسطة حسب رقم الصومعة
router.get('/avg/by-silo-number', controller.getAvgBySiloNumber.bind(controller));
router.get('/avg/latest/by-silo-number', controller.getLatestAvgBySiloNumber.bind(controller));
router.get('/avg/max/by-silo-number', controller.getMaxAvgBySiloNumber.bind(controller));

// 🔹 مسارات القراءات حسب معرف مجموعة الصوامع
router.get('/by-silo-group-id', controller.getBySiloGroupId.bind(controller));
router.get('/latest/by-silo-group-id', controller.getLatestBySiloGroupId.bind(controller));
router.get('/max/by-silo-group-id', controller.getMaxBySiloGroupId.bind(controller));

// 🔹 مسارات القراءات المتوسطة حسب معرف مجموعة الصوامع
router.get('/avg/by-silo-group-id', controller.getAvgBySiloGroupId.bind(controller));
router.get('/avg/latest/by-silo-group-id', controller.getLatestAvgBySiloGroupId.bind(controller));
router.get('/avg/max/by-silo-group-id', controller.getMaxAvgBySiloGroupId.bind(controller));

export default router;
