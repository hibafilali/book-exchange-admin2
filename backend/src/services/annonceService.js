import annonceRepository from '../repositories/annonceRepository.js';

class AnnonceService {
    async getAllAnnonces() {
        return await annonceRepository.findAll();
    }

    async getAnnonceById(id) {
        const annonce = await annonceRepository.findById(id);
        if (!annonce) throw new Error('Annonce not found');
        return annonce;
    }

    async updateStatus(id, status) {
        // Validate enum
        const validStatuses = ['ACTIF', 'ATTENTE', 'REJETEE', 'EXPIREE'];
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

    async createAnnonce(data) {
        // Enforce userId: 1 until global Auth is finished
        const userId = 1;
        return await annonceRepository.createWithTransaction(data, userId);
    }
}

export default new AnnonceService();
