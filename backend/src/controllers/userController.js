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

    // Obtenir le résumé pour le sidebar du dashboard
    async getUserDashboardSummary(req, res) {
        try {
            const userId = req.user.id;

            // 1. User Stats
            const [[stats]] = await pool.query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);

            // 2. Active Loans
            const [emprunts] = await pool.query(`
                SELECT e.*, o.titre, ex.photoUrl
                FROM emprunts e
                JOIN exemplaires ex ON e.exemplaire_id = ex.id
                JOIN ouvrages o ON ex.ouvrage_id = o.id
                WHERE e.user_id = ? AND e.status = 'EN_COURS'
                ORDER BY e.date_retour ASC
            `, [userId]);

            // 3. Leaderboard (Top 3)
            const [leaderboard] = await pool.query(`
                SELECT u.prenom, u.nom, us.points
                FROM user_stats us
                JOIN users u ON us.user_id = u.id
                ORDER BY us.points DESC
                LIMIT 3
            `);

            // 4. Recent Activities
            const [activities] = await pool.query(`
                SELECT * FROM activities
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT 4
            `, [userId]);

            res.json({
                user: {
                  name: req.user.name || req.user.prenom || 'Étudiant',
                  role: req.user.role
                },
                stats: stats || { 
                    points: 0, 
                    rank_label: 'Membre Argent', 
                    reliability_index: 4.0, 
                    next_rank_info: 'Commencez à échanger pour monter en rang !' 
                },
                emprunts: emprunts.map(e => ({
                    id: e.id,
                    titre: e.titre,
                    image: e.photoUrl,
                    date_retour: e.date_retour,
                    status: e.status
                })),
                leaderboard: leaderboard.map((u, index) => ({
                    id: index + 1,
                    pseudo: u.prenom || u.nom?.split(' ')[0] || 'Anonyme',
                    points: u.points,
                    rang: index + 1,
                    color: index === 0 ? '#047857' : index === 1 ? '#0369a1' : '#b45309'
                })),
                activities: activities.map(a => ({
                    id: a.id,
                    type: a.type,
                    texte: a.title,
                    livre: a.content,
                    created_at: a.created_at
                }))
            });

        } catch (error) {
            console.error('Sidebar error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new UserController();
