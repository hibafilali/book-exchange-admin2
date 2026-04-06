import pool from './backend/src/config/db.js';
import fs from 'fs';

async function getSchema() {
    try {
        const [messages] = await pool.query('DESCRIBE messages');
        const schema = {
            messages
        };
        fs.writeFileSync('messages_schema.json', JSON.stringify(schema, null, 2));
        console.log('Schema dumped to messages_schema.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getSchema();
