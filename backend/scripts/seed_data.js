import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '92izidesratpis',
    database: process.env.DB_NAME || 'ytera_db'
};

const CATEGORIES = [
    { label: 'Informatique', icon: 'monitor' },
    { label: 'Gestion & Management', icon: 'briefcase' },
    { label: 'Économie', icon: 'trending-up' },
    { label: 'Mathématiques', icon: 'divide' },
    { label: 'Sciences & Ingénierie', icon: 'flask' },
    { label: 'Littérature & Langues', icon: 'book-open' }
];

const STUDENTS = [
    { nom: 'ALAMI', prenom: 'Fatima', email: 'fatima@ytera.ma', password: 'ytera123', filiere: 'Informatique', ville: 'Casablanca' },
    { nom: 'HASSANI', prenom: 'Yassine', email: 'yassine@ytera.ma', password: 'ytera123', filiere: 'Gestion', ville: 'Rabat' },
    { nom: 'BELKACEM', prenom: 'Kenza', email: 'kenza@ytera.ma', password: 'ytera123', filiere: 'Économie', ville: 'Marrakech' }
];

const BOOKS = [
    { titre: 'Introduction to Algorithms', auteur: 'Thomas H. Cormen', cat: 'Informatique', image: '/books/intro-algorithms.png' },
    { titre: 'System Design Interview', auteur: 'Alex Xu', cat: 'Informatique', image: '/books/system-design.png' },
    { titre: 'Le Capital au XXIe siècle', auteur: 'Thomas Piketty', cat: 'Économie', image: '/books/capital-piketty.png' },
    { titre: 'Management : l’essentiel des concepts', auteur: 'Stephen Robbins', cat: 'Gestion & Management', image: '/books/manual_engineering.png' }, // Fallback to engineering if manual_management missing
    { titre: 'Calcul Différentiel et Intégral', auteur: 'N. Piskounov', cat: 'Mathématiques', image: '/books/book2.png' },
    { titre: 'Physique de Feynman', auteur: 'Richard Feynman', cat: 'Sciences & Ingénierie', image: '/books/book7.png' },
    { titre: 'L’Étranger', auteur: 'Albert Camus', cat: 'Littérature & Langues', image: '/books/book9.png' },
    { titre: 'Clean Code', auteur: 'Robert C. Martin', cat: 'Informatique', image: '/books/clean-code.png' },
    { titre: 'Marketing Management', auteur: 'Philip Kotler', cat: 'Gestion & Management', image: '/books/book8.png' },
    { titre: 'Principles of Economics', auteur: 'N. Gregory Mankiw', cat: 'Économie', image: '/books/economics.png' }
];

async function seed() {
    let pool;
    try {
        pool = await mysql.createPool(config);
        console.log('--- Connexion établie ---');

        // 1. Insertion des Catégories
        console.log('Injection des catégories...');
        for (const cat of CATEGORIES) {
            const [exists] = await pool.query('SELECT id FROM categories WHERE label = ?', [cat.label]);
            if (exists.length === 0) {
                await pool.query('INSERT INTO categories (label, icon) VALUES (?, ?)', [cat.label, cat.icon]);
            }
        }

        // 2. Récupération des IDs de catégories
        const [catRows] = await pool.query('SELECT id, label FROM categories');
        const catMap = Object.fromEntries(catRows.map(c => [c.label, c.id]));

        // 3. Insertion des Étudiants
        console.log('Injection des nouveaux étudiants...');
        const studentIds = [];
        for (const s of STUDENTS) {
            const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [s.email]);
            if (exists.length === 0) {
                const [res] = await pool.query(
                    'INSERT INTO users (nom, prenom, email, password, role, status, filiere, ville) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [s.nom, s.prenom, s.email, s.password, 'ETUDIANT', 'ACTIF', s.filiere, s.ville]
                );
                studentIds.push(res.insertId);
            } else {
                studentIds.push(exists[0].id);
            }
        }

        // 4. Insertion des Ouvrages
        console.log('Injection des ouvrages...');
        const bookIds = [];
        for (const b of BOOKS) {
            const [exists] = await pool.query('SELECT id FROM ouvrages WHERE titre = ?', [b.titre]);
            if (exists.length === 0) {
                const [res] = await pool.query(
                    'INSERT INTO ouvrages (titre, auteur, categorie_id) VALUES (?, ?, ?)',
                    [b.titre, b.auteur, catMap[b.cat]]
                );
                bookIds.push(res.insertId);
            } else {
                bookIds.push(exists[0].id);
            }
        }

        // 5. Création des Exemplaires et Annonces (20 annonces)
        console.log('Injection des exemplaires et annonces...');
        for (let i = 0; i < 20; i++) {
            const index = Math.floor(Math.random() * bookIds.length);
            const randomBookId = bookIds[index];
            const randomBookImage = BOOKS[index].image;
            const randomStudentId = studentIds[Math.floor(Math.random() * studentIds.length)];
            const etats = ['NEUF', 'BON', 'ACCEPTABLE', 'USE'];
            const types = ['VENTE', 'PRET', 'DON'];
            const randomEtat = etats[Math.floor(Math.random() * etats.length)];
            const randomType = types[Math.floor(Math.random() * types.length)];
            const prix = randomType === 'VENTE' ? (Math.random() * (150 - 30) + 30).toFixed(2) : null;

            // Exemplaire
            const [exRes] = await pool.query(
                'INSERT INTO exemplaires (ouvrage_id, proprietaire_id, etat, photoUrl) VALUES (?, ?, ?, ?)',
                [randomBookId, randomStudentId, randomEtat, randomBookImage]
            );

            // Annonce
            await pool.query(
                'INSERT INTO annonces (exemplaire_id, typeEchange, prixVente, description, status, datePublication) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    exRes.insertId, 
                    randomType, 
                    prix, 
                    `Livre universitaire bien entretenu. Idéal pour les révisions de la filière ${STUDENTS.find(s => s.nom === STUDENTS.find(std => studentIds.indexOf(randomStudentId) !== -1)?.nom || STUDENTS[0].nom).filiere}.`,
                    'ATTENTE',
                    new Date()
                ]
            );
        }

        console.log('--- Migration terminée avec succès ! ---');
        console.log('Vous avez maintenant 3 nouveaux étudiants et 20 nouvelles annonces réelles.');
    } catch (error) {
        console.error('Erreur lors du seeding:', error);
    } finally {
        if (pool) await pool.end();
    }
}

seed();
