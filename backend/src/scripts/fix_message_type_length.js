import pool from '../config/db.js';

async function fixLength() {
    try {
        console.log('--- MIGRATION: INCREASING message_type COLUMN LENGTH ---');
        
        await pool.query("ALTER TABLE messages MODIFY COLUMN message_type VARCHAR(50) NOT NULL DEFAULT 'TEXT'");
        
        console.log('--- SUCCESS: Column message_type modified to VARCHAR(50) ---');
    } catch (error) {
        console.error('--- ERROR: Migration failed ---', error);
    } finally {
        process.exit(0);
    }
}

fixLength();
