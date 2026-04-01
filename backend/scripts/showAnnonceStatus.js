import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const [rows] = await conn.query('SHOW COLUMNS FROM annonces WHERE Field="status"');
        console.log('\n\n---ENUMS---\n' + rows[0].Type + '\n----------\n');

        await conn.end();
    } catch (e) {
        console.error('Connection error: ', e);
    }
})();
