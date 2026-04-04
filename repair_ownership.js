import pool from './backend/src/config/db.js';

async function repair() {
    try {
        console.log("Repairing ownership for completed transactions...");
        
        // 1. New2 (183) -> Buyer 27
        await pool.query('UPDATE exemplaires SET proprietaire_id = 27 WHERE id = 183');
        
        // 2. Publication (182) -> Buyer 28
        await pool.query('UPDATE exemplaires SET proprietaire_id = 28 WHERE id = 182');
        
        console.log("Database repaired successfully.");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

repair();
