import express from 'express';
import { getConversations, getMessages, sendMessage, createOrGetConversation, updateMessageStatus, sendImageMessage } from '../controllers/conversationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', getConversations);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.post('/:id/messages/image', upload.single('image'), sendImageMessage);
router.patch('/messages/:messageId', updateMessageStatus);
router.post('/start', createOrGetConversation);

export default router;
