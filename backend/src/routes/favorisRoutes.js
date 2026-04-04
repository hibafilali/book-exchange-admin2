import express from 'express';
import favorisController from '../controllers/favorisController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', favorisController.get);
router.post('/', favorisController.add);
router.delete('/:annonceId', favorisController.remove);

export default router;
