import pool from '../config/db.js';

async function checkSchema() {
    try {
        const [rows] = await pool.query("DESCRIBE transactions");
        console.table(rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
checkSchema();
