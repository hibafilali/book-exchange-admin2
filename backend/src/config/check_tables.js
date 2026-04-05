import pool from './db.js';

const check = async () => {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        const tables = rows.map(r => Object.values(r)[0]);
        const details = {};
        for (const table of tables) {
            const [cols] = await pool.query(`DESCRIBE ${table}`);
            details[table] = cols.map(c => c.Field);
        }
        console.log(JSON.stringify(details, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
check();
