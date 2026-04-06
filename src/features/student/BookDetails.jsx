import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Heart, Share2, MapPin, GraduationCap, Building2,
    BookOpen, Hash, Layers, Send, X, Eye, ShieldCheck, Star,
    ChevronLeft, ChevronRight, MessageCircle, Clock, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { bookApi, conversationApi, transactionApi } from '../../api/client';
import { TYPE_COLORS, ETAT_LABELS, ETAT_COLORS } from '../../data/mockBooks';
import { useAuth } from '../auth/useAuth';
import { getFullImageUrl } from '../../utils/imageHandler';
import ManualCard from './ManualCard';
import styles from './BookDetails.module.css';
import ShareMenu from './ShareMenu';


const TYPE_CONFIG = {
    VENTE: { label: 'Vente', gradient: 'var(--gradient-vente)', color: TYPE_COLORS.VENTE },
    PRET: { label: 'Prêt', gradient: 'var(--gradient-pret)', color: TYPE_COLORS.PRET },
    DON: { label: 'Don', gradient: 'var(--gradient-don)', color: TYPE_COLORS.DON },
    ECHANGE: { label: 'Échange', gradient: 'var(--gradient-echange)', color: TYPE_COLORS.ECHANGE },
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
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [allBooks, setAllBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const [isFav, setIsFav] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [contactMsg, setContactMsg] = useState('');
    const [contactSent, setContactSent] = useState(false);
    const [showCodModal, setShowCodModal] = useState(false);
    const [codData, setCodData] = useState({ meeting_point: '', meeting_date: '', return_date: '' });
    const [isCodLoading, setIsCodLoading] = useState(false);
    const [isSendingContact, setIsSendingContact] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [bookRes, allRes] = await Promise.all([
                    bookApi.getById(id),
                    bookApi.getAll()
                ]);
                setBook(bookRes.data);
                setAllBooks(allRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Livre introuvable');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) return <div className={styles.loading}>Chargement...</div>;
    if (!book) return <div className={styles.error}>Livre introuvable</div>;

    const typeConf = TYPE_CONFIG[book.typeEchange];
    const etatConf = ETAT_CONFIG[book.exemplaire?.etat];
    const isTrusted = book.exemplaire?.proprietaire?.nbEchanges >= 3;

    // We only have one photoUrl in DB for now as per schema, so we'll wrap it in array
    const photos = book.photos || [book.exemplaire?.photoUrl || book.photoUrl].filter(Boolean);

    // Filter by same category or filiere
    const similarBooks = allBooks.filter(b => b.id !== book.id && b.exemplaire?.ouvrage?.categorie?.label === book.exemplaire?.ouvrage?.categorie?.label).slice(0, 6);
    if (similarBooks.length < 6) {
        allBooks.filter(b => b.id !== book.id && !similarBooks.find(s => s.id === b.id))
            .slice(0, 6 - similarBooks.length)
            .forEach(b => similarBooks.push(b));
    }

    const priceLabel = book.typeEchange === 'VENTE' ? `${book.prixVente} DH`
        : book.typeEchange === 'DON' ? 'Gratuit' 
        : book.typeEchange === 'ECHANGE' ? 'Échange' : 'Prêt gratuit';

    const slugify = (text) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const handleSendContact = async () => {
        if (!contactMsg.trim() || !book.exemplaire?.proprietaire?.id || isSendingContact) return;
        
        try {
            setIsSendingContact(true);
            // 1. Start or get conversation
            const convRes = await conversationApi.startConversation(book.exemplaire.proprietaire.id, book.id);
            const convId = convRes.data.conversationId;

            // 2. Send initial message
            await conversationApi.sendMessage(convId, {
                text: contactMsg,
                type: 'text'
            });

            setContactSent(true);
            toast.success('Message envoyé !');
            
            // 3. Redirect to messages after a short delay
            setTimeout(() => { 
                navigate('/student-dashboard/messages');
            }, 1000);
        } catch (error) {
            console.error('Failed to send contact message:', error);
            toast.error('Erreur lors de l\'envoi du message');
        } finally {
            setIsSendingContact(false);
        }
    };

    const handleInitiateCod = async () => {
        if (!codData.meeting_point || !codData.meeting_date) {
            toast.error('Veuillez remplir tous les champs.');
            return;
        }

        try {
            setIsCodLoading(true);
            await transactionApi.create({
                annonce_id: book.id,
                seller_id: book.exemplaire.proprietaire.id,
                amount: book.typeEchange === 'VENTE' ? book.prixVente : 0,
                meeting_point: codData.meeting_point,
                meeting_date: codData.meeting_date,
                return_date: book.typeEchange === 'PRET' ? codData.return_date : null
            });

            toast.success('Demande d\'achat envoyée !');
            setShowCodModal(false);
            // Redirect to dashboard to see the transaction
            navigate('/student-dashboard/dashboard', { state: { activeTab: 'transactions' } });
        } catch (error) {
            console.error('Failed to initiate COD:', error);
            toast.error(error.response?.data?.error || 'Erreur lors de la demande d\'achat');
        } finally {
            setIsCodLoading(false);
        }
    };

    const nextPhoto = () => setSelectedPhoto(p => (p + 1) % photos.length);
    const prevPhoto = () => setSelectedPhoto(p => (p - 1 + photos.length) % photos.length);

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
                        <img src={getFullImageUrl(photos[selectedPhoto])} alt={book.exemplaire?.ouvrage?.titre} className={styles.manualCover} />
                        {photos.length > 1 && (
                            <>
                                <button className={`${styles.navBtn} ${styles.navLeft}`} onClick={prevPhoto}><ChevronLeft size={20} /></button>
                                <button className={`${styles.navBtn} ${styles.navRight}`} onClick={nextPhoto}><ChevronRight size={20} /></button>
                            </>
                        )}
                        <div className={styles.typeRibbon} style={{ background: typeConf.gradient }}>{typeConf.label}</div>
                    </div>
                    {photos.length > 1 && (
                        <div className={styles.thumbnails}>
                            {photos.map((p, i) => (
                                <button key={i} className={`${styles.thumb} ${i === selectedPhoto ? styles.thumbActive : ''}`}
                                    onClick={() => setSelectedPhoto(i)}>
                                    <img src={getFullImageUrl(p)} alt={`Photo ${i + 1}`} />
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
                            <span className={styles.etatBadge} style={{ background: etatConf?.color }}>{etatConf?.label}</span>
                            <span className={styles.viewsBadge}><Eye size={13} /> {book.nbVues} vues</span>
                        </div>
                        <h1 className={styles.title}>{book.exemplaire?.ouvrage?.titre || 'Annonce'}</h1>
                        <p className={styles.author}>{book.exemplaire?.ouvrage?.auteur}</p>
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
                                    <ShareMenu title={book.exemplaire?.ouvrage?.titre} />
                                </div>
                        </div>
                    </motion.div>

                    {/* Details grid */}
                    <motion.div className={styles.detailsCard} variants={fadeUp}>
                        <h3 className={styles.cardLabel}>Caractéristiques</h3>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}><Hash size={16} /><div><span>ISBN</span><strong>{book.exemplaire?.ouvrage?.isbn}</strong></div></div>
                            <div className={styles.detailItem}><Layers size={16} /><div><span>État</span><strong>{etatConf?.label}</strong></div></div>
                            <div className={styles.detailItem}><GraduationCap size={16} /><div><span>Catégorie</span><strong>{book.exemplaire?.ouvrage?.categorie?.label}</strong></div></div>
                            <div className={styles.detailItem}><MapPin size={16} /><div><span>Campus</span><strong>{book.exemplaire?.proprietaire?.ville}</strong></div></div>
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
                            onClick={() => navigate(`/student-dashboard/user/${slugify(book.exemplaire?.proprietaire?.nom || '')}`)}
                            style={{ cursor: 'pointer' }}
                            title="Voir le profil du vendeur"
                        >
                            <div className={styles.ownerAvatar} style={{ background: typeConf?.color }}>
                                {book.exemplaire?.proprietaire?.nom?.charAt(0)}
                            </div>
                            <div className={styles.ownerDetails}>
                                <strong>{book.exemplaire?.proprietaire?.nom}</strong>
                                {isTrusted && (
                                    <span className={styles.trustBadge}><ShieldCheck size={12} /> Vérifié · {book.exemplaire?.proprietaire?.nbEchanges} échanges</span>
                                )}
                                <div className={styles.ownerMeta}>
                                    <span><GraduationCap size={13} /> {book.exemplaire?.proprietaire?.filiere}</span>
                                    <span><Building2 size={13} /> {book.exemplaire?.proprietaire?.etablissement}</span>
                                    <span><MapPin size={13} /> {book.exemplaire?.proprietaire?.ville}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.ownerActions}>
                            <button className={styles.contactBtn} onClick={() => setShowContact(true)}>
                                <MessageCircle size={18} /> Message
                            </button>
                            {book.typeEchange === 'VENTE' && (
                                <button className={styles.codBtn} onClick={() => setShowCodModal(true)}>
                                    <ShieldCheck size={18} /> Acheter (Espèces)
                                </button>
                            )}
                            {book.typeEchange === 'ECHANGE' && (
                                <button className={styles.codBtn} onClick={() => setShowCodModal(true)}>
                                    <Layers size={18} /> Échanger (Livres)
                                </button>
                            )}
                            {book.typeEchange === 'PRET' && (
                                <button className={styles.codBtn} onClick={() => setShowCodModal(true)} style={{ background: 'var(--gradient-pret)' }}>
                                    <Clock size={18} /> Emprunter (Prêt)
                                </button>
                            )}
                        </div>
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
                        <div className={styles.modalIcon} style={{ background: typeConf?.color }}><MessageCircle size={28} /></div>
                        <h3>Contacter {book.exemplaire?.proprietaire?.nom}</h3>
                        <p>Envoyez un message à propos de "{book.exemplaire?.ouvrage?.titre}"</p>

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
                                <button className={styles.modalSend} onClick={handleSendContact} disabled={isSendingContact}>
                                    {isSendingContact ? 'Envoi...' : <><Send size={16} /> Envoyer le message</>}
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>
            )}

            {/* ====== COD MODAL ====== */}
            {showCodModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCodModal(false)}>
                    <motion.div className={styles.modalBox} onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.25 }}>
                        <button className={styles.modalClose} onClick={() => setShowCodModal(false)}><X size={20} /></button>
                        <div className={styles.modalIcon} style={{ background: book.typeEchange === 'ECHANGE' ? 'var(--gradient-echange)' : book.typeEchange === 'PRET' ? 'var(--gradient-pret)' : 'var(--gradient-vente)' }}>
                            {book.typeEchange === 'ECHANGE' ? <Layers size={28} /> : book.typeEchange === 'PRET' ? <Clock size={28} /> : <ShieldCheck size={28} />}
                        </div>
                        <h3>{book.typeEchange === 'ECHANGE' ? 'Proposer un échange' : book.typeEchange === 'PRET' ? 'Proposer un emprunt' : 'Proposer un achat'}</h3>
                        <p>
                            {book.typeEchange === 'ECHANGE' 
                                ? <>Vous allez proposer un échange pour "{book.exemplaire?.ouvrage?.titre}". Vous pourrez convenir des livres à échanger via le chat.</>
                                : book.typeEchange === 'PRET'
                                ? <>Vous allez proposer d'emprunter "{book.exemplaire?.ouvrage?.titre}". Veuillez suggérer une date de retour.</>
                                : <>Vous allez proposer un achat en espèces de <strong>{book.prixVente} DH</strong> pour "{book.exemplaire?.ouvrage?.titre}".</>
                            }
                        </p>

                        <div className={styles.codForm}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}><MapPin size={14} /> Lieu de rencontre proposé</label>
                                <input type="text" className={styles.modalInput} placeholder="Ex: Devant la bibliothèque centrale"
                                    value={codData.meeting_point} onChange={e => setCodData({ ...codData, meeting_point: e.target.value })} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}><Clock size={14} /> Date & Heure du rendez-vous</label>
                                <input type="datetime-local" className={styles.modalInput}
                                    value={codData.meeting_date} onChange={e => setCodData({ ...codData, meeting_date: e.target.value })} />
                            </div>
                            {book.typeEchange === 'PRET' && (
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}><Calendar size={14} /> Date de retour prévue</label>
                                    <input type="date" className={styles.modalInput}
                                        value={codData.return_date} onChange={e => setCodData({ ...codData, return_date: e.target.value })} />
                                </div>
                            )}
                            <button className={styles.modalSend} onClick={handleInitiateCod} disabled={isCodLoading}>
                                {isCodLoading ? 'Envoi...' : (book.typeEchange === 'ECHANGE' ? 'Envoyer la proposition d\'échange' : book.typeEchange === 'PRET' ? 'Envoyer la proposition d\'emprunt' : 'Envoyer la proposition d\'achat')}
                            </button>
                            <p className={styles.disclaimer}>Le vendeur devra accepter votre proposition pour confirmer le rendez-vous.</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
