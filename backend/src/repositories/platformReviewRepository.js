import pool from '../config/db.js';

class PlatformReviewRepository {
    async create(data) {
        const { transaction_id, user_id, rating, comment } = data;
        const [result] = await pool.query(
            'INSERT INTO platform_reviews (transaction_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [transaction_id, user_id, rating, comment || null]
        );
        return { id: result.insertId, ...data };
    }

    async findAll() {
        const [rows] = await pool.query(
            `SELECT pr.*, u.nom as user_name, u.email as user_email
             FROM platform_reviews pr
             JOIN users u ON pr.user_id = u.id
             ORDER BY pr.created_at DESC`
        );
        return rows;
    }

    async findByTransactionId(transactionId) {
        const [rows] = await pool.query(
            'SELECT * FROM platform_reviews WHERE transaction_id = ?',
            [transactionId]
        );
        return rows[0];
    }
}

export default new PlatformReviewRepository();
