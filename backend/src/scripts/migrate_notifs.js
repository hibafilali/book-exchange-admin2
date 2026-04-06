import pool from '../config/db.js';

async function migrate() {
    try {
        console.log('Adding target_url column to notifications...');
        await pool.query('ALTER TABLE notifications ADD COLUMN target_url VARCHAR(255) DEFAULT NULL');
        console.log('Migration successful: target_url column added.');
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_ID') {
            console.log('Column already exists, skipping.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        process.exit();
    }
}

migrate();
