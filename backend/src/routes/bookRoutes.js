import express from 'express';
import bookController from '../controllers/bookController.js';

const router = express.Router();

router.get('/', bookController.getAll);
router.get('/:id', bookController.getById);
router.post('/', bookController.create);

export default router;
