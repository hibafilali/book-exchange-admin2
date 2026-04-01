import annonceService from '../services/annonceService.js';

class AnnonceController {
    async getAll(req, res) {
        try {
            const annonces = await annonceService.getAllAnnonces();
            res.json(annonces);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const annonce = await annonceService.getAnnonceById(req.params.id);
            res.json(annonce);
        } catch (error) {
            const status = error.message === 'Annonce not found' ? 404 : 500;
            res.status(status).json({ error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await annonceService.updateStatus(id, status);
            res.json({ message: 'Status updated to ' + status });
        } catch (error) {
            const code = error.message.includes('Invalid status') ? 400 : 500;
            res.status(code).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const result = await annonceService.createAnnonce(req.body);
            res.status(201).json(result);
        } catch (error) {
            console.error('Create error:', error);
            res.status(500).json({ error: 'Failed to create the ad. Check DB logs.' });
        }
    }
}

export default new AnnonceController();
