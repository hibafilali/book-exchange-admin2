import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookUp, ArrowRightLeft, Gift } from 'lucide-react';
import { bookApi } from '../../api/client';
import styles from './LiveFeed.module.css';

export default function LiveFeed() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const response = await bookApi.getAll();
                const books = response.data.slice(0, 6);
                
                const dynamicActivities = books.map((b, i) => {
                    const isDon = b.typeEchange === 'DON';
                    const isVente = b.typeEchange === 'VENTE';
                    const isEchange = b.typeEchange === 'ECHANGE';
                    const Icon = isDon ? Gift : (isVente ? BookUp : ArrowRightLeft);
                    const colorClass = isDon ? styles.actionSuccess : (isVente ? styles.actionBrand : (isEchange ? styles.actionPurple : styles.actionBlue));
                    const bgIcon = isDon ? 'rgba(16, 185, 129, 0.08)' : (isVente ? 'rgba(255, 87, 34, 0.08)' : (isEchange ? 'rgba(139, 92, 246, 0.08)' : 'rgba(59, 130, 246, 0.08)'));
                    const titlePrefix = isDon ? 'Don' : (isVente ? 'Vente' : (isEchange ? 'Échange' : 'Prêt'));
                    
                    return {
                        id: b.id,
                        type: b.typeEchange,
                        title: `${titlePrefix} : ${b.exemplaire?.ouvrage?.titre || 'Manuel'}`,
                        location: b.exemplaire?.proprietaire?.ville || 'Campus',
                        time: `${(i+1) * 5} min`,
                        icon: Icon,
                        colorClass,
                        bgIcon
                    };
                });
                
                setActivities([...dynamicActivities, ...dynamicActivities]); // Double for loop
            } catch (error) {
                console.error("LiveFeed fetch error", error);
            }
        };
        fetchRecent();
    }, []);

    return (
        <section className={styles.liveFeedSection}>
            <div className={styles.liveHeader}>
                <div className={styles.liveBadge} />
                <span className={styles.liveHeaderText}>En direct du campus</span>
            </div>

            <div className={styles.marqueeContainer}>
                <motion.div 
                    className={styles.marqueeTrack}
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ 
                        duration: 35, // Slow, premium speed
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    whileHover={{ transition: { duration: 35 * 4, ease: "linear" } }} // Slow down more on hover instead of full stop for "sovereign" feel
                >
                    {activities.map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                            <div key={`${activity.id}-${index}`} className={styles.activityCard}>
                                <div 
                                    className={styles.iconWrapper} 
                                    style={{ backgroundColor: activity.bgIcon }}
                                >
                                    <Icon size={20} className={activity.colorClass} strokeWidth={2.5} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h4 className={styles.actionTitle}>{activity.title}</h4>
                                    <span className={styles.locationTime}>
                                        {activity.location} • Il y a {activity.time}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

