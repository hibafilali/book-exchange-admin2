import express from 'express';
import adminController from '../controllers/adminController.js';
// In a real application, you'd add authentication middleware here
// (e.g., authMiddleware, roleMiddleware)

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', adminController.getDashboardStats);

export default router;
