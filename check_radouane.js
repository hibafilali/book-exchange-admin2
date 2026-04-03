import pool from './backend/src/config/db.js';

async function checkRadouane() {
    try {
        const [users] = await pool.query("SELECT * FROM users WHERE nom LIKE '%radouane%' OR prenom LIKE '%radouane%' OR email LIKE '%radouane%'");
        console.log('--- USERS MATCHING radouane ---');
        console.log(users);

        if (users.length > 0) {
            const uId = users[0].id;
            const [annonces] = await pool.query(`
                SELECT a.id as ad_id, o.titre, a.status, a.datePublication, e.photoUrl
                FROM annonces a
                JOIN exemplaires e ON a.exemplaire_id = e.id
                JOIN ouvrages o ON e.ouvrage_id = o.id
                WHERE e.proprietaire_id = ?
            `, [uId]);
            console.log('--- ANNONCES FOR USER ---');
            console.log(annonces);
        }

        const [anyBook] = await pool.query("SELECT a.id, o.titre, e.proprietaire_id, u.nom, u.email, a.status FROM annonces a JOIN exemplaires e ON a.exemplaire_id = e.id JOIN ouvrages o ON o.id = e.ouvrage_id JOIN users u ON e.proprietaire_id = u.id WHERE o.titre LIKE '%Test Driven Development%'");
        console.log('--- FINDING OWNER OF Test Driven Development ---');
        console.log(anyBook);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkRadouane();
