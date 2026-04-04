import exemplaireRepository from '../repositories/exemplaireRepository.js';

class ExemplaireController {
    async getMyLibrary(req, res) {
        try {
            const userId = req.user.id;
            const library = await exemplaireRepository.findByUserId(userId);
            res.json(library);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAvailableForAd(req, res) {
        try {
            const userId = req.user.id;
            const available = await exemplaireRepository.findAvailableByUserId(userId);
            res.json(available);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async add(req, res) {
        try {
            const userId = req.user.id;
            const { ouvrage_id, etat, photoUrl } = req.body;
            const newExemplaire = await exemplaireRepository.create({
                ouvrage_id,
                proprietaire_id: userId,
                etat,
                photoUrl: photoUrl || '/uploads/default-book.png'
            });
            res.status(201).json(newExemplaire);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const existing = await exemplaireRepository.findById(id);
            
            if (!existing || existing.proprietaire_id !== userId) {
                return res.status(403).json({ error: 'Non autorisé' });
            }

            await exemplaireRepository.update(id, req.body);
            res.json({ message: 'Livre mis à jour' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const existing = await exemplaireRepository.findById(id);

            if (!existing || existing.proprietaire_id !== userId) {
                return res.status(403).json({ error: 'Non autorisé' });
            }

            await exemplaireRepository.delete(id);
            res.json({ message: 'Livre supprimé de la bibliothèque' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ExemplaireController();
