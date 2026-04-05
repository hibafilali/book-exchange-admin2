import pool from './backend/src/config/db.js';

async function checkTables() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        console.log('Tables in database:', JSON.stringify(tables, null, 2));
        
        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            const [columns] = await pool.query(`DESCRIBE ${tableName}`);
            console.log(`\nTable: ${tableName}`);
            console.table(columns);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkTables();
