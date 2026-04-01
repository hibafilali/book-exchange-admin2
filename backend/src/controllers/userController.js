import pool from '../config/db.js';

class UserController {
    // Obtenir la liste des utilisateurs
    async getAllUsers(req, res) {
        try {
            const [users] = await pool.query(`
                SELECT id, nom, prenom, email, role, status, nbEchanges, created_at
                FROM users
                ORDER BY created_at DESC
            `);
            // Format pour correspondre au front
            const formattedUsers = users.map(u => ({
                id: u.id,
                nom: u.nom,
                prenom: u.prenom,
                email: u.email,
                role: u.role,
                actif: u.status === 'ACTIF',
                date: new Date(u.created_at).toLocaleDateString('fr-FR'),
                avatar: `https://ui-avatars.com/api/?name=${u.prenom}+${u.nom}&background=random`
            }));
            res.json(formattedUsers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Créer un administrateur (ou utilisateur)
    async createUser(req, res) {
        try {
            const { nom, prenom, email, role = 'ADMIN', password = 'temp-password' } = req.body;
            // Dans un vrai projet, le mot de passe devrait être hashé avec bcrypt
            const [result] = await pool.query(
                'INSERT INTO users (nom, prenom, email, role, password, status) VALUES (?, ?, ?, ?, ?, "ACTIF")',
                [nom, prenom, email, role, password]
            );
            
            const newUser = {
                id: result.insertId,
                nom,
                prenom,
                email,
                role,
                actif: true,
                date: new Date().toLocaleDateString('fr-FR'),
                avatar: `https://ui-avatars.com/api/?name=${prenom}+${nom}&background=random`
            };
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Modifier le statut ou d'autres infos
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            // On gère spécifiquement le statut actif
            if (updates.actif !== undefined) {
                const status = updates.actif ? 'ACTIF' : 'BLOQUE';
                await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
            }
            if(updates.nom && updates.prenom && updates.email) {
                 await pool.query('UPDATE users SET nom = ?, prenom = ?, email = ? WHERE id = ?', [updates.nom, updates.prenom, updates.email, id]);
            }

            res.json({ message: 'User updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Supprimer un utilisateur
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM users WHERE id = ?', [id]);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new UserController();
