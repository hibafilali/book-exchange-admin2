import pool from './db.js';

const check = async () => {
    try {
        const [u] = await pool.query('DESCRIBE users');
        const [e] = await pool.query('DESCRIBE exemplaires');
        console.log(JSON.stringify({
            users: u.map(r => r.Field),
            exemplaires: e.map(r => r.Field)
        }, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
check();
