import pool from './db.js';

const find = async () => {
    try {
        const [rows] = await pool.query('SELECT id FROM exemplaires LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
find();
