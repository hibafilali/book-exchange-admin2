import pool from './src/config/db.js';
import fs from 'fs';

async function inspectTables() {
    let output = "";
    try {
        const [tables] = await pool.query("SHOW TABLES");
        output += `Tables in Database: ${JSON.stringify(tables, null, 2)}\n`;

        for (const tableObj of tables) {
            const tableName = Object.values(tableObj)[0];
            try {
                const [cols] = await pool.query(`DESCRIBE ${tableName}`);
                output += `\nStructure of ${tableName}:\n${JSON.stringify(cols, null, 2)}\n`;
            } catch (e) {
                output += `Error describing ${tableName}: ${e.message}\n`;
            }
        }
    } catch (error) {
        output += `Error: ${error.message}\n`;
    } finally {
        fs.writeFileSync('db_diagnostic.txt', output, 'utf8');
        process.exit();
    }
}
inspectTables();
