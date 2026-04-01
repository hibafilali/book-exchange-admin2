import express from 'express';
import annonceController from '../controllers/annonceController.js';

const router = express.Router();

router.get('/', annonceController.getAll);
router.get('/:id', annonceController.getById);
router.post('/', annonceController.create);
router.put('/:id/status', annonceController.updateStatus);

export default router;
