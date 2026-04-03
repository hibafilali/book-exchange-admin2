import pool from '../config/db.js';

class ConversationRepository {
    async findByUserId(userId) {
        const query = `
            SELECT c.*, 
                   u1.nom as user1_nom, u1.prenom as user1_prenom, u1.avatarUrl as user1_avatar,
                   u2.nom as user2_nom, u2.prenom as user2_prenom, u2.avatarUrl as user2_avatar,
                   (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
            FROM conversations c
            JOIN users u1 ON c.user1_id = u1.id
            JOIN users u2 ON c.user2_id = u2.id
            WHERE c.user1_id = ? OR c.user2_id = ?
            ORDER BY c.last_message_at DESC
        `;
        const [rows] = await pool.query(query, [userId, userId]);
        return rows;
    }

    async findMessagesByConversationId(conversationId) {
        const query = `
            SELECT m.*, 
                   u.nom as sender_nom, 
                   u.prenom as sender_prenom, 
                   u.avatarUrl as sender_avatar
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        `;
        const [rows] = await pool.query(query, [conversationId]);
        return rows;
    }

    async createMessage(data) {
        const { conversationId, senderId, text, type, appointmentDetails } = data;
        const [result] = await pool.query(
            'INSERT INTO messages (conversation_id, sender_id, message_text, message_type, metadata) VALUES (?, ?, ?, ?, ?)',
            [conversationId, senderId, text, (type || 'TEXT').toUpperCase(), appointmentDetails ? JSON.stringify(appointmentDetails) : null]
        );
        
        // Update conversation last activity
        await pool.query('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId]);
        
        return result.insertId;
    }

    async findOrCreateConversation(user1, user2) {
        // Find existing
        const [existing] = await pool.query(
            'SELECT id FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)',
            [user1, user2, user2, user1]
        );

        if (existing.length > 0) return existing[0].id;

        // Create new
        const [result] = await pool.query(
            'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
            [user1, user2]
        );
        return result.insertId;
    }
}

export default new ConversationRepository();
