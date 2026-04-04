import transactionRepository from '../repositories/transactionRepository.js';
import annonceRepository from '../repositories/annonceRepository.js';
import exemplaireRepository from '../repositories/exemplaireRepository.js';
import notificationRepository from '../repositories/notificationRepository.js';
import pool from '../config/db.js';

class TransactionService {
    async createTransaction(data) {
        // 1. Create the transaction record
        const transaction = await transactionRepository.create({
            ...data,
            status: 'PENDING'
        });

        // 2. Update annonce status to 'EN_TRANSACTION' to hide it from catalog
        await annonceRepository.updateStatus(data.annonce_id, 'EN_TRANSACTION');

        // 3. Notify the seller
        const annonce = await annonceRepository.findById(data.annonce_id);
        const [buyer] = await pool.query('SELECT nom FROM users WHERE id = ?', [data.buyer_id]);
        const buyerName = buyer?.[0]?.nom || 'Un étudiant';
        const bookTitle = annonce?.exemplaire?.ouvrage?.titre || 'votre livre';
        
        await notificationRepository.create(
            data.seller_id,
            'Nouvelle demande d\'achat',
            `${buyerName} souhaite acheter "${bookTitle}" en espèces (COD). Veuillez consulter vos ventes.`,
            'INFO'
        );

        return transaction;
    }

    async getPurchases(buyerId) {
        return await transactionRepository.findByBuyerId(buyerId);
    }

    async getSales(sellerId) {
        return await transactionRepository.findBySellerId(sellerId);
    }

    async acceptTransaction(id, sellerId) {
        const transaction = await transactionRepository.findById(id);
        if (!transaction || transaction.seller_id !== sellerId) {
            throw new Error('Transaction non trouvée ou non autorisée');
        }

        // --- IDEMPOTENCY: Already accepted? ---
        if (transaction.status !== 'PENDING') {
            console.log(`[TransactionService] Already accepted or processed: #${id} (Status: ${transaction.status})`);
            return true; 
        }

        await transactionRepository.updateStatus(id, 'ACCEPTED');

        // Notify Buyer
        await notificationRepository.create(
            transaction.buyer_id,
            'Achat accepté',
            `Le vendeur a accepté votre demande pour la transaction #${id}. Vous pouvez maintenant convenir d'un rendez-vous.`,
            'SUCCESS'
        );

        return true;
    }

    async scheduleMeeting(id, userId, meetingPoint, meetingDate) {
        const transaction = await transactionRepository.findById(id);
        if (!transaction || (transaction.seller_id !== userId && transaction.buyer_id !== userId)) {
            throw new Error('Transaction non trouvée ou non autorisée');
        }

        await transactionRepository.updateMeeting(id, meetingPoint, meetingDate);
        await transactionRepository.updateStatus(id, 'MEETING_SCHEDULED');

        // Notify the other party
        const otherPartyId = transaction.seller_id === userId ? transaction.buyer_id : transaction.seller_id;
        await notificationRepository.create(
            otherPartyId,
            'Rendez-vous fixé',
            `Un lieu et une date ont été proposés pour la transaction #${id}: ${meetingPoint} le ${new Date(meetingDate).toLocaleString()}.`,
            'INFO'
        );

        return true;
    }

    async completeTransaction(id, userId) {
        const transaction = await transactionRepository.findById(id);
        if (!transaction || (transaction.seller_id !== userId && transaction.buyer_id !== userId)) {
            throw new Error('Transaction non trouvée ou non autorisée');
        }

        if (transaction.status === 'COMPLETED') return true;

        // 1. Mark transaction as COMPLETED
        await transactionRepository.updateStatus(id, 'COMPLETED');

        // 2. Mark announcement as VENDU
        await annonceRepository.updateStatus(transaction.annonce_id, 'VENDU');

        // 3. TRANSFER OWNERSHIP: the buyer now owns this physical copy (exemplaire)
        const annonce = await annonceRepository.findById(transaction.annonce_id);
        if (annonce && annonce.exemplaire) {
            await exemplaireRepository.updateOwner(annonce.exemplaire.id, transaction.buyer_id);
        }

        // 4. Notifications
        const message = `La transaction #${id} a été marquée comme terminée. Le livre est maintenant dans la bibliothèque de l'acheteur.`;
        await notificationRepository.create(transaction.seller_id, 'Transaction terminée', message, 'SUCCESS');
        await notificationRepository.create(transaction.buyer_id, 'Félicitations !', `Achat terminé. Le livre "${transaction.ouvrage_titre}" a été ajouté à votre bibliothèque.`, 'SUCCESS');

        return true;
    }

    async cancelTransaction(id, userId) {
        const transaction = await transactionRepository.findById(id);
        if (!transaction || (transaction.seller_id !== userId && transaction.buyer_id !== userId)) {
            throw new Error('Transaction non trouvée ou non autorisée');
        }

        if (transaction.status === 'CANCELLED') return true;

        await transactionRepository.updateStatus(id, 'CANCELLED');

        // Re-activate the Ad
        await annonceRepository.updateStatus(transaction.annonce_id, 'ACTIF');

        // Notify the other party
        const otherPartyId = transaction.seller_id === userId ? transaction.buyer_id : transaction.seller_id;
        await notificationRepository.create(
            otherPartyId,
            'Transaction annulée',
            `La transaction #${id} a été annulée par l'autre partie. L'annonce est de nouveau active.`,
            'ERROR'
        );

        return true;
    }

    async getAllTransactions() {
        return await transactionRepository.findAll();
    }

    async getHistoryByExemplaireId(exemplaireId) {
        return await transactionRepository.findByExemplaireId(exemplaireId);
    }
}

export default new TransactionService();
