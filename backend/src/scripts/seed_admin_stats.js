import pool from '../config/db.js';

async function seedData() {
    try {
        console.log('Seeding data for Admin Dashboard Demo...');

        // 1. Seed Users (Students)
        const userCountResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "ETUDIANT"');
        const currentUserCount = userCountResult[0][0].count;
        const usersToCreate = Math.max(0, 1500 - currentUserCount);

        if (usersToCreate > 0) {
            console.log(`Creating ${usersToCreate} additional students...`);
            for (let i = 0; i < usersToCreate; i += 100) {
                const batchSize = Math.min(100, usersToCreate - i);
                const values = [];
                for (let j = 0; j < batchSize; j++) {
                    const id = currentUserCount + i + j + 1;
                    values.push([
                        `User Demo ${id}`,
                        `user${id}@demo.com`,
                        'ETUDIANT',
                        'Informatique',
                        'yTera Institute',
                        'Casablanca'
                    ]);
                }
                await pool.query('INSERT INTO users (nom, email, role, filiere, etablissement, ville) VALUES ?', [values]);
            }
        }

        // 2. Seed Annonces (Active)
        const adCountResult = await pool.query('SELECT COUNT(*) as count FROM annonces WHERE status = "ACTIF"');
        const currentAdCount = adCountResult[0][0].count;
        const adsToCreate = Math.max(0, 3210 - currentAdCount);

        if (adsToCreate > 0) {
            console.log(`Creating ${adsToCreate} additional active ads...`);
            // We need exemplaires first. Let's pick some random students.
            const [students] = await pool.query('SELECT id FROM users WHERE role = "ETUDIANT" LIMIT 100');
            const [ouvrages] = await pool.query('SELECT id FROM ouvrages LIMIT 10');
            
            if (ouvrages.length === 0) {
                // Create a dummy ouvrage if none exist
                const [res] = await pool.query('INSERT INTO ouvrages (titre, auteur) VALUES ("Livre Démo", "Auteur Démo")');
                ouvrages.push({ id: res.insertId });
            }

            for (let i = 0; i < adsToCreate; i += 100) {
                const batchSize = Math.min(100, adsToCreate - i);
                for (let j = 0; j < batchSize; j++) {
                    const studentId = students[Math.floor(Math.random() * students.length)].id;
                    const ouvrageId = ouvrages[Math.floor(Math.random() * ouvrages.length)].id;
                    
                    const [exRes] = await pool.query('INSERT INTO exemplaires (ouvrage_id, proprietaire_id, etat) VALUES (?, ?, "BON")', [ouvrageId, studentId]);
                    const exemplarId = exRes.insertId;
                    
                    await pool.query('INSERT INTO annonces (exemplaire_id, typeEchange, prixVente, status, datePublication) VALUES (?, "VENTE", 50, "ACTIF", NOW())', [exemplarId]);
                }
                console.log(`Inserted ${i + batchSize} ads...`);
            }
        }

        // 3. Seed Signalements (Last 30 days)
        console.log('Seeding recent reports...');
        const [someEx] = await pool.query('SELECT id FROM annonces LIMIT 20');
        const [someUsers] = await pool.query('SELECT id FROM users LIMIT 20');
        
        const reportValues = [];
        for (let i = 0; i < 15; i++) {
            const reporterId = someUsers[Math.floor(Math.random() * someUsers.length)].id;
            const annonceId = someEx[Math.floor(Math.random() * someEx.length)].id;
            reportValues.push([reporterId, annonceId, 'Contenu inapproprié', 'OUVERT']);
        }
        await pool.query('INSERT INTO signalements (reporter_id, annonce_id, reason, status) VALUES ?', [reportValues]);

        // 4. Seed Echanges Réussis
        console.log('Seeding successful exchanges...');
        const exchangeValues = [];
        for (let i = 0; i < 25; i++) {
            const buyerId = someUsers[Math.floor(Math.random() * someUsers.length)].id;
            const sellerId = someUsers[Math.floor(Math.random() * someUsers.length)].id;
            const annonceId = someEx[Math.floor(Math.random() * someEx.length)].id;
            exchangeValues.push([annonceId, buyerId, sellerId, 45.00]);
        }
        await pool.query('INSERT INTO echanges_reussis (annonce_id, buyer_id, seller_id, amount) VALUES ?', [exchangeValues]);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
}

seedData();
