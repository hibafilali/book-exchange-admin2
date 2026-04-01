import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    console.log('Connecting to MySQL server...');
    try {
        // Connect WITHOUT specifying a database initially
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
        });

        console.log('Connected! Creating database ytera_db if it does not exist...');
        await connection.query('CREATE DATABASE IF NOT EXISTS ytera_db;');
        console.log('Database ytera_db created or already exists.');

        // Use the newly created database
        await connection.query('USE ytera_db;');

        console.log('Reading schema_v2.sql...');
        const schemaPath = path.resolve(__dirname, '../schema_v2.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split the SQL file by semicolons to execute statements one by one
        // (mysql2 doesn't always support multiple statements in a single query by default)
        const statements = schemaSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        console.log(`Found ${statements.length} SQL statements. Executing...`);
        for (const statement of statements) {
            await connection.query(statement);
        }

        console.log('Database schema created successfully!');
        
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Failed to setup database:', error);
        process.exit(1);
    }
}

setupDatabase();
