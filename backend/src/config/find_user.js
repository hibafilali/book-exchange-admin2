import pool from './db.js';

const find = async () => {
    try {
        const [rows] = await pool.query('SELECT id, nom, prenom FROM users WHERE nom LIKE "%filali%" OR prenom LIKE "%radouane%" OR nom LIKE "%Hiba%" OR prenom LIKE "%Hiba%"');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
find();
