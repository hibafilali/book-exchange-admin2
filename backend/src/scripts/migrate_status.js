import pool from '../config/db.js';

async function migrate() {
    try {
        console.log('Starting migration to add ARCHIVEE status...');
        // Include ALL current statuses (REJETEE was missing) + new ones (ARCHIVEE)
        const sql = "ALTER TABLE annonces MODIFY COLUMN status enum('ACTIF','ATTENTE','EN_TRANSACTION','VENDU','REJETEE','EXPIREE','ARCHIVEE') DEFAULT 'ATTENTE'";
        await pool.query(sql);
        console.log('Migration successful: ARCHIVEE status added.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
