import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Cpu, Scale, TrendingUp, Globe } from 'lucide-react';
import styles from './BrowseCategories.module.css';

const CATEGORIES = [
    {
        id: 'medecine',
        name: 'Médecine',
        icon: HeartPulse,
        count: '1.2k+ manuels',
        gridClass: styles.cardMedecine,
        delay: 0.1
    },
    {
        id: 'ingenierie',
        name: 'Ingénierie',
        icon: Cpu,
        count: '850+ manuels',
        gridClass: styles.cardIngenierie,
        delay: 0.2
    },
    {
        id: 'droit',
        name: 'Droit',
        icon: Scale,
        count: '620+ manuels',
        gridClass: styles.cardDroit,
        delay: 0.3
    },
    {
        id: 'economie',
        name: 'Économie',
        icon: TrendingUp,
        count: '430+ manuels',
        gridClass: styles.cardEconomie,
        delay: 0.4
    },
    {
        id: 'langues',
        name: 'Langues',
        icon: Globe,
        count: '310+ manuels',
        gridClass: styles.cardLangues,
        delay: 0.5
    }
];

export default function BrowseCategories() {
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 30,
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 20
            }
        }
    };

    const iconVariants = {
        hover: {
            scale: 1.1,
            rotate: [0, -10, 10, 0],
            transition: {
                duration: 0.4,
                ease: "easeInOut"
            }
        }
    };

    return (
        <section className={styles.categoriesSection}>
            <motion.div 
                className={styles.sectionHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className={styles.sectionTitle}>Parcourez par Filière</h2>
                <div className={styles.titleUnderline} />
            </motion.div>

            <motion.div 
                className={styles.bentoGrid}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {CATEGORIES.map((cat) => (
                    <motion.div
                        key={cat.id}
                        className={`${styles.categoryCard} ${cat.gridClass}`}
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        {/* Subtle Glow Effect */}
                        <div className={styles.cardGlow} />

                        <div className={styles.cardContent}>
                            <motion.div 
                                className={styles.iconWrapper}
                                variants={iconVariants}
                            >
                                <cat.icon size={32} strokeWidth={2.5} />
                            </motion.div>
                            
                            <h3>{cat.name}</h3>
                            <span className={styles.manualCount}>{cat.count}</span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
