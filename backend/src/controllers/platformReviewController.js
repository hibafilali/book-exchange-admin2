import platformReviewRepository from '../repositories/platformReviewRepository.js';

class PlatformReviewController {
    async createReview(req, res) {
        try {
            const { transaction_id, rating, comment } = req.body;
            const user_id = req.user.id;

            if (!transaction_id || !rating) {
                return res.status(400).json({ error: 'ID de transaction et note requis.' });
            }

            // Check if already reviewed
            const existingReview = await platformReviewRepository.findByTransactionId(transaction_id);
            if (existingReview) {
                return res.status(400).json({ error: 'Vous avez déjà noté cette transaction.' });
            }

            const review = await platformReviewRepository.create({
                transaction_id,
                user_id,
                rating,
                comment
            });

            res.status(201).json(review);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getAdminReviews(req, res) {
        try {
            const reviews = await platformReviewRepository.findAll();
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new PlatformReviewController();
