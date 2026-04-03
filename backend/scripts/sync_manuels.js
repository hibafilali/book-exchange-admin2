import manuelService from '../src/services/manuelService.js';
import pool from '../src/config/db.js';

async function runSync() {
    console.log('--- MANUAL SYNCHRONIZATION SCRIPT ---');
    try {
        const results = await manuelService.syncFromPublicDirectory();
        
        console.log('\n--- SYNC RESULTS ---');
        console.log(`- Files Scanned: ${results.scanned}`);
        console.log(`- New Entries Created: ${results.created}`);
        console.log(`- Existing Entries Skipped: ${results.skipped}`);
        console.log(`- Errors Encountered: ${results.error}`);
        console.log('---------------------\n');

        if (results.created > 0) {
            console.log('Database successfully synchronized with local assets.');
        } else {
            console.log('Database was already up-to-date.');
        }

    } catch (error) {
        console.error('CRITICAL: Sync script failed:', error.message);
    } finally {
        // Close pool for CLI script to exit
        await pool.end();
        process.exit();
    }
}

runSync();
