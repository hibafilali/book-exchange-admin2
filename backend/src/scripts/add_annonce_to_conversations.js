import pool from '../config/db.js';

async function migrate() {
    try {
        console.log('--- MIGRATION: ADDING annonce_id TO conversations ---');
        
        const [rows] = await pool.query("SHOW COLUMNS FROM conversations LIKE 'annonce_id'");
        
        if (rows.length === 0) {
            await pool.query("ALTER TABLE conversations ADD COLUMN annonce_id INT NULL");
            await pool.query("ALTER TABLE conversations ADD CONSTRAINT fk_conversation_annonce FOREIGN KEY (annonce_id) REFERENCES annonces(id) ON DELETE SET NULL");
            console.log('--- SUCCESS: Column annonce_id added to conversations ---');
        } else {
            console.log('--- ALREADY EXISTS: Column annonce_id already in conversations ---');
        }
        
    } catch (error) {
        console.error('--- ERROR: Migration failed ---', error);
    } finally {
        process.exit(0);
    }
}

migrate();
