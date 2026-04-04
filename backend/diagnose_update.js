import pool from './src/config/db.js';

async function testUpdate() {
    const id = 185;
    const data = {
        etat: 'BON',
        titre: 'MATHS'
    };

    console.log(`Diagnostic for ID ${id}...`);
    
    try {
        const connection = await pool.getConnection();
        console.log('Got connection.');
        
        try {
            await connection.beginTransaction();
            console.log('Transaction started.');

            const [exemplaires] = await connection.query('SELECT * FROM exemplaires WHERE id = ?', [id]);
            console.log('Exemplaire record:', exemplaires[0]);

            if (!exemplaires[0]) {
                console.log('RECORD NOT FOUND');
                return;
            }

            const [ouvragesCols] = await connection.query('SHOW COLUMNS FROM ouvrages');
            console.log('Ouvrages column names:', ouvragesCols.map(c => c.Field).join(', '));

            const [exemplaresCols] = await connection.query('SHOW COLUMNS FROM exemplaires');
            console.log('Exemplaires column names:', exemplaresCols.map(c => c.Field).join(', '));

            // Test a manual update
            const ouvrageId = exemplaires[0].ouvrage_id;
            console.log(`Targeting ouvrage_id: ${ouvrageId}`);

            await connection.query('UPDATE exemplaires SET etat = ? WHERE id = ?', ['BON', id]);
            console.log('Exemplaire update test clear.');

            await connection.query('UPDATE ouvrages SET titre = ? WHERE id = ?', ['MATHS', ouvrageId]);
            console.log('Ouvrage update test clear.');

            await connection.commit();
            console.log('Transaction committed successfully.');
        } catch (err) {
            console.error('SQL ERROR IN TRANSACTION:', err.message);
            await connection.rollback();
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('CONNECTION ERROR:', err.message);
    }
    process.exit(0);
}

testUpdate();
