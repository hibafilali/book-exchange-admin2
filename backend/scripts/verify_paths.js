import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
    try {
        const pool = await mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '92izidesratpis',
            database: process.env.DB_NAME || 'ytera_db'
        });

        const query = `
            SELECT 
                a.id, 
                o.titre, 
                e.photoUrl,
                a.status
            FROM annonces a
            INNER JOIN exemplaires e ON a.exemplaire_id = e.id
            INNER JOIN ouvrages o ON e.ouvrage_id = o.id
            ORDER BY a.id DESC
            LIMIT 10
        `;
        const [rows] = await pool.query(query);
        console.log('--- DATA SET CHECK ---');
        rows.forEach(r => {
            console.log(`ID: ${r.id} | Titre: ${r.titre} | PhotoUrl: ${r.photoUrl} | Status: ${r.status}`);
        });

        await pool.end();
    } catch (e) {
        console.error('Connection error: ', e);
    }
})();
