import pool from '../config/db.js';

class TransactionRepository {
    async create(data) {
        const { annonce_id, buyer_id, seller_id, amount, status, payment_method, meeting_point, meeting_date } = data;
        const [result] = await pool.query(
            `INSERT INTO transactions 
            (annonce_id, buyer_id, seller_id, amount, status, payment_method, meeting_point, meeting_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [annonce_id, buyer_id, seller_id, amount, status, payment_method, meeting_point, meeting_date]
        );
        return { id: result.insertId, ...data };
    }

    async findById(id) {
        const [rows] = await pool.query(
            `SELECT t.*, 
            a.status as annonce_status,
            o.titre as ouvrage_titre,
            u_buyer.nom as buyer_name, u_seller.nom as seller_name
            FROM transactions t
            JOIN annonces a ON t.annonce_id = a.id
            JOIN exemplaires e ON a.exemplaire_id = e.id
            JOIN ouvrages o ON e.ouvrage_id = o.id
            JOIN users u_buyer ON t.buyer_id = u_buyer.id
            JOIN users u_seller ON t.seller_id = u_seller.id
            WHERE t.id = ?`,
            [id]
        );
        return rows[0];
    }

    async findByBuyerId(buyerId) {
        const [rows] = await pool.query(
            `SELECT t.*, o.titre as ouvrage_titre, e.photoUrl
            FROM transactions t
            JOIN annonces a ON t.annonce_id = a.id
            JOIN exemplaires e ON a.exemplaire_id = e.id
            JOIN ouvrages o ON e.ouvrage_id = o.id
            WHERE t.buyer_id = ?
            ORDER BY t.created_at DESC`,
            [buyerId]
        );
        return rows;
    }

    async findBySellerId(sellerId) {
        const [rows] = await pool.query(
            `SELECT t.*, o.titre as ouvrage_titre, e.photoUrl, u.nom as buyer_name
            FROM transactions t
            JOIN annonces a ON t.annonce_id = a.id
            JOIN exemplaires e ON a.exemplaire_id = e.id
            JOIN ouvrages o ON e.ouvrage_id = o.id
            JOIN users u ON t.buyer_id = u.id
            WHERE t.seller_id = ?
            ORDER BY t.created_at DESC`,
            [sellerId]
        );
        return rows;
    }

    async updateStatus(id, status) {
        await pool.query(
            'UPDATE transactions SET status = ? WHERE id = ?',
            [status, id]
        );
        return true;
    }

    async updateMeeting(id, meetingPoint, meetingDate) {
        await pool.query(
            'UPDATE transactions SET meeting_point = ?, meeting_date = ? WHERE id = ?',
            [meetingPoint, meetingDate, id]
        );
        return true;
    }

    async findAll() {
        const [rows] = await pool.query(
            `SELECT t.*, o.titre as ouvrage_titre, 
            u_buyer.nom as buyer_name, u_seller.nom as seller_name
            FROM transactions t
            JOIN annonces a ON t.annonce_id = a.id
            JOIN exemplaires e ON a.exemplaire_id = e.id
            JOIN ouvrages o ON e.ouvrage_id = o.id
            JOIN users u_buyer ON t.buyer_id = u_buyer.id
            JOIN users u_seller ON t.seller_id = u_seller.id
            ORDER BY t.created_at DESC`
        );
        return rows;
    }
}

export default new TransactionRepository();
