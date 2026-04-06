import pool from './backend/src/config/db.js';
import fs from 'fs';

async function getSchema() {
    try {
        const [emprunts] = await pool.query('DESCRIBE emprunts');
        const schema = {
            emprunts
        };
        fs.writeFileSync('emprunts_schema.json', JSON.stringify(schema, null, 2));
        console.log('Schema dumped to emprunts_schema.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getSchema();
