import annonceRepository from '../repositories/annonceRepository.js';

class AnnonceService {
    async getAllAnnonces(status = null) {
        return await annonceRepository.findAll(status);
    }

    async getAllCatalog() {
        return await annonceRepository.findAllCatalog();
    }

    async getAnnonceById(id) {
        const annonce = await annonceRepository.findById(id);
        if (!annonce) throw new Error('Annonce not found');
        return annonce;
    }

    async updateStatus(id, status) {
        // Validate enum
        const validStatuses = ['ACTIF', 'ATTENTE', 'REJETEE', 'EXPIREE', 'VENDU', 'SUPPRIMEE', 'EN_TRANSACTION'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        
        // Retrieve annonce info before update to find the owner
        const annonce = await annonceRepository.findById(id);
        
        const result = await annonceRepository.updateStatus(id, status);

        // Notify Student
        if (annonce && annonce.exemplaire && annonce.exemplaire.proprietaire) {
            import('../repositories/notificationRepository.js').then(({ default: notificationRepository }) => {
                const userId = annonce.exemplaire.proprietaire.id;
                const titre = annonce.exemplaire.ouvrage.titre || 'Votre annonce';
                
                if (status === 'ACTIF') {
                    notificationRepository.create(userId, 'Annonce validée', `Félicitations, votre annonce pour "${titre}" a été approuvée et publiée.`, 'SUCCESS');
                } else if (status === 'REJETEE') {
                    notificationRepository.create(userId, 'Annonce refusée', `Votre annonce pour "${titre}" n'a pas été validée par la modération.`, 'ERROR');
                }
            }).catch(console.error);
        }

        return result;
    }

    async getAnnoncesByUserId(userId) {
        return await annonceRepository.findByUserId(userId);
    }

    async createAnnonce(data, userId) {
        if (!userId) throw new Error('User ID is required');
        return await annonceRepository.createWithTransaction(data, userId);
    }

    async deleteAnnonce(id) {
        return await annonceRepository.updateStatus(id, 'SUPPRIMEE');
    }

    async getMaxPrice() {
        return await annonceRepository.getMaxPrice();
    }
}

export default new AnnonceService();
