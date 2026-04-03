import pool from './backend/src/config/db.js';

async function checkIds() {
    try {
        const [users] = await pool.query("SELECT id, nom, email FROM users WHERE nom LIKE '%radouane%'");
        console.log('--- RADOUANE USERS ---');
        console.log(users);

        for (const u of users) {
             const [exemplaires] = await pool.query("SELECT id FROM exemplaires WHERE proprietaire_id = ?", [u.id]);
             console.log(`User ${u.id} has ${exemplaires.length} exemplaires.`);
             
             if (exemplaires.length > 0) {
                 const eIds = exemplaires.map(e => e.id);
                 const [annonces] = await pool.query(`SELECT id, status FROM annonces WHERE exemplaire_id IN (${eIds.join(',')})`);
                 console.log(`User ${u.id} has ${annonces.length} annonces matching those exemplaires.`);
             }
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkIds();
