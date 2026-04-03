import express from 'express';
import annonceController from '../controllers/annonceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/', annonceController.getAll);
router.get('/my', authMiddleware, annonceController.getMy);
router.get('/:id', annonceController.getById);
router.post('/', authMiddleware, upload.array('photos', 5), annonceController.create);
router.put('/:id/status', annonceController.updateStatus);

export default router;
