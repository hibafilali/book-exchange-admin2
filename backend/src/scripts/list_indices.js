import pool from '../config/db.js';

async function listIndices() {
    try {
        const [rows] = await pool.query("SHOW INDEX FROM conversations");
        console.log('--- INDICES ON conversations ---');
        console.table(rows.map(r => ({
            Table: r.Table,
            Non_unique: r.Non_unique,
            Key_name: r.Key_name,
            Column_name: r.Column_name
        })));
    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        process.exit(0);
    }
}

listIndices();
