import pool from '../config/db.js';

class AdminController {
    /**
     * Get dashboard statistics
     * GET /api/admin/stats
     */
    async getDashboardStats(req, res) {
        try {
            // 1. All registered students
            const [userStats] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "ETUDIANT"');
            
            // 2. Online ads (Active)
            const [adStats] = await pool.query('SELECT COUNT(*) as count FROM annonces WHERE status = "ACTIF"');
            
            // 3. Recent reports (Created in last 30 days)
            const [reportStats] = await pool.query(`
                SELECT COUNT(*) as count 
                FROM signalements 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `);
            
            // 4. Successful exchanges (Validated transactions)
            const [exchangeStats] = await pool.query('SELECT COUNT(*) as count FROM echanges_reussis');
            
            // Optional: Fetch trends (mocking them as frontend expects them, but using dynamic bases if needed)
            // For now, focus on the 4 main KPIs
            
            res.json({
                activeUsers: userStats[0].count,
                onlineAds: adStats[0].count,
                recentReports: reportStats[0].count,
                successfulExchanges: exchangeStats[0].count,
                // These are for the compact chart visualizations
                trends: {
                    users: [40, 35, 50, 45, 60, 55, 70], // Could be dynamic later
                    ads: [20, 25, 22, 30, 28, 35, 40],
                    reports: [50, 40, 45, 30, 25, 20, 15],
                    exchanges: [30, 45, 40, 60, 55, 75, 70]
                }
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default new AdminController();
