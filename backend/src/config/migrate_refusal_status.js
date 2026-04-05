import pool from './db.js';

async function migrate() {
    console.log('--- STARTING MIGRATION: ADDING REJETEE TO STATUS ENUM ---');
    try {
        // 1. Show current status for reference
        const [current] = await pool.query('DESCRIBE annonces status');
        console.log('Current status definition:', current[0].Type);

        // 2. Perform the ALTER TABLE with exact column definition PLUS the new value
        // We include all existing values found in DESCRIBE plus any we want to add
        // Values from earlier DESCRIBE: 'ACTIF','ATTENTE','VENDU','EXPIREE','SUPPRIMEE'
        const alterQuery = `
            ALTER TABLE annonces 
            MODIFY COLUMN status ENUM('ACTIF', 'ATTENTE', 'REJETEE', 'VENDU', 'EXPIREE', 'SUPPRIMEE', 'EN_TRANSACTION') 
            DEFAULT 'ATTENTE'
        `;
        
        await pool.query(alterQuery);
        console.log('Successfully updated status ENUM to include REJETEE.');

        // 3. Verify
        const [updated] = await pool.query('DESCRIBE annonces status');
        console.log('Updated status definition:', updated[0].Type);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

migrate();
