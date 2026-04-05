import pool from './db.js';

const get = async () => {
    try {
        const [rows] = await pool.query('SELECT email, password, password_hash FROM users WHERE id = 22');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
get();
