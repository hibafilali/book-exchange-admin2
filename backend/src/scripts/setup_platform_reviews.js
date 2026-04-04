import pool from '../config/db.js';

async function setup() {
    try {
        console.log('--- SETTING UP PLATFORM REVIEWS TABLE ---');
        const query = `
            CREATE TABLE IF NOT EXISTS platform_reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_id INT NOT NULL UNIQUE,
                user_id INT NOT NULL,
                rating INT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (transaction_id) REFERENCES transactions(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `;
        await pool.query(query);
        console.log('SUCCESS: Table platform_reviews created.');
        process.exit(0);
    } catch (error) {
        console.error('ERROR: Could not create platform_reviews table:', error);
        process.exit(1);
    }
}

setup();
