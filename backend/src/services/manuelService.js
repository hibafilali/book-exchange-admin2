import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';

class ManuelService {
    constructor() {
        this.PUBLIC_BOOKS_PATH = path.join(process.cwd(), '../public/books');
        
        // Metadata mapping for known files in public/books
        this.METADATA_MAP = {
            'clean-code.png': { titre: 'Clean Code: A Handbook of Agile Software Craftsmanship', auteur: 'Robert C. Martin', isbn: '978-0132350884', category: 'Informatique' },
            'intro-algorithms.png': { titre: 'Introduction to Algorithms', auteur: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Informatique' },
            'economics.png': { titre: 'Principles of Economics', auteur: 'N. Gregory Mankiw', isbn: '978-1305155909', category: 'Economie' },
            'design-patterns.png': { titre: 'Design Patterns: Elements of Reusable Object-Oriented Software', auteur: 'Erich Gamma', isbn: '978-0201633610', category: 'Informatique' },
            'refactoring.png': { titre: 'Refactoring: Improving the Design of Existing Code', auteur: 'Martin Fowler', isbn: '978-0134757599', category: 'Informatique' },
            'system-design.png': { titre: 'System Design Interview – An insider\'s guide', auteur: 'Alex Xu', isbn: '978-1736049112', category: 'Informatique' },
            'tdd.png': { titre: 'Test Driven Development: By Example', auteur: 'Kent Beck', isbn: '978-0321146533', category: 'Informatique' },
            'code-civil.png': { titre: 'Code Civil 2024', auteur: 'Dalloz', isbn: '978-2247225156', category: 'Droit' },
            'droit-constitutionnel.png': { titre: 'Droit constitutionnel et institutions politiques', auteur: 'Jean Gicquel', isbn: '978-2275101682', category: 'Droit' },
            'grays-anatomy.png': { titre: 'Gray\'s Anatomy: The Anatomical Basis of Clinical Practice', auteur: 'Susan Standring', isbn: '978-0702077050', category: 'Médecine' },
            'harrisons-medicine.png': { titre: 'Harrison\'s Principles of Internal Medicine', auteur: 'Jameson et al.', isbn: '978-1259644030', category: 'Médecine' },
            'capital-piketty.png': { titre: 'Le Capital au XXIe siècle', auteur: 'Thomas Piketty', isbn: '978-2021082289', category: 'Economie' }
        };
    }

    async syncFromPublicDirectory() {
        console.log(`Starting sync from ${this.PUBLIC_BOOKS_PATH}...`);
        const results = { scanned: 0, created: 0, skipped: 0, error: 0 };

        try {
            if (!fs.existsSync(this.PUBLIC_BOOKS_PATH)) {
                throw new Error(`Directory not found: ${this.PUBLIC_BOOKS_PATH}`);
            }

            const files = fs.readdirSync(this.PUBLIC_BOOKS_PATH)
                            .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
            
            results.scanned = files.length;

            // Pre-fetch categories
            const [categories] = await pool.query('SELECT id, label FROM categories');
            const categoryMap = {};
            categories.forEach(c => categoryMap[c.label] = c.id);

            for (const file of files) {
                try {
                    const metadata = this.METADATA_MAP[file] || {
                        titre: file.replace(/-/g, ' ').replace(/\.[^/.]+$/, '').replace(/\b\w/g, l => l.toUpperCase()),
                        auteur: 'Auteur Inconnu',
                        isbn: null,
                        category: 'Sciences'
                    };

                    const photoUrl = `/books/${file}`;
                    const categoryId = categoryMap[metadata.category] || categoryMap['Sciences'] || 1;

                    // Check if ouvrage already exists by photoUrl in exemplaires
                    const [existing] = await pool.query(
                        'SELECT e.id FROM exemplaires e JOIN ouvrages o ON e.ouvrage_id = o.id WHERE e.photoUrl = ?',
                        [photoUrl]
                    );

                    if (existing.length > 0) {
                        results.skipped++;
                        continue;
                    }

                    // Create Ouvrage & Exemplaire in transaction
                    const connection = await pool.getConnection();
                    await connection.beginTransaction();

                    try {
                        const [ouvrageRes] = await connection.query(
                            'INSERT INTO ouvrages (titre, auteur, isbn, categorie_id) VALUES (?, ?, ?, ?)',
                            [metadata.titre, metadata.auteur, metadata.isbn, categoryId]
                        );
                        const ouvrageId = ouvrageRes.insertId;

                        const [exemplaireRes] = await connection.query(
                            'INSERT INTO exemplaires (ouvrage_id, proprietaire_id, etat, photoUrl) VALUES (?, ?, ?, ?)',
                            [ouvrageId, 1, 'BON', photoUrl] // Default to Admin (1) and 'BON'
                        );
                        const exemplaireId = exemplaireRes.insertId;

                        // Create Annonce (Public Listing)
                        await connection.query(
                            'INSERT INTO annonces (exemplaire_id, typeEchange, prixVente, description, status, datePublication) VALUES (?, ?, ?, ?, ?, ?)',
                            [exemplaireId, 'VENTE', 100.00, `Automated listing for ${metadata.titre}`, 'ACTIF', new Date()]
                        );

                        await connection.commit();
                        results.created++;
                        console.log(`- Synced: ${metadata.titre}`);
                    } catch (innerError) {
                        await connection.rollback();
                        throw innerError;
                    } finally {
                        connection.release();
                    }
                } catch (fileError) {
                    console.error(`Error syncing file ${file}:`, fileError.message);
                    results.error++;
                }
            }

            return results;
        } catch (error) {
            console.error('Master sync failed:', error);
            throw error;
        }
    }
}

export default new ManuelService();
