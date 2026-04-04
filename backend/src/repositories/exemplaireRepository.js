import pool from '../config/db.js';

class ExemplaireRepository {
    async findByUserId(userId) {
        const query = `
            SELECT e.*, o.titre, o.auteur, o.isbn, c.label as categorie_label,
                   (SELECT status FROM annonces WHERE exemplaire_id = e.id AND status IN ('ACTIF', 'ATTENTE', 'EN_TRANSACTION') LIMIT 1) as ad_status
            FROM exemplaires e
            JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN categories c ON o.categorie_id = c.id
            WHERE e.proprietaire_id = ?
            ORDER BY e.created_at DESC
        `;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    }

    async findAvailableByUserId(userId) {
        const query = `
            SELECT e.*, o.titre, o.auteur, o.isbn
            FROM exemplaires e
            JOIN ouvrages o ON e.ouvrage_id = o.id
            LEFT JOIN (
                SELECT exemplaire_id FROM annonces WHERE status IN ('ACTIF', 'ATTENTE', 'EN_TRANSACTION')
            ) active_ads ON e.id = active_ads.exemplaire_id
            WHERE e.proprietaire_id = ? AND active_ads.exemplaire_id IS NULL
            ORDER BY o.titre ASC
        `;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM exemplaires WHERE id = ?', [id]);
        return rows[0];
    }

    async create(data) {
        const { ouvrage_id, proprietaire_id, etat, photoUrl } = data;
        const [result] = await pool.query(
            'INSERT INTO exemplaires (ouvrage_id, proprietaire_id, etat, photoUrl) VALUES (?, ?, ?, ?)',
            [ouvrage_id, proprietaire_id, etat, photoUrl]
        );
        return { id: result.insertId, ...data };
    }

    async update(id, data) {
        const { etat, photoUrl, titre, auteur, isbn } = data;
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const exemplarUpdates = [];
            const exemplarParams = [];
            
            if (etat) {
                exemplarUpdates.push('etat = ?');
                exemplarParams.push(etat);
            }
            if (photoUrl) {
                exemplarUpdates.push('photoUrl = ?');
                exemplarParams.push(photoUrl);
            }
            
            if (exemplarUpdates.length > 0) {
                exemplarParams.push(id);
                await connection.query(
                    `UPDATE exemplaires SET ${exemplarUpdates.join(', ')} WHERE id = ?`, 
                    exemplarParams
                );
            }

            const [rows] = await connection.query('SELECT ouvrage_id FROM exemplaires WHERE id = ?', [id]);
            if (rows.length === 0) throw new Error(`Exemplaire #${id} non trouvé dans la base`);
            const ouvrageId = rows[0].ouvrage_id;

            if (ouvrageId) {
                const ouvrageUpdates = [];
                const ouvrageParams = [];
                
                if (titre !== undefined && titre !== null) { ouvrageUpdates.push('titre = ?'); ouvrageParams.push(titre); }
                if (auteur !== undefined && auteur !== null) { ouvrageUpdates.push('auteur = ?'); ouvrageParams.push(auteur); }
                if (isbn !== undefined && isbn !== null) { ouvrageUpdates.push('isbn = ?'); ouvrageParams.push(isbn); }

                if (ouvrageUpdates.length > 0) {
                    ouvrageParams.push(ouvrageId);
                    await connection.query(
                        `UPDATE ouvrages SET ${ouvrageUpdates.join(', ')} WHERE id = ?`,
                        ouvrageParams
                    );
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            if (connection) await connection.rollback();
            // LOGGING TO A FILE SO WE CAN SEE IT
            import('fs').then(fs => {
                fs.appendFileSync('debug_log.txt', `[${new Date().toISOString()}] UPDATE ERROR ID ${id}: ${error.message}\n${error.stack}\n`);
            });
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async delete(id) {
        await pool.query('DELETE FROM exemplaires WHERE id = ?', [id]);
        return true;
    }

    async updateOwner(id, newOwnerId) {
        await pool.query('UPDATE exemplaires SET proprietaire_id = ? WHERE id = ?', [newOwnerId, id]);
        return true;
    }
}

export default new ExemplaireRepository();
