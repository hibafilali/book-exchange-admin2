import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Eye, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFavorites } from '../../context/FavoritesContext';
import { TYPE_LABELS, TYPE_COLORS, ETAT_LABELS, ETAT_COLORS } from '../../data/mockBooks';
import styles from './ManualCard.module.css';

const TYPE_CONFIG = {
    VENTE: { label: TYPE_LABELS.VENTE, gradient: 'var(--gradient-vente)', shadow: 'var(--shadow-vente)', color: TYPE_COLORS.VENTE },
    PRET: { label: TYPE_LABELS.PRET, gradient: 'var(--gradient-pret)', shadow: 'var(--shadow-pret)', color: TYPE_COLORS.PRET },
    DON: { label: TYPE_LABELS.DON, gradient: 'var(--gradient-don)', shadow: 'var(--shadow-don)', color: TYPE_COLORS.DON },
};

const ETAT_CONFIG = {
    NEUF: { label: ETAT_LABELS.NEUF, bg: ETAT_COLORS.NEUF },
    BON: { label: ETAT_LABELS.BON, bg: ETAT_COLORS.BON },
    ACCEPTABLE: { label: ETAT_LABELS.ACCEPTABLE, bg: ETAT_COLORS.ACCEPTABLE },
    USE: { label: ETAT_LABELS.USE, bg: ETAT_COLORS.USE },
};

export default function ManualCard({ annonce, onCardClick, index = 0 }) {
    const { isFavorited, toggleFavorite } = useFavorites();
    const isFav = isFavorited(annonce.id);
    const typeConf = TYPE_CONFIG[annonce.typeEchange] || TYPE_CONFIG.VENTE;
    const etatConf = ETAT_CONFIG[annonce.etat] || ETAT_CONFIG.BON;
    const isPopular = annonce.nbVues >= 150;
    const isTrusted = annonce.nbOperations >= 3;

    const priceLabel = annonce.typeEchange === 'VENTE'
        ? `${annonce.prixVente} DH`
        : annonce.typeEchange === 'DON' ? 'Gratuit' : 'Prêt';

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            style={{ '--hover-shadow': typeConf.shadow }}
            onClick={() => onCardClick?.(annonce)}
        >
            {/* Image */}
            <div className={styles.imageWrap}>
                <img src={annonce.photoUrl} alt={annonce.titreAnnonce} className={styles.image} loading="lazy" />

                {/* Type ribbon */}
                <div className={styles.typeRibbon} style={{ background: typeConf.gradient }}>
                    {typeConf.label}
                </div>

                {/* État badge */}
                <div className={styles.etatBadge} style={{ background: etatConf.bg }}>
                    {etatConf.label}
                </div>

                {/* Populaire */}
                {isPopular && <div className={styles.popularBadge}>🔥 Populaire</div>}

                {/* Price */}
                <div className={styles.priceTag} style={annonce.typeEchange === 'DON' ? { background: '#10b981' } : {}}>
                    {priceLabel}
                </div>

                {/* Favori */}
                <motion.button
                    className={`${styles.favBtn} ${isFav ? styles.favActive : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(annonce.id);
                        if (!isFav) {
                            toast.success("Ajouté à vos favoris !", { 
                                style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid #ef4444' }, 
                                iconTheme: { primary: '#ef4444', secondary: 'white' } 
                            });
                        } else {
                            toast.success("Retiré des favoris.");
                        }
                    }}
                    whileTap={{ scale: 0.8 }}
                >
                    <Heart size={16} fill={isFav ? '#ef4444' : 'none'} />
                </motion.button>
            </div>

            {/* Body */}
            <div className={styles.body}>
                <h3 className={styles.title}>{annonce.titreAnnonce}</h3>
                <p className={styles.author}>{annonce.auteur}</p>

                {isTrusted && (
                    <div className={styles.trustBadge}>
                        <ShieldCheck size={12} />
                        <span>Vérifié · {annonce.nbOperations} échanges</span>
                    </div>
                )}

                <div className={styles.meta}>
                    <span><MapPin size={13} /> {annonce.ville}</span>
                    <span><Eye size={13} /> {annonce.nbVues}</span>
                </div>
            </div>
        </motion.div>
    );
}
