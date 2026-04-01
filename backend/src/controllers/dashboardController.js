import pool from '../config/db.js';

class DashboardController {
    async getDashboardData(req, res) {
        try {
            const userId = req.params.userId || 1; // Default to ID 1 for mock user Hiba

            // 1. Stats
            const [annonces] = await pool.query('SELECT SUM(prixVente) as gains FROM annonces a JOIN exemplaires e ON a.exemplaire_id = e.id WHERE e.proprietaire_id = ? AND a.status = "EXPIREE"', [userId]);
            const [echanges] = await pool.query('SELECT nbEchanges FROM users WHERE id = ?', [userId]);
            const stats = {
                economies: echanges[0]?.nbEchanges * 45 || 180, // estimated
                gains: annonces[0]?.gains || 85,
                livresPartages: echanges[0]?.nbEchanges || 4,
                arbresSauves: ((echanges[0]?.nbEchanges || 4) * 0.625).toFixed(1)
            };

            // 2. Actions Requises - mapped from notifications or demande_contacts in ATTENTE
            const [actionsSql] = await pool.query(`
                SELECT id, type, message, created_at 
                FROM notifications 
                WHERE user_id = ? AND is_read = false 
                ORDER BY created_at DESC LIMIT 3
            `, [userId]);
            const actions = actionsSql.map(a => ({
                id: a.id,
                type: a.type || 'DEMANDE_PRET',
                livre: 'Livre', // simplified
                avec: 'Utilisateur', // simplified
                avatar: 'U',
                temps: 'Récemment'
            }));
            // Mock fallback if empty
            const MOCK_ACTIONS = [
                 { id: 101, type: 'DEMANDE_PRET', livre: 'Algorithmes', avec: 'Sofia M.', avatar: 'S', temps: 'Il y a 30 min' },
                 { id: 102, type: 'CONFIRM_REMISE', livre: 'Macroéconomie', avec: 'Omar B.', avatar: 'O', temps: 'Il y a 2h' }
            ];

            // 3. Appointments - mapped from demande_contacts ACCEPTEE
            const MOCK_APPOINTMENTS = [
                { id: 1, livre: 'Designing Data-Intensive...', avec: 'Sophie M.', temps: 'Demain, 10:30', lieu: 'Bibliothèque (BU)', type: 'REMISE' },
                { id: 2, livre: 'Clean Code', avec: 'Anas L.', temps: 'Samedi, 14:00', lieu: 'Cafétéria Centrale', type: 'RECEPTION' }
            ];

            // 4. Wishes Radar
            const MOCK_WISHES = [
                { id: 1, titre: 'Marketing Digital', auteur: 'D. Chaffey', match: true, edition: '2023' },
                { id: 2, titre: 'Bases de Données', auteur: 'G. Gardarin', match: false, edition: 'Peu importe' }
            ];

            res.json({
                stats,
                actions: actions.length > 0 ? actions : MOCK_ACTIONS,
                appointments: MOCK_APPOINTMENTS,
                wishes: MOCK_WISHES
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new DashboardController();
