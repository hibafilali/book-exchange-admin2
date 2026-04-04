import pool from '../src/config/db.js';

const migrate = async () => {
  try {
    console.log('--- STARTING COD MIGRATION ---');
    
    // Create the transactions table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        annonce_id INT NOT NULL,
        buyer_id INT NOT NULL,
        seller_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status ENUM('PENDING', 'ACCEPTED', 'MEETING_SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
        payment_method VARCHAR(50) DEFAULT 'COD',
        meeting_point VARCHAR(255),
        meeting_date DATETIME,
        confirmation_code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (annonce_id) REFERENCES annonces(id) ON DELETE CASCADE,
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('[SUCCESS] Transactions table created or already exists.');

    // Optional: Add a status to annonces to track if it's in a transaction
    // We'll check if the enum needs updating
    const [columns] = await pool.query('SHOW COLUMNS FROM annonces LIKE "status"');
    if (columns.length > 0) {
      const type = columns[0].Type;
      if (!type.includes("'EN_TRANSACTION'") && !type.includes("'VENDU'")) {
         console.log('Updating annonces.status enum...');
         // Note: MySQL 8.0+ supports adding ENUM values more easily, but for safety:
         await pool.query("ALTER TABLE annonces MODIFY COLUMN status ENUM('ACTIF', 'ATTENTE', 'EXPIREE', 'EN_TRANSACTION', 'VENDU') DEFAULT 'ACTIF'");
      }
    }

    console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Migration failed:', error);
    process.exit(1);
  }
};

migrate();
