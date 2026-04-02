import pool from './src/config/db.js';
import convRepo from './src/repositories/conversationRepository.js';

async function finalFix() {
    try {
        console.log("Locating the 'bonjour' message...");
        const [[bonjour]] = await pool.query("SELECT * FROM messages WHERE message_text LIKE '%bonjour%' ORDER BY created_at DESC LIMIT 1");
        
        if (!bonjour) {
            console.error("No 'bonjour' message found. Please send a message first!");
            return;
        }

        const meId = bonjour.sender_id;
        const convWithAhmedId = bonjour.conversation_id;
        console.log(`Current user ID detected: ${meId}. Current conversation with Ahmed: ${convWithAhmedId}`);

        // 1. Identify Karim (ID 26 is the one I created, or find by name)
        const [[karim]] = await pool.query("SELECT id FROM users WHERE nom = 'Alami' AND prenom = 'Karim' LIMIT 1");
        if (!karim) {
             console.error("Karim Alami not found.");
             return;
        }
        const karimId = karim.id;

        // 2. Create/Find a SEPARATE conversation between Me and Karim
        const newConvId = await convRepo.findOrCreateConversation(meId, karimId);
        console.log(`New conversation created between Me(${meId}) and Karim(${karimId}): ${newConvId}`);

        // 3. Move any messages from Karim that were incorrectly in the Ahmed thread to the NEW Karim thread
        await pool.query(
            "UPDATE messages SET conversation_id = ? WHERE (sender_id = ?) AND (conversation_id = ?)",
            [newConvId, karimId, convWithAhmedId]
        );

        // 4. Also add a new fresh message just in case
        await convRepo.createMessage({
            conversationId: newConvId,
            senderId: karimId,
            text: "C'est Karim ! J'ai bien reçu tes derniers messages.",
            type: 'TEXT'
        });

        console.log("Karim Alami has been successfully separated into his own conversation in the database.");
    } catch (err) {
        console.error("Final fix failed:", err);
    } finally {
        process.exit();
    }
}

finalFix();
