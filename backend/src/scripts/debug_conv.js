import pool from '../config/db.js';
import conversationRepository from '../repositories/conversationRepository.js';

async function debug() {
    try {
        console.log('--- DEBUGGING CONVERSATION START ---');
        
        // 1. Find a real announcement
        const [annonces] = await pool.query("SELECT id, exemplaire_id FROM annonces LIMIT 1");
        if (annonces.length === 0) {
            console.log("No announcements found in DB. Please seed the database.");
            process.exit(0);
        }
        const annonce = annonces[0];
        
        // 2. Find a real user that is NOT the owner of that announcement
        const [exemplaires] = await pool.query("SELECT proprietaire_id FROM exemplaires WHERE id = ?", [annonce.exemplaire_id]);
        const ownerId = exemplaires[0].proprietaire_id;
        
        const [users] = await pool.query("SELECT id FROM users WHERE id <> ? LIMIT 1", [ownerId]);
        if (users.length === 0) {
            console.log("Only one user found in DB. Need at least two for conversation.");
            process.exit(0);
        }
        const buyerId = users[0].id;

        console.log(`Searching/Creating conversation for buyer=${buyerId}, seller=${ownerId}, annonce=${annonce.id}`);
        const convId = await conversationRepository.findOrCreateConversation(buyerId, ownerId, annonce.id);
        console.log('SUCCESS, convId:', convId);

        console.log('Fetching all conversations for buyer', buyerId);
        const convs = await conversationRepository.findByUserId(buyerId);
        console.log('SUCCESS, fetched count:', convs.length);

    } catch (error) {
        console.error('--- DEBUG ERROR ---');
        console.error(error);
    } finally {
        process.exit(0);
    }
}

debug();
