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
                u.id as proprietaire_id, u.nom, u.filiere, u.etablissement, u.ville, u.nbEchanges, u.avatarUrl,
                (SELECT COUNT(*) FROM transactions t JOIN annonces a2 ON t.annonce_id = a2.id WHERE a2.exemplaire_id = e.id) as transaction_count
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
                u.id as proprietaire_id, u.nom, u.filiere, u.etablissement, u.ville, u.nbEchanges, u.avatarUrl,
                (SELECT COUNT(*) FROM transactions t JOIN annonces a2 ON t.annonce_id = a2.id WHERE a2.exemplaire_id = e.id) as transaction_count
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

    async update(id, data) {
        // Update the announcement record
        const query = `
            UPDATE annonces 
            SET typeEchange = ?, prixVente = ?, description = ?, status = 'ATTENTE' 
            WHERE id = ?
        `;
        const params = [
            data.typeEchange,
            data.prixVente || 0,
            data.description || '',
            id
        ];
        
        await pool.query(query, params);

        // Also update the associated exemplaire's etat if provided
        if (data.etat && data.exemplaireId) {
            await pool.query('UPDATE exemplaires SET etat = ? WHERE id = ?', [data.etat, data.exemplaireId]);
        }

        return true;
    }

    async getMaxPrice() {
        const [rows] = await pool.query('SELECT MAX(prixVente) as maxPrice FROM annonces');
        return parseFloat(rows[0]?.maxPrice) || 0;
    }

    async createWithTransaction(data, userId) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            let exemplaireId = data.exemplaireId;

            if (!exemplaireId) {
                // 1. Insert into ouvrages
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
                const photoUrl = (data.photoUrls && data.photoUrls.length > 0) 
                    ? data.photoUrls[0] 
                    : '/uploads/default-book.png';

                const [exemplaireResult] = await connection.query(
                    'INSERT INTO exemplaires (ouvrage_id, proprietaire_id, etat, photoUrl) VALUES (?, ?, ?, ?)',
                    [ouvrageId, userId, data.etat, photoUrl]
                );
                exemplaireId = exemplaireResult.insertId;
            }

            // 3. Insert into annonces
            const status = 'ATTENTE'; // Always wait for moderation
            const datePublication = new Date();
            
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
            let bookTitleStr = data.titre;
            if (!bookTitleStr && exemplaireId) {
                const [ouvrageRows] = await connection.query('SELECT o.titre FROM exemplaires e JOIN ouvrages o ON e.ouvrage_id = o.id WHERE e.id = ?', [exemplaireId]);
                bookTitleStr = ouvrageRows[0]?.titre;
            }
            
            const notificationService = (await import('../services/notificationService.js')).default;
            notificationService.notifyAdmins(
                'Nouvelle annonce à modérer',
                `Un étudiant a publié le manuel: "${bookTitleStr || 'Inconnu'}". Merci d'examiner l'annonce.`,
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
                transactionCount: row.transaction_count || 0,
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
