import pool from '../config/db.js';

class ExemplaireRepository {
    async findByUserId(userId) {
        const query = `
            SELECT e.*, o.titre, o.auteur, o.isbn, c.label as categorie_label
            FROM exemplaires e
            JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN categories c ON o.categorie_id = c.id
            WHERE e.proprietaire_id = ?
            ORDER BY e.created_at DESC
        `;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    }

    async findAvailableByUserId(userId) {
        const query = `
            SELECT e.*, o.titre, o.auteur, o.isbn
            FROM exemplaires e
            JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN (
                SELECT exemplaire_id FROM annonces WHERE status IN ('ACTIF', 'ATTENTE', 'EN_TRANSACTION')
            ) active_ads ON e.id = active_ads.exemplaire_id
            WHERE e.proprietaire_id = ? AND active_ads.exemplaire_id IS NULL
            ORDER BY o.titre ASC
        `;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM exemplaires WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { ouvrage_id, proprietaire_id, etat, photoUrl } = data;
        const [result] = await pool.query(
            'INSERT INTO exemplaires (ouvrage_id, proprietaire_id, etat, photoUrl) VALUES (?, ?, ?, ?)',
            [ouvrage_id, proprietaire_id, etat, photoUrl]
        );
        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { etat, photoUrl } = data;
        await pool.query(
            'UPDATE exemplaires SET etat = ?, photoUrl = ? WHERE id = ?',
            [etat, photoUrl, id]
        );
        return true;
    }

    async delete(id) {
        await pool.query('DELETE FROM exemplaires WHERE id = ?', [id]);
        return true;
    }

    async updateOwner(id, newOwnerId) {
        await pool.query('UPDATE exemplaires SET proprietaire_id = ? WHERE id = ?', [newOwnerId, id]);
        return true;
    }
}

export default new ExemplaireRepository();
