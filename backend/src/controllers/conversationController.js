import conversationRepository from '../repositories/conversationRepository.js';

export const getConversations = async (req, res) => {
    try {
        const userId = req.user?.id || 1; // Fallback to test user or authenticated
        const convs = await conversationRepository.findByUserId(userId);
        res.json(convs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const msgs = await conversationRepository.findMessagesByConversationId(id);
        res.json(msgs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, type, appointmentDetails } = req.body;
        const senderId = req.user?.id || 1;
        
        await conversationRepository.createMessage({
            conversationId: id,
            senderId,
            text,
            type,
            appointmentDetails
        });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createOrGetConversation = async (req, res) => {
    try {
        const { recepteurId, annonceId } = req.body;
        const emetteurId = req.user?.id || 1;
        const convId = await conversationRepository.findOrCreateConversation(emetteurId, recepteurId, annonceId);
        res.json({ conversationId: convId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMessageStatus = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { metadata } = req.body;
        const success = await conversationRepository.updateMessageMetadata(messageId, metadata);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Message not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
