import pool from './db.js';

const check = async () => {
    try {
        const [rows] = await pool.query('SELECT id, nom, prenom FROM users WHERE id IN (22, 28, 29, 1)');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
check();
