import plainteRepository from '../repositories/plainteRepository.js';

class PlainteController {
    async create(req, res) {
        try {
            const { plaignant_id, sujet, type, description, preuve_url } = req.body;
            
            if (!plaignant_id || !sujet || !type || !description) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const insertId = await plainteRepository.create({
                plaignant_id, sujet, type, description, preuve_url
            });

            res.status(201).json({ 
                message: "Plainte submitted successfully", 
                id: insertId 
            });
        } catch (error) {
            console.error('Create plainte error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getByUserId(req, res) {
        try {
            const { userId } = req.params;
            const plaintes = await plainteRepository.findByStudentId(userId);
            res.json(plaintes);
        } catch (error) {
            console.error('Get plaintes error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const plaintes = await plainteRepository.findAll();
            res.json(plaintes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await plainteRepository.updateStatus(id, status);
            res.json({ message: "Status updated successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new PlainteController();
