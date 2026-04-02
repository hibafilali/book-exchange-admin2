import pool from './src/config/db.js';

async function inspectTables() {
    try {
        console.log("Checking tables...");
        const [tables] = await pool.query("SHOW TABLES");
        console.log("Tables found:", tables);

        const targetTables = ['conversations', 'messages'];
        for (const table of targetTables) {
            console.log(`\n--- Structure of table: ${table} ---`);
            try {
                const [cols] = await pool.query(`DESCRIBE ${table}`);
                console.log(cols);
            } catch (e) {
                console.error(`Error describing ${table}:`, e.message);
            }
        }
    } catch (error) {
        console.error("Database connection failed:", error.message);
    } finally {
        process.exit();
    }
}

inspectTables();
