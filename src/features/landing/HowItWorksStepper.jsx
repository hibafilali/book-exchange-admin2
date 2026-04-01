import React from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, BookOpen } from 'lucide-react';
import styles from './HowItWorksStepper.module.css';

const STEPS = [
    {
        id: 'search',
        title: 'Trouve ton manuel',
        desc: "Recherche par titre, filière ou module. C'est simple et rapide.",
        icon: Search,
    },
    {
        id: 'contact',
        title: 'Contacte le propriétaire',
        desc: "Discute en direct pour un prêt, un don ou un achat en toute sécurité.",
        icon: Mail,
    },
    {
        id: 'exchange',
        title: 'Échangez sur le campus',
        desc: "Remise en main propre, pas de frais de livraison. Économique et solidaire.",
        icon: BookOpen,
    }
];

export default function HowItWorksStepper({ id }) {
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.1
            }
        }
    };

    const stepVariants = {
        hidden: {
            opacity: 0,
            y: 40,
            scale: 0.9
        },
        visible: (index) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: index * 0.4 + 0.2, // Stagger effect: 0.2s, 0.6s, 1.0s
                type: 'spring',
                stiffness: 100,
                damping: 20
            }
        })
    };

    const lineVariants = {
        hidden: { scaleX: 0, scaleY: 0 },
        visible: {
            scaleX: [0, 0, 0.5, 0.5, 1, 1],
            scaleY: [0, 0, 0.5, 0.5, 1, 1],
            transition: {
                duration: 4, /* Increased duration for precise coordination */
                times: [0, 0.1, 0.35, 0.45, 0.75, 1],
                ease: "easeInOut",
                delay: 0.2
            }
        }
    };

    return (
        <section id={id} className={styles.stepperSection}>
            <motion.div
                className={styles.sectionHeader}
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h2 className={styles.sectionTitle}>Comment ça marche ?</h2>
                <div className={styles.titleUnderline} />
            </motion.div>

            <motion.div
                className={styles.stepperContainer}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {/* Progress Line */}
                <div className={styles.progressLineWrapper}>
                    <motion.div
                        className={styles.progressLineActive}
                        variants={lineVariants}
                    />
                </div>

                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <motion.div
                            key={step.id}
                            className={styles.stepItem}
                            variants={stepVariants}
                            custom={index}
                        >
                            <div className={styles.stepNumber}>0{index + 1}</div>

                            <motion.div
                                className={styles.iconCircle}
                                whileHover={{
                                    scale: 1.15,
                                    rotate: [0, -10, 10, 0],
                                    transition: { duration: 0.4 }
                                }}
                            >
                                <Icon size={24} strokeWidth={2.5} />
                            </motion.div>

                            <div className={styles.stepContent}>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
}
