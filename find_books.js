import pool from './backend/src/config/db.js';

async function checkFinal() {
    try {
        const [rows] = await pool.query(`
            SELECT a.id as ad_id, e.proprietaire_id, u.email, o.titre, a.status
            FROM annonces a
            JOIN exemplaires e ON a.exemplaire_id = e.id
            JOIN ouvrages o ON e.ouvrage_id = o.id
            JOIN users u ON e.proprietaire_id = u.id
            WHERE u.nom LIKE '%radouane%' OR u.email LIKE '%radouane%'
        `);
        console.log('--- ALL BOOKS FOR ALL RADOUANES ---');
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkFinal();
