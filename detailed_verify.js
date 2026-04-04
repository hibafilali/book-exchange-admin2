import pool from './backend/src/config/db.js';
import fs from 'fs';

async function verify() {
    try {
        console.log("Checking User 22 (from screenshot titles)...");
        const [exemplaires] = await pool.query(`
            SELECT e.id, o.titre, e.proprietaire_id, a.id as ad_id, a.status as ad_status
            FROM exemplaires e
            JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN annonces a ON e.id = a.exemplaire_id
            WHERE e.proprietaire_id = 22
        `);
        
        const [transactions] = await pool.query(`
            SELECT t.id, t.buyer_id, t.seller_id, t.status, a.exemplaire_id, o.titre
            FROM transactions t
            JOIN annonces a ON t.annonce_id = a.id
            JOIN exemplaires e ON a.exemplaire_id = e.id
            JOIN ouvrages o ON e.ouvrage_id = o.id
            WHERE t.buyer_id = 22 OR t.seller_id = 22
        `);

        const result = {
            user_id: 22,
            exemplaires,
            transactions
        };

        fs.writeFileSync('detailed_verify.json', JSON.stringify(result, null, 2));
        console.log('Detailed verification file created.');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

verify();
