import pool from './src/config/db.js';

async function fix() {
    try {
        console.log('--- DB SCHEMA FIX ---');
        
        // 1. Categories
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                label VARCHAR(100) NOT NULL,
                icon VARCHAR(50)
            )
        `);
        console.log('- Categories table READY');

        // 2. Default Seed
        const commonCats = [
            [9, 'Médecine', 'stethoscope'],
            [10, 'Droit', 'gavel'],
            [12, 'Economie', 'trending-up'],
            [13, 'Informatique', 'code-2'],
            [14, 'Sciences', 'beaker']
        ];
        for (const [id, label, icon] of commonCats) {
            await pool.query('INSERT IGNORE INTO categories (id, label, icon) VALUES (?, ?, ?)', [id, label, icon]);
        }
        console.log('- Default categories SEEDED');

        // 3. Ouvrages
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ouvrages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titre VARCHAR(255) NOT NULL,
                auteur VARCHAR(255),
                isbn VARCHAR(50),
                categorie_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        `);
        console.log('- Ouvrages table READY');

        // 4. Exemplaires
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exemplaires (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ouvrage_id INT NOT NULL,
                proprietaire_id INT NOT NULL,
                etat ENUM('NEUF', 'BON', 'ACCEPTABLE', 'USE') NOT NULL,
                photoUrl VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ouvrage_id) REFERENCES ouvrages(id) ON DELETE CASCADE,
                FOREIGN KEY (proprietaire_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('- Exemplaires table READY');

        console.log('--- SCHEMA CONSOLIDATED SUCCESSFULLY ---');
    } catch (err) {
        console.error('FIX FAILED:', err.message);
    } finally {
        process.exit();
    }
}

fix();
