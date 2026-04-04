import transactionService from '../services/transactionService.js';

class TransactionController {
    async create(req, res) {
        try {
            const buyer_id = req.user.id;
            const { annonce_id, seller_id, amount, meeting_point, meeting_date } = req.body;
            
            const transaction = await transactionService.createTransaction({
                annonce_id,
                buyer_id,
                seller_id,
                amount,
                meeting_point,
                meeting_date
            });
            
            res.status(201).json(transaction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPurchases(req, res) {
        try {
            const userId = req.user.id;
            const transactions = await transactionService.getPurchases(userId);
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getSales(req, res) {
        try {
            const userId = req.user.id;
            const transactions = await transactionService.getSales(userId);
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async accept(req, res) {
        try {
            const { id } = req.params;
            const sellerId = req.user.id;
            await transactionService.acceptTransaction(id, sellerId);
            res.json({ message: 'Transaction acceptée' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async schedule(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { meeting_point, meeting_date } = req.body;
            await transactionService.scheduleMeeting(id, userId, meeting_point, meeting_date);
            res.json({ message: 'Rendez-vous fixé' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async complete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await transactionService.completeTransaction(id, userId);
            res.json({ message: 'Transaction terminée' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async cancel(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await transactionService.cancelTransaction(id, userId);
            res.json({ message: 'Transaction annulée' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAdminTransactions(req, res) {
        try {
            const transactions = await transactionService.getAllTransactions();
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new TransactionController();
