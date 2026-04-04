import { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { platformReviewApi } from '../../api/client';
import styles from './PlatformPerformance.module.css';

export default function PlatformPerformance() {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        average: 0,
        total: 0,
        breakdown: [0, 0, 0, 0, 0]
    });

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await platformReviewApi.getAdminReviews();
                const data = response.data;
                setReviews(data);
                
                // Calculate stats
                if (data.length > 0) {
                    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
                    const avg = sum / data.length;
                    const b = [0, 0, 0, 0, 0];
                    data.forEach(r => b[r.rating - 1]++);
                    
                    setStats({
                        average: avg.toFixed(1),
                        total: data.length,
                        breakdown: b.reverse() // 5 stars to 1 star
                    });
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Performance de la Plateforme</h1>
                    <p className={styles.subtitle}>Consultez les retours d'expérience et les notes des étudiants.</p>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Chargement des données...</div>
            ) : (
                <motion.div 
                    className={styles.grid}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {/* STATS OVERVIEW */}
                    <motion.div className={styles.statsCard} variants={itemVariants}>
                        <div className={styles.overallStats}>
                            <div className={styles.avgCircle}>
                                <span className={styles.avgValue}>{stats.average}</span>
                                <div className={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} size={14} fill={s <= Math.round(stats.average) ? "#f59e0b" : "none"} color="#f59e0b" />
                                    ))}
                                </div>
                                <span className={styles.totalText}>{stats.total} avis</span>
                            </div>
                            
                            <div className={styles.breakdown}>
                                {stats.breakdown.map((count, i) => {
                                    const stars = 5 - i;
                                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                    return (
                                        <div key={stars} className={styles.breakdownRow}>
                                            <span className={styles.starLabel}>{stars} <Star size={10} fill="currentColor" /></span>
                                            <div className={styles.progressBg}>
                                                <div className={styles.progressFill} style={{ width: `${percentage}%` }} />
                                            </div>
                                            <span className={styles.countLabel}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* REVIEWS LIST */}
                    <div className={styles.reviewsList}>
                        <h2 className={styles.sectionTitle}>Derniers Commentaires</h2>
                        {reviews.length === 0 ? (
                            <div className={styles.empty}>Aucun avis pour le moment.</div>
                        ) : (
                            reviews.map(review => (
                                <motion.div key={review.id} className={styles.reviewCard} variants={itemVariants}>
                                    <div className={styles.reviewHeader}>
                                        <div className={styles.userInfo}>
                                            <div className={styles.userAvatar}>{review.user_name?.charAt(0)}</div>
                                            <div>
                                                <h4 className={styles.userName}>{review.user_name}</h4>
                                                <span className={styles.userMail}>{review.user_email}</span>
                                            </div>
                                        </div>
                                        <div className={styles.reviewMeta}>
                                            <div className={styles.reviewStars}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={12} fill={s <= review.rating ? "#f59e0b" : "none"} color="#f59e0b" />
                                                ))}
                                            </div>
                                            <span className={styles.reviewDate}>
                                                <Calendar size={12} /> {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <div className={styles.commentBox}>
                                            <MessageSquare size={14} className={styles.commentIcon} />
                                            <p className={styles.commentText}>{review.comment}</p>
                                        </div>
                                    )}
                                    <div className={styles.transactionTag}>
                                        ID Transaction: #{review.transaction_id}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
