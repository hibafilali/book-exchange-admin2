import { useState } from 'react';
import { Star, Send, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { platformReviewApi } from '../../api/client';
import { toast } from 'react-hot-toast';
import styles from './PlatformRatingModal.module.css';

export default function PlatformRatingModal({ transactionId, onClose }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState('rating'); // 'rating' or 'success'

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Veuillez sélectionner une note.');
            return;
        }

        setIsSubmitting(true);
        try {
            await platformReviewApi.submit({
                transaction_id: transactionId,
                rating,
                comment
            });
            setStep('success');
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (error) {
            console.error('Feedback error:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi du feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <motion.div 
                className={styles.modal}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
                <div className={styles.header}>
                    <div className={styles.iconCircle}>
                        <Star size={24} fill={step === 'success' ? '#FFD700' : 'none'} color={step === 'success' ? '#FFD700' : 'currentColor'} />
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'rating' ? (
                        <motion.div 
                            key="rating"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.content}
                        >
                            <h2>Votre avis compte !</h2>
                            <p>Comment s'est passée votre transaction sur yTera ?</p>

                            <div className={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        className={styles.starBtn}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star 
                                            size={40} 
                                            fill={star <= (hover || rating) ? '#FFD700' : 'none'} 
                                            color={star <= (hover || rating) ? '#FFD700' : '#d1d5db'}
                                            className={styles.starIcon}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className={styles.commentSection}>
                                <label><MessageSquare size={14} /> Un petit commentaire ? (optionnel)</label>
                                <textarea 
                                    placeholder="Partagez votre expérience avec nous..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    maxLength={500}
                                />
                                <span className={styles.charCount}>{comment.length}/500</span>
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.skipBtn} onClick={onClose}>Plus tard</button>
                                <button 
                                    className={styles.submitBtn} 
                                    onClick={handleSubmit}
                                    disabled={rating === 0 || isSubmitting}
                                >
                                    {isSubmitting ? 'Envoi...' : (
                                        <>Envoyer <Send size={16} /></>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={styles.successContent}
                        >
                            <div className={styles.checkMark}>✓</div>
                            <h2>Merci beaucoup !</h2>
                            <p>Votre retour nous aide à améliorer la plateforme pour toute la communauté.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
