import pool from './backend/src/config/db.js';

async function checkRadouaneAll() {
    try {
        const [users] = await pool.query("SELECT id, nom, email FROM users WHERE nom LIKE '%radouane%' OR email LIKE '%radouane%'");
        console.log('--- ALL RADOUANE USERS ---');
        console.log(users);

        for (const u of users) {
           console.log(`\nChecking ads for User ID: ${u.id} (${u.email})`);
           const [ads] = await pool.query(`
                SELECT a.id, o.titre, a.status, e.photoUrl
                FROM annonces a
                JOIN exemplaires e ON a.exemplaire_id = e.id
                JOIN ouvrages o ON e.ouvrage_id = o.id
                WHERE e.proprietaire_id = ?
           `, [u.id]);
           console.log(ads);
        }

        const [counts] = await pool.query(`
            SELECT u.nom, a.status, COUNT(*) as c
            FROM annonces a
            JOIN exemplaires e ON a.exemplaire_id = e.id
            JOIN users u ON e.proprietaire_id = u.id
            GROUP BY u.nom, a.status
        `);
        console.log('\n--- ALL USERS AD COUNTS ---');
        console.log(counts);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkRadouaneAll();
