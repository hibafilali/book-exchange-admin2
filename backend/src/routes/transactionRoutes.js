import express from 'express';
import transactionController from '../controllers/transactionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authMiddleware to all transaction routes
router.use(authMiddleware);

router.post('/', transactionController.create);
router.get('/purchases', transactionController.getPurchases);
router.get('/sales', transactionController.getSales);
router.patch('/:id/accept', transactionController.accept);
router.patch('/:id/schedule', transactionController.schedule);
router.patch('/:id/complete', transactionController.complete);
router.patch('/:id/cancel', transactionController.cancel);

// Admin routes
router.get('/admin', (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès interdit.' });
    next();
}, transactionController.getAdminTransactions);

export default router;
