import pool from './backend/src/config/db.js';
import fs from 'fs';

async function checkTables() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        const schemaInfo = {};
        
        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            const [columns] = await pool.query(`DESCRIBE ${tableName}`);
            schemaInfo[tableName] = columns;
        }
        
        fs.writeFileSync('db_structure.json', JSON.stringify(schemaInfo, null, 2));
        console.log('Successfully wrote db_structure.json');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkTables();
