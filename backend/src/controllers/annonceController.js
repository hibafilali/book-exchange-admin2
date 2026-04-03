import annonceService from '../services/annonceService.js';

class AnnonceController {
    async getAll(req, res) {
        try {
            const { status } = req.query;
            const annonces = await annonceService.getAllAnnonces(status);
            res.json(annonces);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCatalog(req, res) {
        try {
            const annonces = await annonceService.getAllCatalog();
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
            
            // SECURITY CHECK: Verify if the user still exists in the database
            const [userCheck] = await import('../config/db.js').then(({ default: pool }) => 
                pool.query('SELECT id FROM users WHERE id = ?', [userId])
            );
            
            if (userCheck.length === 0) {
                return res.status(401).json({ 
                    error: 'Account no longer exists', 
                    message: 'Votre session est liée à un compte supprimé. Veuillez vous déconnecter et vous reconnecter.' 
                });
            }
            
            // Collect file names if any were uploaded
            let photoUrls = [];
            if (req.files && req.files.length > 0) {
                photoUrls = req.files.map(f => `/uploads/${f.filename}`);
            }

            console.log('--- CREATE AD REQUEST RECEIVED ---');
            console.log('--- REQ.USER:', req.user, '---');
            console.log('--- REQ.FILES COUNT:', req.files ? req.files.length : 0, '---');
            console.log('--- REQ.BODY:', req.body, '---');

            const data = {
                titre: req.body.titre || 'Titre inconnu',
                auteur: req.body.auteur || 'Auteur inconnu',
                isbn: req.body.isbn || null,
                etat: req.body.etat || 'BON',
                typeEchange: req.body.typeEchange || 'VENTE',
                prixVente: parseFloat(req.body.prixVente) || 0,
                description: req.body.description || '',
                dureePret: req.body.dureePret || null,
                caution: parseFloat(req.body.caution) || 0,
                photoUrls
            };

            console.log('--- SANITIZED DATA:', data, '---');
            const result = await annonceService.createAnnonce(data, userId);
            res.status(201).json(result);
        } catch (error) {
            console.error('--- CREATE AD FAILED ---');
            console.error(error);
            res.status(500).json({ 
                error: 'Server Error during creation', 
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
}

export default new AnnonceController();
