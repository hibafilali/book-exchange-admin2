import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    MapPin, Calendar, Star, MessageSquare, ShieldCheck, 
    Share2, Flag, Award, CheckCircle2, Package
} from 'lucide-react';
import { ALL_BOOKS } from '../../data/mockBooks';
import ManualCard from './ManualCard';
import styles from './SellerProfile.module.css';

// SELLER_ADS will be filtered below based on name

const REVIEWS = [
    { id: 1, author: 'Sara L.', rating: 5, date: 'Il y a 2 jours', text: 'Super échange. Livre conforme à la description, état neuf. Amine est très réactif !' },
    { id: 2, author: 'Omar K.', rating: 5, date: 'La semaine dernière', text: 'Parfait ! RDV à l\'heure sur le campus, rien à dire.' },
    { id: 3, author: 'Leïla B.', rating: 4, date: 'Il y a 1 mois', text: 'Bon état, livre très utile pour le S3. Merci.' }
];

export default function SellerProfile() {
    const unslugify = (slug) => {
        if (!slug) return 'Utilisateur';
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Dynamically generate user info based on id
    const name = id ? unslugify(id) : 'Utilisateur';

    // Get ads for this seller from central data (filter by owner name)
    const sellerAds = ALL_BOOKS.filter(b => b.proprietaire.nom.toLowerCase().includes(name.split(' ')[0].toLowerCase()));
    
    // Fallback if no ads found for this name: show a few recent ones
    const finalAds = sellerAds.length > 0 ? sellerAds : ALL_BOOKS.slice(0, 3);
    
    // Deterministic pseudo-randomness based on name length or chars
    const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const exchangesCount = (nameHash % 30) + 1;
    const isVerifie = exchangesCount > 5;
    const rawRating = Math.max(3.5, ((nameHash % 50) / 10)).toFixed(1);
    const rating = parseFloat(rawRating) > 5 ? 5.0 : parseFloat(rawRating) || 4.8;
    const reviewsCount = Math.floor(exchangesCount * 0.7);
    
    const SELLER_DATA = {
        name: name,
        avatar: name.charAt(0).toUpperCase(),
        ville: nameHash % 2 === 0 ? 'Casablanca' : 'Fès',
        filiere: nameHash % 3 === 0 ? 'Ingénierie Informatique' : (nameHash % 2 === 0 ? 'Médecine' : 'Droit & Gestion'),
        joined: nameHash % 2 === 0 ? 'Septembre 2024' : 'Février 2025',
        isVerifie,
        rating,
        reviewsCount,
        exchangesCount,
        responseRate: (90 + (nameHash % 10)) + '%',
        responseTime: nameHash % 2 === 0 ? '< 1 heure' : '< 1 jour',
        bio: `Salut ! Je suis ${name}. Je propose mes anciens manuels d'études. N'hésitez pas à me contacter pour toute information ! Remise en main propre privilégiée.`
    };

    return (
        <div className={styles.page}>
            {/* ====== HEADER BANNER ====== */}
            <div className={styles.headerWrap}>
                <div className={styles.coverPhoto}></div>
                
                <div className={styles.profileMetaBox}>
                    <motion.div 
                        className={styles.avatarWrap}
                        initial={{ scale: 0.8, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                    >
                        <div className={styles.avatar}>{SELLER_DATA.avatar}</div>
                        {SELLER_DATA.isVerifie && (
                            <div className={styles.verifiedBadge} title="Étudiant vérifié">
                                <ShieldCheck size={18} />
                            </div>
                        )}
                    </motion.div>

                    <div className={styles.profileInfo}>
                        <div className={styles.nameRow}>
                            <h1>{SELLER_DATA.name}</h1>
                            {SELLER_DATA.exchangesCount > 20 && (
                                <span className={styles.topSellerTag}><Award size={14} /> Top Contributeur</span>
                            )}
                        </div>
                        
                        <div className={styles.statsRow}>
                            <span className={styles.ratingBadge}>
                                <Star size={14} fill="currentColor" /> {SELLER_DATA.rating} ({SELLER_DATA.reviewsCount} avis)
                            </span>
                            <span className={styles.metaItem}><MapPin size={14} /> {SELLER_DATA.ville}</span>
                            <span className={styles.metaItem}><Calendar size={14} /> Membre depuis {SELLER_DATA.joined}</span>
                        </div>
                    </div>

                    <div className={styles.profileActions}>
                        <button className={styles.msgBtn} onClick={() => navigate('/student-dashboard/messages')}>
                            <MessageSquare size={16} /> Contacter
                        </button>
                        <div className={styles.actionButtonGroup}>
                            <button className={styles.iconBtn} title="Partager ce profil"><Share2 size={16} /></button>
                            <button className={styles.iconBtn} title="Signaler" style={{ color: '#ef4444' }}><Flag size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* ====== LEFT COLUMN : SIDEBAR ====== */}
                <div className={styles.sidebar}>
                    <div className={styles.bentoBox}>
                        <h3>À propos de {SELLER_DATA.name.split(' ')[0]}</h3>
                        <p className={styles.bio}>{SELLER_DATA.bio}</p>
                        <div className={styles.filiereTag}>{SELLER_DATA.filiere}</div>
                    </div>

                    <div className={styles.bentoBox}>
                        <h3>Statistiques</h3>
                        <div className={styles.statList}>
                            <div className={styles.statLine}>
                                <span><Package size={16} className={styles.iconBrand} /> Échanges réalisés</span>
                                <strong>{SELLER_DATA.exchangesCount}</strong>
                            </div>
                            <div className={styles.statLine}>
                                <span><CheckCircle2 size={16} className={styles.iconGreen} /> Taux de réponse</span>
                                <strong>{SELLER_DATA.responseRate}</strong>
                            </div>
                            <div className={styles.statLine}>
                                <span><MessageSquare size={16} className={styles.iconBlue} /> Temps de réponse</span>
                                <strong>{SELLER_DATA.responseTime}</strong>
                            </div>
                        </div>
                    </div>

                    <div className={styles.bentoBox}>
                        <h3>Derniers Avis ({SELLER_DATA.reviewsCount})</h3>
                        <div className={styles.reviewsList}>
                            {REVIEWS.map(r => (
                                <div key={r.id} className={styles.reviewCard}>
                                    <div className={styles.reviewHead}>
                                        <div className={styles.stars}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < r.rating ? '#f59e0b' : 'transparent'} stroke={i < r.rating ? '#f59e0b' : '#cbd5e1'} />
                                            ))}
                                        </div>
                                        <span className={styles.reviewDate}>{r.date}</span>
                                    </div>
                                    <p className={styles.reviewText}>"{r.text}"</p>
                                    <span className={styles.reviewAuthor}>— {r.author}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ====== RIGHT COLUMN : ANNONCES ACTIVES ====== */}
                <div className={styles.mainFeed}>
                    <div className={styles.sectionHeader}>
                        <h2>Annonces de {SELLER_DATA.name.split(' ')[0]} ({finalAds.length})</h2>
                    </div>

                    <div className={styles.listingsGrid}>
                        {finalAds.map((b, i) => (
                            <ManualCard key={b.id} annonce={b} index={i}
                                onCardClick={(ann) => navigate(`/student-dashboard/book/${ann.id}`)} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
