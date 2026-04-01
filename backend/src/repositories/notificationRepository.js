import pool from '../config/db.js';

class NotificationRepository {
    async create(userId, titre, message, type) {
        const query = `
            INSERT INTO notifications (user_id, titre, message, type, is_read) 
            VALUES (?, ?, ?, ?, false)
        `;
        const [result] = await pool.query(query, [userId, titre, message, type]);
        return result.insertId;
    }

    async getByUserId(userId) {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    }

    async markAsRead(id) {
        await pool.query('UPDATE notifications SET is_read = true WHERE id = ?', [id]);
        return true;
    }
}

export default new NotificationRepository();
