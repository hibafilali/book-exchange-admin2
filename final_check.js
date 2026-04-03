import pool from './backend/src/config/db.js';

async function checkIds() {
    try {
        const [ads] = await pool.query("SELECT * FROM annonces ORDER BY id DESC LIMIT 5");
        console.log('--- RECENT ADS ---');
        console.log(ads);
        
        const [users] = await pool.query("SELECT * FROM users WHERE nom LIKE '%radouane%'");
        console.log('--- RADOUANE USERS ---');
        console.log(users);
        
        if (users.length > 0) {
            const [myAds] = await pool.query(`
                SELECT a.id, o.titre, u.id as user_id
                FROM annonces a
                JOIN exemplaires e ON a.exemplaire_id = e.id
                JOIN ouvrages o ON e.ouvrage_id = o.id
                JOIN users u ON e.proprietaire_id = u.id
                WHERE u.id = ?
            `, [users[0].id]);
            console.log('--- RECENT ADS FOR RADOUANE 1 ---');
            console.log(myAds);
        }

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

checkIds();
