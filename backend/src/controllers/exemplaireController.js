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
            
            console.log(`[Controller] Starting update for id ${id} (Photo: ${!!req.file})`);

            const existing = await exemplaireRepository.findById(id);
            
            if (!existing || existing.proprietaire_id !== userId) {
                console.log(`[Controller] Auth Reject: userId=${userId}, ownerId=${existing?.proprietaire_id}`);
                return res.status(403).json({ error: 'Non autorisé' });
            }

            const data = { ...req.body };
            if (req.file) {
                data.photoUrl = `/uploads/${req.file.filename}`;
            }

            console.log(`[Controller] Applying repo.update...`);
            await exemplaireRepository.update(id, data);
            
            res.json({ message: 'Livre mis à jour' });
        } catch (error) {
            console.error('CONTROLLER ERROR:', error);
            // DIRECT LOG TO FILE SO WE CAN DEBUG NO MATTER WHAT
            import('fs').then(fs => {
                fs.appendFileSync('debug_log.txt', `[${new Date().toISOString()}] CONTROLLER ERROR ID ${req.params?.id}: ${error.message}\n${error.stack}\n`);
            });
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
