import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Heart, Share2, MapPin, GraduationCap, Building2,
    BookOpen, Hash, Layers, Send, X, Eye, ShieldCheck, Star,
    ChevronLeft, ChevronRight, MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ALL_BOOKS, TYPE_COLORS, ETAT_LABELS, ETAT_COLORS } from '../../data/mockBooks';
import ManualCard from './ManualCard';
import styles from './BookDetails.module.css';

const TYPE_CONFIG = {
    VENTE: { label: 'Vente', gradient: 'var(--gradient-vente)', color: TYPE_COLORS.VENTE },
    PRET: { label: 'Prêt', gradient: 'var(--gradient-pret)', color: TYPE_COLORS.PRET },
    DON: { label: 'Don', gradient: 'var(--gradient-don)', color: TYPE_COLORS.DON },
};

const ETAT_CONFIG = {
    NEUF: { label: ETAT_LABELS.NEUF, color: ETAT_COLORS.NEUF },
    BON: { label: ETAT_LABELS.BON, color: ETAT_COLORS.BON },
    ACCEPTABLE: { label: ETAT_LABELS.ACCEPTABLE, color: ETAT_COLORS.ACCEPTABLE },
    USE: { label: ETAT_LABELS.USE, color: ETAT_COLORS.USE },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 25 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

// ============================
// COMPONENT
// ============================
export default function BookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const [isFav, setIsFav] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [contactMsg, setContactMsg] = useState('');
    const [contactSent, setContactSent] = useState(false);

    const book = ALL_BOOKS.find(b => b.id === parseInt(id)) || ALL_BOOKS[0];
    const typeConf = TYPE_CONFIG[book.typeEchange];
    const etatConf = ETAT_CONFIG[book.etat];
    const isTrusted = book.proprietaire.nbEchanges >= 3;

    const similarBooks = ALL_BOOKS.filter(b => b.id !== book.id && b.filiere === book.filiere).slice(0, 6);
    if (similarBooks.length < 6) {
        ALL_BOOKS.filter(b => b.id !== book.id && !similarBooks.find(s => s.id === b.id))
            .slice(0, 6 - similarBooks.length)
            .forEach(b => similarBooks.push(b));
    }

    const priceLabel = book.typeEchange === 'VENTE' ? `${book.prixVente} DH`
        : book.typeEchange === 'DON' ? 'Gratuit' : 'Prêt gratuit';

    const slugify = (text) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const handleSendContact = () => {
        if (!contactMsg.trim()) return;
        setContactSent(true);
        setTimeout(() => { setShowContact(false); setContactSent(false); setContactMsg(''); }, 2000);
    };

    const nextPhoto = () => setSelectedPhoto(p => (p + 1) % book.photos.length);
    const prevPhoto = () => setSelectedPhoto(p => (p - 1 + book.photos.length) % book.photos.length);

    return (
        <div className={styles.page}>
            {/* Back button */}
            <motion.button className={styles.backBtn} onClick={() => navigate(-1)}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <ArrowLeft size={18} /> Retour
            </motion.button>

            {/* ====== MAIN GRID ====== */}
            <motion.div className={styles.grid} variants={stagger} initial="hidden" animate="visible">

                {/* ——— LEFT: Gallery ——— */}
                <motion.div className={styles.gallery} variants={fadeUp}>
                    <div className={styles.manualWrapper}>
                        <img src={book.photos[selectedPhoto]} alt={book.titreAnnonce} className={styles.manualCover} />
                        {book.photos.length > 1 && (
                            <>
                                <button className={`${styles.navBtn} ${styles.navLeft}`} onClick={prevPhoto}><ChevronLeft size={20} /></button>
                                <button className={`${styles.navBtn} ${styles.navRight}`} onClick={nextPhoto}><ChevronRight size={20} /></button>
                            </>
                        )}
                        <div className={styles.typeRibbon} style={{ background: typeConf.gradient }}>{typeConf.label}</div>
                    </div>
                    {book.photos.length > 1 && (
                        <div className={styles.thumbnails}>
                            {book.photos.map((p, i) => (
                                <button key={i} className={`${styles.thumb} ${i === selectedPhoto ? styles.thumbActive : ''}`}
                                    onClick={() => setSelectedPhoto(i)}>
                                    <img src={p} alt={`Photo ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* ——— RIGHT: Info ——— */}
                <div className={styles.info}>
                    {/* Title block */}
                    <motion.div className={styles.titleBlock} variants={fadeUp}>
                        <div className={styles.badges}>
                            <span className={styles.etatBadge} style={{ background: etatConf.color }}>{etatConf.label}</span>
                            <span className={styles.viewsBadge}><Eye size={13} /> {book.nbVues} vues</span>
                        </div>
                        <h1 className={styles.title}>{book.titreAnnonce}</h1>
                        <p className={styles.author}>{book.auteur}</p>
                        <div className={styles.priceRow}>
                            <span className={styles.price} style={{ color: typeConf.color }}>{priceLabel}</span>
                            <div className={styles.actionBtns}>
                                <motion.button className={`${styles.iconAction} ${isFav ? styles.favActive : ''}`}
                                    onClick={() => {
                                        const newFav = !isFav;
                                        setIsFav(newFav);
                                        if (newFav) {
                                            toast.success("Ajouté à vos favoris !", { style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid #ef4444' }, iconTheme: { primary: '#ef4444', secondary: 'white' } });
                                        } else {
                                            toast.success("Retiré des favoris.");
                                        }
                                    }} whileTap={{ scale: 0.85 }}>
                                    <Heart size={18} fill={isFav ? '#ef4444' : 'none'} />
                                </motion.button>
                                <button className={styles.iconAction}><Share2 size={18} /></button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Details grid */}
                    <motion.div className={styles.detailsCard} variants={fadeUp}>
                        <h3 className={styles.cardLabel}>Caractéristiques</h3>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}><Hash size={16} /><div><span>ISBN</span><strong>{book.isbn}</strong></div></div>
                            <div className={styles.detailItem}><Layers size={16} /><div><span>État</span><strong>{etatConf.label}</strong></div></div>
                            <div className={styles.detailItem}><GraduationCap size={16} /><div><span>Filière</span><strong>{book.filiere}</strong></div></div>
                            <div className={styles.detailItem}><MapPin size={16} /><div><span>Ville</span><strong>{book.ville}</strong></div></div>
                        </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div className={styles.descCard} variants={fadeUp}>
                        <h3 className={styles.cardLabel}>Description</h3>
                        <p className={styles.descText}>{book.description}</p>
                    </motion.div>

                    {/* Owner card */}
                    <motion.div className={styles.ownerCard} variants={fadeUp}>
                        <h3 className={styles.cardLabel}>Propriétaire</h3>
                        <div
                            className={styles.ownerInfo}
                            onClick={() => navigate(`/student-dashboard/user/${slugify(book.proprietaire.nom)}`)}
                            style={{ cursor: 'pointer' }}
                            title="Voir le profil du vendeur"
                        >
                            <div className={styles.ownerAvatar} style={{ background: typeConf.color }}>
                                {book.proprietaire.nom.charAt(0)}
                            </div>
                            <div className={styles.ownerDetails}>
                                <strong>{book.proprietaire.nom}</strong>
                                {isTrusted && (
                                    <span className={styles.trustBadge}><ShieldCheck size={12} /> Vérifié · {book.proprietaire.nbEchanges} échanges</span>
                                )}
                                <div className={styles.ownerMeta}>
                                    <span><GraduationCap size={13} /> {book.proprietaire.filiere}</span>
                                    <span><Building2 size={13} /> {book.proprietaire.etablissement}</span>
                                    <span><MapPin size={13} /> {book.proprietaire.ville}</span>
                                </div>
                            </div>
                        </div>
                        <button className={styles.contactBtn} onClick={() => setShowContact(true)}>
                            <MessageCircle size={18} /> Contacter l'annonceur
                        </button>
                    </motion.div>
                </div>
            </motion.div>

            {/* ====== SIMILAR BOOKS ====== */}
            {similarBooks.length > 0 && (
                <motion.section className={styles.similarSection}
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                    <h2 className={styles.similarTitle}><BookOpen size={20} /> Livres similaires</h2>
                    <div className={styles.similarGrid}>
                        {similarBooks.map((b, i) => (
                            <ManualCard key={b.id} annonce={b} index={i}
                                onCardClick={(a) => navigate(`/student-dashboard/book/${a.id}`)} />
                        ))}
                    </div>
                </motion.section>
            )}

            {/* ====== CONTACT MODAL ====== */}
            {showContact && (
                <div className={styles.modalOverlay} onClick={() => setShowContact(false)}>
                    <motion.div className={styles.modalBox} onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.25 }}>
                        <button className={styles.modalClose} onClick={() => setShowContact(false)}><X size={20} /></button>
                        <div className={styles.modalIcon} style={{ background: typeConf.color }}><MessageCircle size={28} /></div>
                        <h3>Contacter {book.proprietaire.nom}</h3>
                        <p>Envoyez un message à propos de "{book.titreAnnonce}"</p>

                        {contactSent ? (
                            <motion.div className={styles.sentMsg}
                                initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                                ✅ Message envoyé avec succès !
                            </motion.div>
                        ) : (
                            <>
                                <textarea className={styles.modalTextarea} rows={4}
                                    placeholder="Bonjour, je suis intéressé(e) par votre manuel..."
                                    value={contactMsg} onChange={e => setContactMsg(e.target.value)} />
                                <button className={styles.modalSend} onClick={handleSendContact}>
                                    <Send size={16} /> Envoyer le message
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}
