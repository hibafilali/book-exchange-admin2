import pool from './src/config/db.js';

async function fix() {
    try {
        console.log('--- Starting Notification Repair Script ---');
        
        // 1. Find problematic notifications
        const [notifications] = await pool.query(
            "SELECT * FROM notifications WHERE message LIKE '%\"undefined\"%'"
        );
        
        console.log(`Found ${notifications.length} notifications to fix.`);

        for (const notif of notifications) {
            // 2. Try to find the latest completed transaction for this user (buyer)
            const [transactions] = await pool.query(
                `SELECT o.titre 
                 FROM transactions t
                 JOIN annonces a ON t.annonce_id = a.id
                 JOIN exemplaires e ON a.exemplaire_id = e.id
                 JOIN ouvrages o ON e.ouvrage_id = o.id
                 WHERE t.buyer_id = ? AND t.status = 'COMPLETED'
                 ORDER BY t.updated_at DESC LIMIT 1`,
                [notif.user_id]
            );

            if (transactions.length > 0) {
                const realTitle = transactions[0].titre;
                const newMessage = notif.message.replace('"undefined"', `"${realTitle}"`);
                
                await pool.query(
                    "UPDATE notifications SET message = ? WHERE id = ?",
                    [newMessage, notif.id]
                );
                console.log(`Fixed Notification #${notif.id}: set title to "${realTitle}"`);
            } else {
                console.log(`Could not find matching transaction for user #${notif.user_id}`);
            }
        }

        console.log('--- Repair Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Error during repair:', error);
        process.exit(1);
    }
}

fix();
