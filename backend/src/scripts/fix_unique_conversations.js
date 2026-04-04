import pool from '../config/db.js';

async function fix() {
    try {
        console.log('--- FIX: DROPPING unique_users CONSTRAINT ON conversations ---');
        
        // 1. Drop the old constraint
        try {
            await pool.query("ALTER TABLE conversations DROP INDEX unique_users");
            console.log('--- SUCCESS: Old index unique_users dropped ---');
        } catch (e) {
            console.log('--- NOTE: unique_users index may already be gone or misspelled:', e.message);
        }

        // 2. Add the new constraint that includes annonce_id
        // NOTE: Since annonce_id can be NULL, we need to be careful. 
        // In MySQL, multiple NULL values are allowed in a UNIQUE index.
        // This is actually what we want: one "general" chat per pair (NULL book), 
        // and one chat PER book.
        await pool.query("ALTER TABLE conversations ADD UNIQUE INDEX unique_conv_per_book (user1_id, user2_id, annonce_id)");
        console.log('--- SUCCESS: New index unique_conv_per_book created ---');

    } catch (error) {
        console.error('--- ERROR: Fix failed ---', error);
    } finally {
        process.exit(0);
    }
}

fix();
