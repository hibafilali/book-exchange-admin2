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

    async getMy(req, res) {
        try {
            const userId = req.user.id;
            const annonces = await annonceService.getAnnoncesByUserId(userId);
            res.json(annonces);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const userId = req.user.id;
            
            // Collect file names if any were uploaded
            let photoUrls = [];
            if (req.files && req.files.length > 0) {
                photoUrls = req.files.map(f => `/uploads/${f.filename}`);
            }

            const data = {
                ...req.body,
                photoUrls
            };

            const result = await annonceService.createAnnonce(data, userId);
            res.status(201).json(result);
        } catch (error) {
            console.error('Create error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new AnnonceController();
