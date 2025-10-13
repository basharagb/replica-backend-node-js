import express from 'express';
import { SiloController } from '../controllers/siloController.js';

const router = express.Router();
const controller = new SiloController();

router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.get('/number/:number', controller.getByNumber.bind(controller));

export default router;