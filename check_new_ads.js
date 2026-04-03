import pool from './backend/src/config/db.js';

async function checkNew() {
    try {
        const [ads] = await pool.query(`
            SELECT a.id, o.titre, e.photoUrl
            FROM annonces a
            JOIN exemplaires e ON a.exemplaire_id = e.id
            JOIN ouvrages o ON e.ouvrage_id = o.id
            WHERE o.titre IN ('ouvrage', 'titre_test')
        `);
        console.log('--- NEW TEST ADS FROM DB ---');
        console.log(ads);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkNew();
