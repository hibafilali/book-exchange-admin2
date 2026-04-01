import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createAdmin() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    const adminEmail = 'admin@ytera.ma';
    const adminPassword = 'admin'; // Vous pourrez le changer plus tard

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Supprimer l'ancien admin s'il existe pour éviter le doublon
        await conn.query('DELETE FROM users WHERE email = ?', [adminEmail]);

        await conn.query(
            'INSERT INTO users (nom, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
            ['Admin yTera', adminEmail, hashedPassword, 'ADMIN', 'ACTIF']
        );

        console.log('-----------------------------------');
        console.log('✅ Compte Administrateur créé !');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log('-----------------------------------');

    } catch (err) {
        console.error('Erreur lors de la création de l admin:', err);
    } finally {
        await conn.end();
    }
}

createAdmin();
