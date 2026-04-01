import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get notifications for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unread count
router.get('/:userId/unread-count', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
            [userId]
        );
        res.json({ count: rows[0].count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark all as read
router.put('/:userId/read-all', async (req, res) => {
    try {
        const { userId } = req.params;
        await pool.query(
            'UPDATE notifications SET is_read = true WHERE user_id = ?',
            [userId]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
