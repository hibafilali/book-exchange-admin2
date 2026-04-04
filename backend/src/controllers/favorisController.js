import favorisRepository from '../repositories/favorisRepository.js';

class FavorisController {
    async get(req, res) {
        try {
            const userId = req.user.id;
            const favoritedIds = await favorisRepository.findByUserId(userId);
            res.json(favoritedIds);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async add(req, res) {
        try {
            const userId = req.user.id;
            const { annonceId } = req.body;
            await favorisRepository.add(userId, annonceId);
            res.status(201).json({ message: 'Favori ajouté' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async remove(req, res) {
        try {
            const userId = req.user.id;
            const { annonceId } = req.params;
            await favorisRepository.remove(userId, annonceId);
            res.json({ message: 'Favori retiré' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new FavorisController();
