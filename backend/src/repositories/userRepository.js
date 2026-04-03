import pool from '../config/db.js';

class UserRepository {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    async findByRole(role) {
        const [rows] = await pool.query('SELECT * FROM users WHERE role = ?', [role]);
        return rows;
    }

    async create(userData) {
        const { nom, filiere, etablissement, ville, nbEchanges, avatarUrl, email } = userData;
        const [result] = await pool.query(
            'INSERT INTO users (nom, filiere, etablissement, ville, nbEchanges, avatarUrl, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nom, filiere, etablissement, ville, nbEchanges || 0, avatarUrl, email]
        );
        return result.insertId;
    }

    async update(id, userData) {
        const { nom, filiere, etablissement, ville, nbEchanges, avatarUrl } = userData;
        await pool.query(
            'UPDATE users SET nom = ?, filiere = ?, etablissement = ?, ville = ?, nbEchanges = ?, avatarUrl = ? WHERE id = ?',
            [nom, filiere, etablissement, ville, nbEchanges, avatarUrl, id]
        );
    }
}

export default new UserRepository();
