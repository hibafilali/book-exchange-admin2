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

        console.log('Connected to database...');

        // Add prenom if it does not exist
        try {
            await conn.query('ALTER TABLE users ADD COLUMN prenom VARCHAR(255) AFTER nom');
            console.log('Added column: prenom');
        } catch (e) {
            console.log('Skipped prenom... (might already exist): ' + e.message);
        }

        // Add status if it does not exist
        try {
            await conn.query('ALTER TABLE users ADD COLUMN status ENUM("ACTIF", "BLOQUE") DEFAULT "ACTIF" AFTER role');
            console.log('Added column: status');
        } catch (e) {
            console.log('Skipped status... (might already exist): ' + e.message);
        }

        // Add password column since it is missing or called password_hash
        // Our controller uses "password", so I will add a "password" column to not conflict if password_hash is used elsewhere
        try {
            await conn.query('ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER email');
            console.log('Added column: password');
        } catch (e) {
            console.log('Skipped password... (might already exist): ' + e.message);
        }

        await conn.end();
        console.log('Done!');
    } catch (e) {
        console.error('Connection error: ', e);
    }
})();
