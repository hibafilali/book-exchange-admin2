import pool from './db.js';

const migrate = async () => {
    try {
        console.log('--- Starting Sidebar Migration ---');

        // 1. User Stats Table
        console.log('Creating user_stats table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_stats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                points INT DEFAULT 0,
                rank_label VARCHAR(50) DEFAULT 'Membre Argent',
                reliability_index DECIMAL(3,2) DEFAULT 4.50,
                next_rank_info VARCHAR(255) DEFAULT 'Plus que 5 échanges pour le rang Or !',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // 2. Emprunts Table (Loans)
        console.log('Creating emprunts table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS emprunts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                exemplaire_id INT NOT NULL,
                date_emprunt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_retour DATE NOT NULL,
                status ENUM('EN_COURS', 'RENDU', 'RETARD') DEFAULT 'EN_COURS',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (exemplaire_id) REFERENCES exemplaires(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // 3. User Activities Table
        // We Use this for the "Recent Activity" timeline to keep it separate from persistent notifications if needed.
        console.log('Creating activities table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50),
                title VARCHAR(255) NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        console.log('--- Migration Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
