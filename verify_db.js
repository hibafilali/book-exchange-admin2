import pool from './backend/src/config/db.js';
import fs from 'fs';

async function verify() {
    try {
        const [rows] = await pool.query(`
            SELECT e.id, o.titre, e.proprietaire_id, a.id as ad_id, a.status 
            FROM exemplaires e
            JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN annonces a ON e.id = a.exemplaire_id
            ORDER BY e.proprietaire_id, o.titre
        `);
        fs.writeFileSync('verify_result.json', JSON.stringify(rows, null, 2));
        console.log('Done');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

verify();
