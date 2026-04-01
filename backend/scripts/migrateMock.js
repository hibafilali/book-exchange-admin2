import pool from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getMockData() {
    const filePath = path.resolve(__dirname, '../../src/data/mockBooks.js');
    const module = await import('file://' + filePath.replace(/\\/g, '/'));
    return { books: module.ALL_BOOKS, categories: module.CATEGORIES };
}

async function migrate() {
    console.log('Starting Migration to UML-based normalized structure...\n');
    try {
        const data = await getMockData();
        const books = data.books;
        const categories = data.categories || [];
        
        console.log(`To migrate: ${categories.length} Categories, ${books.length} Books (Ouvrages/Exemplaires/Annonces).`);

        // 1. Migrate Categories
        const catMap = {}; // filiere/label -> cat_id
        for (const cat of categories) {
            const [existing] = await pool.query('SELECT id FROM categories WHERE label = ?', [cat.label]);
            if (existing.length === 0) {
                const [res] = await pool.query('INSERT INTO categories (label, icon) VALUES (?, ?)', [cat.label, cat.icon]);
                catMap[cat.label.toLowerCase()] = res.insertId;
                console.log(`(+) Categorie: ${cat.label}`);
            } else {
                catMap[cat.label.toLowerCase()] = existing[0].id;
            }
        }

        // 2. Loop books 
        for (const book of books) {
            const { proprietaire } = book;

            // --- USER ---
            let userId;
            const [existingUsers] = await pool.query('SELECT id FROM users WHERE nom = ?', [proprietaire.nom]);
            if (existingUsers.length > 0) {
                userId = existingUsers[0].id;
            } else {
                const [userRes] = await pool.query(
                    'INSERT INTO users (nom, email, filiere, etablissement, ville, nbEchanges) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                        proprietaire.nom, 
                        `${proprietaire.nom.replace(/\s/g,'').toLowerCase()}@mockmail.com`, 
                        proprietaire.filiere, 
                        proprietaire.etablissement, 
                        proprietaire.ville, 
                        proprietaire.nbEchanges
                    ]
                );
                userId = userRes.insertId;
                console.log(`(+) User: ${proprietaire.nom}`);
            }

            // --- OUVRAGE ---
            // Map filiere to category id loosely just to have data
            let catId = null;
            for(const [label, id] of Object.entries(catMap)) {
                if(book.filiere.toLowerCase().includes(label) || label.includes(book.filiere.toLowerCase())) {
                    catId = id; break;
                }
            }
            if(!catId && Object.keys(catMap).length > 0) catId = Object.values(catMap)[0]; // fallback

            let ouvrageId;
            const [existingOuvrage] = await pool.query('SELECT id FROM ouvrages WHERE isbn = ?', [book.isbn]);
            if(existingOuvrage.length > 0) {
                ouvrageId = existingOuvrage[0].id;
            } else {
                const [ouvRes] = await pool.query(
                    'INSERT INTO ouvrages (titre, auteur, isbn, categorie_id) VALUES (?, ?, ?, ?)',
                    [book.titreAnnonce, book.auteur, book.isbn, catId]
                );
                ouvrageId = ouvRes.insertId;
            }

            // --- EXEMPLAIRE ---
            let photo = Array.isArray(book.photos) && book.photos.length > 0 ? book.photos[0] : book.photoUrl;
            const [exRes] = await pool.query(
                `INSERT INTO exemplaires (ouvrage_id, proprietaire_id, etat, photoUrl) VALUES (?, ?, ?, ?)`,
                [ouvrageId, userId, book.etat, photo]
            );
            const exemplaireId = exRes.insertId;

            // --- ANNONCE ---
            const [annRes] = await pool.query(
                `INSERT INTO annonces (exemplaire_id, typeEchange, prixVente, nbVues, description, datePublication) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [exemplaireId, book.typeEchange, book.prixVente, book.nbVues, book.description, book.datePublication]
            );

            console.log(`(✓) Annonce Migrated: ${book.titreAnnonce} (AnnonceID: ${annRes.insertId})`);
        }

        console.log('\nMigration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
