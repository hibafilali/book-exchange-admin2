import pool from './backend/src/config/db.js';

async function checkAny() {
    try {
        const [counts] = await pool.query("SELECT COUNT(*) as c FROM annonces");
        console.log(`Total ads in DB: ${counts[0].c}`);

        const [users] = await pool.query("SELECT id, nom, email FROM users ORDER BY id DESC LIMIT 5");
        console.log('--- RECENT USERS ---');
        console.log(users);
        
        const [books] = await pool.query("SELECT a.id, o.titre, u.nom FROM annonces a JOIN exemplaires e ON a.exemplaire_id = e.id JOIN ouvrages o ON e.ouvrage_id = o.id JOIN users u ON e.proprietaire_id = u.id ORDER BY a.id DESC LIMIT 5");
        console.log('--- RECENT ADS ---');
        console.log(books);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkAny();
