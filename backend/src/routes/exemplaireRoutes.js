import express from 'express';
import exemplaireController from '../controllers/exemplaireController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/my', exemplaireController.getMyLibrary);
router.get('/available', exemplaireController.getAvailableForAd);
router.post('/', exemplaireController.add);
router.patch('/:id', upload.single('photo'), exemplaireController.update);
router.delete('/:id', exemplaireController.delete);

export default router;
