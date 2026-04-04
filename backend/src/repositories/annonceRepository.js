import pool from '../config/db.js';

class AnnonceRepository {
    async findAllCatalog() {
        // Fetch ALL ouvrages, even those without active ads
        const query = `
            SELECT 
                o.id as ouvrage_id, o.titre, o.auteur, o.isbn,
                a.id as annonce_id, a.typeEchange, a.prixVente, a.nbVues, a.description, a.status, a.datePublication,
                e.id as exemplaire_id, e.etat, e.photoUrl,
                c.id as categorie_id, c.label as categorie_label,
                u.id as proprietaire_id, u.nom, u.filiere, u.etablissement, u.ville, u.nbEchanges, u.avatarUrl
            FROM ouvrages o
            LEFT JOIN exemplaires e ON o.id = e.ouvrage_id
            LEFT JOIN annonces a ON e.id = a.exemplaire_id
            LEFT JOIN categories c ON o.categorie_id = c.id
            LEFT JOIN users u ON e.proprietaire_id = u.id
            WHERE a.status = 'ACTIF' OR a.status IS NULL
            ORDER BY a.datePublication DESC, o.titre ASC
        `;
        const [rows] = await pool.query(query);
        return this._formatNested(rows);
    }

    async findAll(status = null) {
        // Here we JOIN annonces with exemplaires, ouvrages, categories, and users
        let query = `
            SELECT 
                a.id as annonce_id, a.typeEchange, a.prixVente, a.nbVues, a.description, a.status, a.datePublication,
                e.id as exemplaire_id, e.etat, e.photoUrl,
                o.id as ouvrage_id, o.titre, o.auteur, o.isbn,
                c.id as categorie_id, c.label as categorie_label,
                u.id as proprietaire_id, u.nom, u.filiere, u.etablissement, u.ville, u.nbEchanges, u.avatarUrl
            FROM annonces a
            INNER JOIN exemplaires e ON a.exemplaire_id = e.id
            INNER JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN categories c ON o.categorie_id = c.id
            INNER JOIN users u ON e.proprietaire_id = u.id
        `;
        
        const params = [];
        if (status) {
            query += ' WHERE a.status = ?';
            params.push(status);
        }

        const [rows] = await pool.query(query, params);
        return this._formatNested(rows);
    }

    async findById(id) {
        const query = `
            SELECT 
                a.id as annonce_id, a.typeEchange, a.prixVente, a.nbVues, a.description, a.status, a.datePublication,
                e.id as exemplaire_id, e.etat, e.photoUrl,
                o.id as ouvrage_id, o.titre, o.auteur, o.isbn,
                c.id as categorie_id, c.label as categorie_label,
                u.id as proprietaire_id, u.nom, u.filiere, u.etablissement, u.ville, u.nbEchanges, u.avatarUrl
            FROM annonces a
            INNER JOIN exemplaires e ON a.exemplaire_id = e.id
            INNER JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN categories c ON o.categorie_id = c.id
            INNER JOIN users u ON e.proprietaire_id = u.id
            WHERE a.id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows.length > 0 ? this._formatNested(rows)[0] : null;
    }

    async findByUserId(userId) {
        const query = `
            SELECT 
                a.id as annonce_id, a.typeEchange, a.prixVente, a.nbVues, a.description, a.status, a.datePublication,
                e.id as exemplaire_id, e.etat, e.photoUrl,
                o.id as ouvrage_id, o.titre, o.auteur, o.isbn,
                c.id as categorie_id, c.label as categorie_label,
                u.id as proprietaire_id, u.nom, u.filiere, u.etablissement, u.ville, u.nbEchanges, u.avatarUrl
            FROM annonces a
            INNER JOIN exemplaires e ON a.exemplaire_id = e.id
            INNER JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN categories c ON o.categorie_id = c.id
            INNER JOIN users u ON e.proprietaire_id = u.id
            WHERE u.id = ?
            ORDER BY a.datePublication DESC
        `;
        const [rows] = await pool.query(query, [userId]);
        return this._formatNested(rows);
    }

    async updateStatus(id, status) {
        await pool.query('UPDATE annonces SET status = ? WHERE id = ?', [status, id]);
        return true;
    }

    async createWithTransaction(data, userId) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Insert into ouvrages
            // We check if it exists by ISBN first to avoid duplicates
            let ouvrageId;
            const [existingOuvrage] = await connection.query('SELECT id FROM ouvrages WHERE isbn = ? AND isbn IS NOT NULL AND isbn <> ""', [data.isbn]);
            
            if (existingOuvrage.length > 0) {
                ouvrageId = existingOuvrage[0].id;
            } else {
                const [ouvrageResult] = await connection.query(
                    'INSERT INTO ouvrages (titre, auteur, isbn) VALUES (?, ?, ?)',
                    [data.titre, data.auteur, data.isbn]
                );
                ouvrageId = ouvrageResult.insertId;
            }

            // 2. Insert into exemplaires
            // photos are passed as an array in data.photoUrls from the controller
            const photoUrl = (data.photoUrls && data.photoUrls.length > 0) 
                ? data.photoUrls[0] 
                : '/uploads/default-book.png';

            const [exemplaireResult] = await connection.query(
                'INSERT INTO exemplaires (ouvrage_id, proprietaire_id, etat, photoUrl) VALUES (?, ?, ?, ?)',
                [ouvrageId, userId, data.etat, photoUrl]
            );
            const exemplaireId = exemplaireResult.insertId;

            // 3. Insert into annonces
            const status = 'ATTENTE'; // Always wait for moderation
            const datePublication = new Date();
            
            // Format description to include duration/caution if it's a loan
            let fullDescription = data.description || '';
            if (data.typeEchange === 'PRET') {
                fullDescription = `DURÉE: ${data.dureePret || 'N/A'}\nCAUTION: ${data.caution ? data.caution + ' DH' : 'Non'}\n---\n${fullDescription}`;
            }

            const [annonceResult] = await connection.query(
                'INSERT INTO annonces (exemplaire_id, typeEchange, prixVente, description, status, datePublication) VALUES (?, ?, ?, ?, ?, ?)',
                [exemplaireId, data.typeEchange, data.prixVente || 0, fullDescription, status, datePublication]
            );

            await connection.commit();
            console.log('--- ANNONCE CREATED SUCCESSFULLY IN DB. ID:', annonceResult.insertId, '---');
            
            // 4. Notify Admins
            const notificationService = (await import('../services/notificationService.js')).default;
            notificationService.notifyAdmins(
                'Nouvelle annonce à modérer',
                `Un étudiant a publié le manuel: "${data.titre}". Merci d'examiner l'annonce.`,
                'ANNONCE'
            );

            return { id: annonceResult.insertId, status };
        } catch (error) {
            console.error('--- CREATE AD FAILED IN REPOSITORY ---', error);
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    _formatNested(rows) {
        return rows.map(row => ({
            id: row.annonce_id,
            typeEchange: row.typeEchange,
            prixVente: row.prixVente,
            nbVues: row.nbVues,
            description: row.description,
            status: row.status,
            datePublication: row.datePublication,
            exemplaire: {
                id: row.exemplaire_id,
                etat: row.etat,
                photoUrl: row.photoUrl,
                ouvrage: {
                    id: row.ouvrage_id,
                    titre: row.titre,
                    auteur: row.auteur,
                    isbn: row.isbn,
                    categorie: {
                        id: row.categorie_id,
                        label: row.categorie_label
                    }
                },
                proprietaire: {
                    id: row.proprietaire_id,
                    nom: row.nom,
                    filiere: row.filiere,
                    etablissement: row.etablissement,
                    ville: row.ville,
                    nbEchanges: row.nbEchanges,
                    avatarUrl: row.avatarUrl
                }
            }
        }));
    }
}

export default new AnnonceRepository();
