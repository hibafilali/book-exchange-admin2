import transactionRepository from '../repositories/transactionRepository.js';
import annonceRepository from '../repositories/annonceRepository.js';
import exemplaireRepository from '../repositories/exemplaireRepository.js';
import notificationRepository from '../repositories/notificationRepository.js';
import pool from '../config/db.js';

class TransactionService {
    async createTransaction(data) {
        // 1. Get the announcement to check type
        const annonce = await annonceRepository.findById(data.annonce_id);
        if (!annonce) throw new Error('Annonce non trouvée');

        const isExchange = annonce.typeEchange === 'ECHANGE';
        const isLoan = annonce.typeEchange === 'PRET';
        const isDonation = annonce.typeEchange === 'DON';
        
        let type = 'ACHAT';
        if (isExchange) type = 'ECHANGE';
        else if (isLoan) type = 'PRET';
        else if (isDonation) type = 'DON';

        // 2. Create the transaction record
        const transaction = await transactionRepository.create({
            ...data,
            type,
            amount: (isExchange || isLoan || isDonation) ? 0 : data.amount,
            status: 'PENDING'
        });

        // 3. Update annonce status to 'EN_TRANSACTION' to hide it from catalog
        await annonceRepository.updateStatus(data.annonce_id, 'EN_TRANSACTION');

        // 4. Notify the seller
        const [buyer] = await pool.query('SELECT nom FROM users WHERE id = ?', [data.buyer_id]);
        const buyerName = buyer?.[0]?.nom || 'Un étudiant';
        const bookTitle = annonce?.exemplaire?.ouvrage?.titre || 'votre livre';
        
        let actionType = 'souhaite acheter';
        if (isExchange) actionType = 'souhaite échanger';
        else if (isLoan) actionType = 'souhaite emprunter';
        else if (isDonation) actionType = 'souhaite recevoir en don';

        let paymentInfo = `pour ${data.amount} DH (COD)`;
        if (isExchange) paymentInfo = 'en échange de livres à convenir';
        else if (isLoan) paymentInfo = 'pour un prêt de courte durée';
        else if (isDonation) paymentInfo = 'en cadeau';

        let notifTitle = 'Nouvelle demande d\'achat';
        if (isExchange) notifTitle = 'Nouvelle demande d\'échange';
        else if (isLoan) notifTitle = 'Nouvelle demande d\'emprunt';
        else if (isDonation) notifTitle = 'Nouvelle demande de don';

        await notificationRepository.create(
            data.seller_id,
            notifTitle,
            `${buyerName} ${actionType} "${bookTitle}" ${paymentInfo}. Veuillez consulter vos ventes.`,
            'INFO',
            '/student-dashboard?tab=sales'
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
            'SUCCESS',
            '/student-dashboard?tab=purchases'
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
        const isOtherPartyBuyer = otherPartyId === transaction.buyer_id;
        await notificationRepository.create(
            otherPartyId,
            'Rendez-vous fixé',
            `Un lieu et une date ont été proposés pour la transaction #${id}: ${meetingPoint} le ${new Date(meetingDate).toLocaleString()}.`,
            'INFO',
            `/student-dashboard?tab=${isOtherPartyBuyer ? 'purchases' : 'sales'}`
        );

        return true;
    }

    async completeTransaction(id, userId) {
        const transaction = await transactionRepository.findById(id);
        if (!transaction || (transaction.seller_id !== userId && transaction.buyer_id !== userId)) {
            throw new Error('Transaction non trouvée ou non autorisée');
        }

        if (transaction.status === 'COMPLETED') return true;

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Mark transaction as COMPLETED
            await connection.query('UPDATE transactions SET status = "COMPLETED" WHERE id = ?', [id]);

            // 2. Handle what happens next based on transaction type
            const isLoan = transaction.type === 'PRET';

            if (isLoan) {
                // FOR LOANS: Create an entry in the 'emprunts' table
                const annonce = await annonceRepository.findById(transaction.annonce_id);
                if (!annonce || !annonce.exemplaire) {
                    throw new Error('Annonce ou exemplaire introuvable pour ce prêt');
                }

                // Format return date securely
                let finalReturnDate = transaction.return_date;
                if (!finalReturnDate) {
                    finalReturnDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // Default 14 days
                }
                const formattedReturnDate = new Date(finalReturnDate).toISOString().split('T')[0];
                
                await connection.query(
                    'INSERT INTO emprunts (user_id, exemplaire_id, date_emprunt, date_retour, status) VALUES (?, ?, CURRENT_TIMESTAMP, ?, "EN_COURS")',
                    [transaction.buyer_id, annonce.exemplaire.id, formattedReturnDate]
                );
                
                // Mark announcement as ARCHIVEE
                await connection.query('UPDATE annonces SET status = "ARCHIVEE" WHERE id = ?', [transaction.annonce_id]);
            } else {
                // FOR SALES/EXCHANGES: Transfer ownership
                await connection.query('UPDATE annonces SET status = "VENDU" WHERE id = ?', [transaction.annonce_id]);
                const annonce = await annonceRepository.findById(transaction.annonce_id);
                if (annonce && annonce.exemplaire) {
                    await connection.query('UPDATE exemplaires SET proprietaire_id = ? WHERE id = ?', [transaction.buyer_id, annonce.exemplaire.id]);
                }
            }

            await connection.commit();

            // 3. Notifications (Post-transaction, non-critical if it fails but we keep it here)
            try {
                const message = isLoan 
                    ? `Le prêt du livre "${transaction.ouvrage_titre}" est maintenant actif.` 
                    : `La transaction #${id} a été marquée comme terminée. Le livre est maintenant dans la bibliothèque de l'acheteur.`;
                    
                await notificationRepository.create(
                    transaction.seller_id, 
                    isLoan ? 'Prêt activé' : 'Transaction terminée', 
                    message, 
                    'SUCCESS',
                    '/student-dashboard?tab=sales'
                );
                
                const buyerMsg = isLoan
                    ? `Vous avez maintenant emprunté "${transaction.ouvrage_titre}". N'oubliez pas de le rendre à temps !`
                    : `Achat terminé. Le livre "${transaction.ouvrage_titre}" a été ajouté à votre bibliothèque.`;
                    
                await notificationRepository.create(
                    transaction.buyer_id, 
                    isLoan ? 'Livre emprunté' : 'Félicitations !', 
                    buyerMsg, 
                    'SUCCESS',
                    '/student-dashboard?tab=purchases'
                );
            } catch (notifError) {
                console.warn('Post-transaction notification failed:', notifError.message);
            }

            return true;
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Transaction completion failed:', error);
            throw error;
        } finally {
            connection.release();
        }
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
        const isOtherPartyBuyer = otherPartyId === transaction.buyer_id;
        await notificationRepository.create(
            otherPartyId,
            'Transaction annulée',
            `La transaction #${id} a été annulée par l'autre partie. L'annonce est de nouveau active.`,
            'ERROR',
            `/student-dashboard?tab=${isOtherPartyBuyer ? 'purchases' : 'sales'}`
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
