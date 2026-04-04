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

            // 2. Actions Requises - mapped from pending transactions and unread notifications
            const [pendingTransactions] = await pool.query(`
                SELECT t.id, 'COD_REQUEST' as type, u.nom as avec, o.titre as livre, t.created_at
                FROM transactions t
                JOIN users u ON t.buyer_id = u.id
                JOIN annonces a ON t.annonce_id = a.id
                JOIN exemplaires e ON a.exemplaire_id = e.id
                JOIN ouvrages o ON e.ouvrage_id = o.id
                WHERE t.seller_id = ? AND t.status = 'PENDING'
                ORDER BY t.created_at DESC
            `, [userId]);

            const [notifsSql] = await pool.query(`
                SELECT id, type, message, created_at 
                FROM notifications 
                WHERE user_id = ? AND is_read = false 
                ORDER BY created_at DESC LIMIT 5
            `, [userId]);

            const actions = [
                ...pendingTransactions.map(t => ({
                    id: `trans_${t.id}`,
                    type: 'COD_REQUEST',
                    livre: t.livre,
                    avec: t.avec,
                    avatar: t.avec.charAt(0),
                    temps: 'Récemment',
                    transactionId: t.id
                })),
                ...notifsSql.map(n => ({
                    id: `notif_${n.id}`,
                    type: n.type || 'INFO',
                    livre: 'Système',
                    avec: 'yTera',
                    avatar: 'Y',
                    message: n.message,
                    temps: 'Récemment'
                }))
            ];

            // 3. Appointments - mapped from transactions with status MEETING_SCHEDULED
            const [appointmentsSql] = await pool.query(`
                SELECT t.id, o.titre as livre, u.nom as avec, t.meeting_point as lieu, t.meeting_date as temps,
                       CASE WHEN t.seller_id = ? THEN 'REMISE' ELSE 'RECEPTION' END as type
                FROM transactions t
                JOIN users u ON (CASE WHEN t.seller_id = ? THEN t.buyer_id ELSE t.seller_id END) = u.id
                JOIN annonces a ON t.annonce_id = a.id
                JOIN exemplaires e ON a.exemplaire_id = e.id
                JOIN ouvrages o ON e.ouvrage_id = o.id
                WHERE (t.seller_id = ? OR t.buyer_id = ?) AND t.status = 'MEETING_SCHEDULED'
                ORDER BY t.meeting_date ASC
            `, [userId, userId, userId, userId]);

            const appointments = appointmentsSql.map(ap => ({
                id: ap.id,
                livre: ap.livre,
                avec: ap.avec,
                temps: new Date(ap.temps).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                lieu: ap.lieu,
                type: ap.type
            }));

            const MOCK_APPOINTMENTS = [
                { id: 991, livre: 'Designing Data-Intensive...', avec: 'Sophie M.', temps: 'Demain, 10:30', lieu: 'Bibliothèque (BU)', type: 'REMISE' }
            ];

            // 4. Wishes Radar
            const MOCK_WISHES = [
                { id: 1, titre: 'Marketing Digital', auteur: 'D. Chaffey', match: true, edition: '2023' },
                { id: 2, titre: 'Bases de Données', auteur: 'G. Gardarin', match: false, edition: 'Peu importe' }
            ];

            res.json({
                stats,
                actions: actions,
                appointments: appointments.length > 0 ? appointments : MOCK_APPOINTMENTS,
                wishes: MOCK_WISHES
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new DashboardController();
