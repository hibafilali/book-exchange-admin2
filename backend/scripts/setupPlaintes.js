import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createTable() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    const query = `
        CREATE TABLE IF NOT EXISTS plaintes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            plaignant_id INT NOT NULL,
            sujet VARCHAR(255) NOT NULL,
            type VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            preuve_url VARCHAR(500),
            status ENUM('OUVERT', 'EN_TRAITEMENT', 'RESOLU') DEFAULT 'OUVERT',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (plaignant_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

    try {
        await conn.query(query);
        console.log('Plaintes table created successfully!');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await conn.end();
    }
}

createTable();
