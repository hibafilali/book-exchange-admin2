import pool from './db.js';

const seed = async () => {
    try {
        console.log('--- Seeding Sidebar Data ---');
        const userId = 22; // radouane filali
        const exIds = [133, 129]; // Sample book exemplars

        // 1. User Stats
        console.log('Seeding user_stats...');
        await pool.query(`
            INSERT INTO user_stats (user_id, points, rank_label, reliability_index, next_rank_info)
            VALUES (?, 350, 'Membre Or', 4.90, 'Plus que 3 prêts sans retard pour le rang Platine !')
            ON DUPLICATE KEY UPDATE points=350, rank_label='Membre Or', reliability_index=4.90, next_rank_info='Plus que 3 prêts sans retard pour le rang Platine !'
        `, [userId]);

        // 2. Emprunts (Active Loans)
        console.log('Seeding emprunts...');
        await pool.query('DELETE FROM emprunts WHERE user_id = ?', [userId]);
        
        const emprunts = [
            [userId, exIds[0], 3],
            [userId, exIds[1], 12]
        ];
        for (const [uid, eid, days] of emprunts) {
            await pool.query(`
                INSERT INTO emprunts (user_id, exemplaire_id, date_retour, status)
                VALUES (?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), 'EN_COURS')
            `, [uid, eid, days]);
        }

        // 3. Leaderboard data
        console.log('Seeding other user stats for leaderboard...');
        const otherUsers = [
            { id: 28, points: 450, rank: 'Membre Platine' },
            { id: 29, points: 300, rank: 'Membre Or' },
            { id: 1, points: 125, rank: 'Membre Argent' }
        ];
        for (const u of otherUsers) {
             await pool.query(`
                INSERT INTO user_stats (user_id, points, rank_label)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE points=?, rank_label=?
            `, [u.id, u.points, u.rank, u.points, u.rank]);
        }

        // 4. Activities
        console.log('Seeding activities...');
        await pool.query('DELETE FROM activities WHERE user_id = ?', [userId]);
        
        const activities = [
            { type: 'REQUEST', title: 'Sarah M. a demandé votre livre', content: 'Systèmes d\'exploitation', hours: 2 },
            { type: 'ACCEPT', title: 'Demande de prêt acceptée par', content: 'Hiba (Intro au Droit)', days: 1 },
            { type: 'VALIDATION', title: 'Ton annonce est maintenant', content: 'VALIDÉE ✅', days: 2 },
            { type: 'RATING', title: 'Leïla K. a noté votre échange', content: '5 étoiles ⭐', days: 5 }
        ];

        for (const a of activities) {
            const timeFunc = a.hours ? `DATE_SUB(NOW(), INTERVAL ${a.hours} HOUR)` : `DATE_SUB(NOW(), INTERVAL ${a.days} DAY)`;
            await pool.query(`
                INSERT INTO activities (user_id, type, title, content, created_at)
                VALUES (?, ?, ?, ?, ${timeFunc})
            `, [userId, a.type, a.title, a.content]);
        }

        console.log('--- Seeding Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
