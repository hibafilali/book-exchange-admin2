import express from 'express';
import plainteController from '../controllers/plainteController.js';

const router = express.Router();

router.post('/', plainteController.create);
router.get('/user/:userId', plainteController.getByUserId);
router.get('/', plainteController.getAll);
router.put('/:id/status', plainteController.updateStatus);

export default router;
