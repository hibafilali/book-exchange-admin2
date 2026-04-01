import pool from '../config/db.js';

class PlainteRepository {
    async create(data) {
        const query = `
            INSERT INTO plaintes (plaignant_id, sujet, type, description, preuve_url, status) 
            VALUES (?, ?, ?, ?, ?, 'OUVERT')
        `;
        const [result] = await pool.query(query, [
            data.plaignant_id, 
            data.sujet, 
            data.type, 
            data.description, 
            data.preuve_url || null
        ]);
        return result.insertId;
    }

    async findByStudentId(studentId) {
        const query = `
            SELECT * FROM plaintes 
            WHERE plaignant_id = ? 
            ORDER BY created_at DESC
        `;
        const [rows] = await pool.query(query, [studentId]);
        return rows;
    }

    async findAll() {
        const query = `
            SELECT p.*, u.nom as plaignant_nom, u.email as plaignant_email
            FROM plaintes p
            JOIN users u ON p.plaignant_id = u.id
            ORDER BY p.created_at DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    async updateStatus(id, status) {
        const query = 'UPDATE plaintes SET status = ? WHERE id = ?';
        await pool.query(query, [status, id]);
        return true;
    }
}

export default new PlainteRepository();
