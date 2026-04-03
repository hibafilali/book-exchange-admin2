import pool from './backend/src/config/db.js';

async function debugSQL() {
    try {
        console.log('--- TABLE: ouvrages ---');
        const [schema] = await pool.query("DESCRIBE ouvrages");
        console.table(schema);

        console.log('--- INDEXES: ouvrages ---');
        const [indexes] = await pool.query("SHOW INDEX FROM ouvrages");
        console.table(indexes.filter(i => i.Non_unique === 0));

        console.log('--- DATA CHECK: Empty ISBNs ---');
        const [emptyStrings] = await pool.query("SELECT COUNT(*) as c FROM ouvrages WHERE isbn = ''");
        console.log(`ISBN is empty string '': ${emptyStrings[0].c}`);

        const [nulls] = await pool.query("SELECT COUNT(*) as c FROM ouvrages WHERE isbn IS NULL");
        console.log(`ISBN is NULL: ${nulls[0].c}`);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

debugSQL();
