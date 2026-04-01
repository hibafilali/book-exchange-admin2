import express from 'express';
import dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/:userId', dashboardController.getDashboardData);

export default router;
