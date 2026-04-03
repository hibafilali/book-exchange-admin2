import pool from './src/config/db.js';
import annonceService from './src/services/annonceService.js';

async function test() {
    const userId = 22; // Radouane
    const data = {
        isbn: 'DEBUG-' + Date.now(),
        titre: 'Debug Book',
        auteur: 'Debug Author',
        filiere: 'Informatique',
        niveau: 'L3',
        etat: 'BON',
        photos: [],
        ville: 'Fes',
        typeEchange: 'VENTE',
        prixVente: 99,
        description: 'Testing why it doesnt show up'
    };

    try {
        console.log('--- STARTING DEBUG PUBLISH for user 22 ---');
        const result = await annonceService.createAnnonce(data, userId);
        console.log('--- SUCCESS ---');
        console.log('New Ad Result:', JSON.stringify(result));

        console.log('--- VERIFYING RETRIEVAL ---');
        const myList = await annonceService.getAnnoncesByUserId(userId);
        console.log('Count for user 22:', myList.length);
        const found = myList.find(a => a.id === result.id);
        if (found) {
            console.log('Ad successfully found in "getAnnoncesByUserId" list!');
        } else {
            console.log('CRITICAL: Ad NOT FOUND in list for user 22 after creation!');
            // Check why
            const [checkRaw] = await pool.query('SELECT a.id, e.proprietaire_id FROM annonces a JOIN exemplaires e ON a.exemplaire_id = e.id WHERE a.id = ?', [result.id]);
            console.log('Raw DB owner of new ad:', JSON.stringify(checkRaw));
        }

    } catch (error) {
        console.error('--- ERROR ---');
        console.error(error);
    } finally {
        process.exit();
    }
}

test();
