import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/me/sidebar', authMiddleware, userController.getUserDashboardSummary);
router.put('/me/avatar', authMiddleware, upload.single('avatar'), userController.updateAvatar);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
