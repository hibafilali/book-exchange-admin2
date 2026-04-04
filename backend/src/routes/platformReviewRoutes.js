import express from 'express';
import platformReviewController from '../controllers/platformReviewController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Student submits a review
router.post('/', platformReviewController.createReview);

// Admin retrieves all reviews
router.get('/admin', (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès interdit.' });
    next();
}, platformReviewController.getAdminReviews);

export default router;
