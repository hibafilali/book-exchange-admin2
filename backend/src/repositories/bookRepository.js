import pool from '../config/db.js';

class BookRepository {
    async findAll() {
        const query = `
            SELECT b.*, u.nom as owner_nom, u.filiere as owner_filiere, u.etablissement as owner_etablissement, 
                   u.ville as owner_ville, u.nbEchanges as owner_nbEchanges, u.avatarUrl as owner_avatar
            FROM books b
            LEFT JOIN users u ON b.proprietaireId = u.id
        `;
        const [rows] = await pool.query(query);
        return this._formatRows(rows);
    }

    async findById(id) {
        const query = `
            SELECT b.*, u.nom as owner_nom, u.filiere as owner_filiere, u.etablissement as owner_etablissement, 
                   u.ville as owner_ville, u.nbEchanges as owner_nbEchanges, u.avatarUrl as owner_avatar
            FROM books b
            LEFT JOIN users u ON b.proprietaireId = u.id
            WHERE b.id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0] ? this._formatRows([rows[0]])[0] : null;
    }

    async create(bookData) {
        const { 
            titreAnnonce, auteur, typeEchange, prixVente, etat, nbVues, 
            photoUrl, ville, filiere, isbn, nbOperations, datePublication, 
            description, proprietaireId 
        } = bookData;
        
        const [result] = await pool.query(
            `INSERT INTO books (
                titreAnnonce, auteur, typeEchange, prixVente, etat, nbVues, 
                photoUrl, ville, filiere, isbn, nbOperations, datePublication, 
                description, proprietaireId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                titreAnnonce, auteur, typeEchange, prixVente, etat, nbVues || 0,
                photoUrl, ville, filiere, isbn, nbOperations || 0, datePublication,
                description, proprietaireId
            ]
        );
        return result.insertId;
    }

    // internal formatter to reconstruct the nested "proprietaire" object
    _formatRows(rows) {
        return rows.map(row => {
            const { 
                owner_nom, owner_filiere, owner_etablissement, 
                owner_ville, owner_nbEchanges, owner_avatar,
                proprietaireId, ...book 
            } = row;

            return {
                ...book,
                proprietaire: {
                    id: proprietaireId,
                    nom: owner_nom,
                    filiere: owner_filiere,
                    etablissement: owner_etablissement,
                    ville: owner_ville,
                    nbEchanges: owner_nbEchanges,
                    avatar: owner_avatar
                }
            };
        });
    }
}

export default new BookRepository();
