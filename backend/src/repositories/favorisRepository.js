import pool from '../config/db.js';

class FavorisRepository {
    async add(userId, annonceId) {
        const [result] = await pool.query(
            'INSERT IGNORE INTO favoris (user_id, annonce_id) VALUES (?, ?)',
            [userId, annonceId]
        );
        return result.insertId;
    }

    async remove(userId, annonceId) {
        await pool.query(
            'DELETE FROM favoris WHERE user_id = ? AND annonce_id = ?',
            [userId, annonceId]
        );
        return true;
    }

    async findByUserId(userId) {
        const [rows] = await pool.query(
            'SELECT annonce_id FROM favoris WHERE user_id = ?',
            [userId]
        );
        return rows.map(r => r.annonce_id);
    }
}

export default new FavorisRepository();
