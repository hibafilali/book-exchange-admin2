import pool from '../config/db.js';

async function aggressiveFix() {
    try {
        const [rows] = await pool.query("SHOW INDEX FROM conversations WHERE Non_unique = 0 AND Key_name <> 'PRIMARY'");
        console.log('--- FOUND UNIQUE INDICES ---');
        console.table(rows);

        for (const row of rows) {
            const keyName = row.Key_name;
            if (keyName === 'unique_conv_per_book') continue;
            
            console.log(`Dropping index: ${keyName}`);
            try {
                await pool.query(`ALTER TABLE conversations DROP INDEX ${keyName}`);
                console.log(`Successfully dropped ${keyName}`);
            } catch (e) {
                console.error(`Failed to drop ${keyName}:`, e.message);
            }
        }

        // Re-ensure my new one is there
        try {
            await pool.query("ALTER TABLE conversations ADD UNIQUE INDEX unique_conv_per_book (user1_id, user2_id, annonce_id)");
            console.log('--- SUCCESS: New index unique_conv_per_book ensured ---');
        } catch (e) {
            console.log('--- NOTE: unique_conv_per_book probably already exists:', e.message);
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        process.exit(0);
    }
}

aggressiveFix();
