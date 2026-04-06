import pool from './backend/src/config/db.js';

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // 1. Update ENUM to include 'PRET' and 'DON'
        await pool.query("ALTER TABLE transactions MODIFY COLUMN type ENUM('ACHAT', 'ECHANGE', 'PRET', 'DON') DEFAULT 'ACHAT'");
        console.log('Updated transactions.type ENUM.');

        // 2. Add return_date for loan proposals
        const [columns] = await pool.query("SHOW COLUMNS FROM transactions LIKE 'return_date'");
        if (columns.length === 0) {
            await pool.query("ALTER TABLE transactions ADD COLUMN return_date DATE NULL AFTER meeting_date");
            console.log('Added return_date column.');
        } else {
            console.log('return_date column already exists.');
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
 export default migrate;
