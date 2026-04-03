import pool from './backend/src/config/db.js';

async function checkH() {
    try {
        const [ads] = await pool.query(`
            SELECT a.id, o.titre, e.photoUrl
            FROM annonces a
            JOIN exemplaires e ON a.exemplaire_id = e.id
            JOIN ouvrages o ON e.ouvrage_id = o.id
            WHERE o.titre = 'holabook'
        `);
        console.log('--- HOLABOOK ADS ---');
        console.log(ads);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkH();
