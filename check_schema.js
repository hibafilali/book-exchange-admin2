import pool from './backend/src/config/db.js';

async function checkS() {
    try {
        const [rows] = await pool.query("DESCRIBE ouvrages");
        console.log('--- OUVRAGES COLUMNS ---');
        console.log(rows);
        
        const [indexes] = await pool.query("SHOW INDEX FROM ouvrages");
        console.log('--- OUVRAGES INDEXES ---');
        console.log(indexes);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkS();
