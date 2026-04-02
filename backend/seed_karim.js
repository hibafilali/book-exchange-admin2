import pool from './src/config/db.js';
import convRepo from './src/repositories/conversationRepository.js';

async function seedKarim() {
    try {
        console.log("Seeding Karim Alami...");
        // 1. Identify Hiba Filali (ID 10)
        const [[hiba]] = await pool.query("SELECT id FROM users WHERE nom = 'Filali' OR prenom = 'Hiba' LIMIT 1;");
        if (!hiba) {
            console.error("Hiba Filali (ID 10) not found. Check user IDs.");
            return;
        }
        const hibaId = hiba.id;

        // 2. Create/Find Karim Alami (ID 6 - wait, ID 6 was Youssef, let's create a new one exactly named Karim Alami)
        const [karimRows] = await pool.query("SELECT id FROM users WHERE nom = 'Alami' AND prenom = 'Karim'");
        let karimId;
        if (karimRows.length === 0) {
            const [res] = await pool.query(
                "INSERT INTO users (nom, prenom, email, role, ville) VALUES ('Alami', 'Karim', 'karim.alami@example.com', 'ETUDIANT', 'Marrakech')"
            );
            karimId = res.insertId;
        } else {
            karimId = karimRows[0].id;
        }

        // 3. Create conversation between Hiba and Karim
        const cId = await convRepo.findOrCreateConversation(hibaId, karimId);

        // 4. Add some messages
        await convRepo.createMessage({
            conversationId: cId,
            senderId: karimId,
            text: "Salut Hiba ! Je t'ai mis de côté le manuel d'Algorithmique.",
            type: 'TEXT'
        });

        await convRepo.createMessage({
            conversationId: cId,
            senderId: hibaId,
            text: "Merci Karim ! On se voit quand pour l'échange ?",
            type: 'TEXT'
        });

        console.log(`Successfully seeded conversation between ${hibaId} and ${karimId} (Conv ID: ${cId})`);
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        process.exit();
    }
}

seedKarim();
