import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { HandCoins, Leaf } from 'lucide-react';
import styles from './ImpactSection.module.css';

/**
 * AnimatedNumber Component
 * Smoothly animates a number from 0 to target using framer-motion's useSpring
 */
const AnimatedNumber = ({ value, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const spring = useSpring(0, {
        mass: 1,
        stiffness: 100,
        damping: 30,
    });

    const displayValue = useTransform(spring, (current) =>
        Math.floor(current).toLocaleString() + suffix
    );

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    return <motion.span ref={ref}>{displayValue}</motion.span>;
};

const ImpactSection = ({ id }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <section id={id} className={styles.container}>
            <motion.div
                className={styles.header}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={itemVariants}
            >
                <h2>L'impact <span style={{ color: '#FF5722' }}>y</span>Tera</h2>
                <p>Plus qu'une plateforme, un mouvement étudiant.</p>
                <div className={styles.titleUnderline}></div>
            </motion.div>

            <motion.div
                className={styles.grid}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
            >
                {/* Card 1: Money saved */}
                <motion.div
                    className={styles.card}
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
                >
                    <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(255, 87, 34, 0.08)' }}>
                        <HandCoins size={32} color="#ff5722" />
                    </div>
                    <div className={styles.cardNumber}>
                        <AnimatedNumber value={450} suffix=" DH" />
                    </div>
                    <p className={styles.cardLabel}>
                        Économisés en moyenne par semestre par étudiant.
                    </p>
                </motion.div>

                {/* Card 2: Books saved */}
                <motion.div
                    className={styles.card}
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.06)" }}
                >
                    <div className={styles.iconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
                        <Leaf size={32} color="#10b981" />
                    </div>
                    <div className={styles.cardNumber}>
                        <AnimatedNumber value={1000} suffix="+" />
                    </div>
                    <p className={styles.cardLabel}>
                        Livres sauvés de la destruction pour une seconde vie.
                    </p>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default ImpactSection;
