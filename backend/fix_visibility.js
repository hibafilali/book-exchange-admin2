import pool from './src/config/db.js';

async function fixOrphanedExemplaires() {
    console.log('--- FIXING ORPHANED EXEMPLAIRES ---');
    try {
        // Find exemplaires that don't have an entry in the 'annonces' table
        const [orphans] = await pool.query(`
            SELECT e.id, o.titre 
            FROM exemplaires e
            JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN annonces a ON e.id = a.exemplaire_id
            WHERE a.id IS NULL
        `);

        console.log(`- Found ${orphans.length} books without active listings.`);

        for (const orphan of orphans) {
            await pool.query(
                'INSERT INTO annonces (exemplaire_id, typeEchange, prixVente, description, status, datePublication) VALUES (?, ?, ?, ?, ?, ?)',
                [orphan.id, 'VENTE', 100.00, `Automated listing for ${orphan.titre}`, 'ACTIF', new Date()]
            );
            console.log(`  + Created listing for: ${orphan.titre}`);
        }

        console.log('\n--- ALL BOOKS ARE NOW VISIBLE ---');
    } catch (err) {
        console.error('FIX FAILED:', err.message);
    } finally {
        process.exit();
    }
}

fixOrphanedExemplaires();
