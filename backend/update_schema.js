import pool from './src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateSchema() {
    try {
        const sqlPath = path.join(__dirname, 'admin_stats_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split SQL statements by semicolon (simple approach)
        const statements = sql.split(';').filter(s => s.trim() !== '');
        
        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await pool.query(statement);
        }
        
        console.log('Schema updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating schema:', err);
        process.exit(1);
    }
}

updateSchema();
