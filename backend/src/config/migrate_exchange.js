import pool from './db.js';

async function migrate() {
    try {
        console.log('Updating typeEchange enum...');
        await pool.query("ALTER TABLE annonces MODIFY COLUMN typeEchange ENUM('VENTE', 'PRET', 'DON', 'ECHANGE') NOT NULL");
        console.log('Successfully updated annonces table.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
