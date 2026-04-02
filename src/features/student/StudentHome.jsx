import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Heart, TrendingUp, Wallet, Trophy, ArrowRight, Eye, PlusCircle, MessageCircle, Clock, Send, Target, Star, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { bookApi } from '../../api/client';
import { getFullImageUrl } from '../../utils/imageHandler';
import styles from './StudentHome.module.css';

// Badge Colors (Pastels doux)
const TYPE_BG    = { VENTE: '#FDDCB5', PRET: '#BEE3F8', DON: '#B2F5D8' };
const TYPE_COLOR = { VENTE: '#9C4221', PRET: '#2B6CB0', DON: '#22543D' };
const TYPE_LABEL = { VENTE: 'Vente', PRET: 'Prêt', DON: 'Don' };

// ============================
// MOCK DATA (Remnants for UI density)
// ============================
const MOCK_EMPRUNTS = [
    { id: 201, titre: "Base de données relationnelles", rendu: "À rendre dans 3 jours", urgence: "haute", image: "/admin/books/intro-algorithms.png" },
    { id: 202, titre: "Architecture des Ordinateurs", rendu: "En cours (reste 12 j.)", urgence: "basse", image: "/admin/books/refactoring.png" },
];

const MOCK_TIMELINE = [
    { id: 301, texte: "Sarah M. a demandé votre livre", livre: "Systèmes d'exploitation", temps: "Il y a 2h" },
    { id: 302, texte: "Demande de prêt acceptée par", livre: "Hiba (Intro au Droit)", temps: "Hier à 14:30" },
    { id: 303, texte: "Ton annonce est maintenant", livre: "VALIDÉE ✅", temps: "Il y a 2 jours" },
    { id: 304, texte: "Leïla K. a noté votre échange", livre: "5 étoiles ⭐", temps: "Il y a 5 jours" },
];

const MOCK_LEADERBOARD = [
    { id: 1, pseudo: 'Hiba', points: 450, rang: 1, color: '#047857' },
    { id: 2, pseudo: 'Yasmine', points: 300, rang: 2, color: '#0369a1' },
    { id: 3, pseudo: 'Omar', points: 125, rang: 3, color: '#b45309' },
];

// ============================
// COMPONENT
// ============================
export default function StudentHome() {
    const { user } = useAuth();
    const [imgErrors, setImgErrors] = useState({});
    const [annonces, setAnnonces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                setIsLoading(true);
                const response = await bookApi.getAll();
                // Store all, we'll slice for different sections
                setAnnonces(response.data);
            } catch (error) {
                console.error('Failed to fetch home data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecent();
    }, []);

    // ---- Reusable Book Card ----
    const BookCard = ({ book, showBadge = false }) => {
        const titre = book.exemplaire?.ouvrage?.titre || book.titre || 'Sans titre';
        const auteur = book.exemplaire?.ouvrage?.auteur || book.auteur || 'Auteur inconnu';
        const photo = getFullImageUrl(book.exemplaire?.photoUrl || book.photo);
        const prix = book.prixVente || book.prix;
        const type = book.typeEchange || book.type;

        return (
            <div className={styles.bookCard} onClick={() => navigate(`/student-dashboard/book/${book.id}`)}>
                <div className={styles.bookCover}>
                    {imgErrors[book.id] ? (
                        <div className={styles.bookFallback}><BookOpen size={24} /></div>
                    ) : (
                        <img
                            src={photo}
                            alt={titre}
                            loading="lazy"
                            onError={() => setImgErrors(p => ({...p, [book.id]: true}))}
                        />
                    )}
                    {/* Badge */}
                    {showBadge && type && (
                        <span className={styles.badge} style={{ background: TYPE_BG[type], color: TYPE_COLOR[type] }}>
                            {TYPE_LABEL[type]}
                        </span>
                    )}
                    {/* Heart */}
                    <button className={styles.heartBtn} onClick={e => e.stopPropagation()}>
                        <Heart size={13} />
                    </button>
                </div>
                <div className={styles.bookMeta}>
                    <h4>{titre}</h4>
                    <span className={styles.bookPrice}>
                        {prix ? `${prix} DH` : <em className={styles.free}>Gratuit</em>}
                    </span>
                    <span className={styles.bookAuthor}>{auteur}</span>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.page}>
            {/* ═══════ SPLIT 70 / 30 ═══════ */}
            <div className={styles.split}>

                {/* —— LEFT COLUMN (70%) —— */}
                <main className={styles.main}>

                    {/* ═══════ HERO ═══════ */}
                    <header className={styles.hero}>
                        <div className={styles.heroText}>
                            <h1>Hey {user?.name?.split(' ')[0] || user?.prenom || 'Hiba'},</h1>
                            <p>Prête à faire de la place sur tes étagères aujourd'hui ?</p>
                            <div className={styles.heroActions}>
                                <button className={styles.btnPrimary} onClick={() => navigate('/student-dashboard/publish')}>
                                    <PlusCircle size={15} /> Publier un manuel
                                </button>
                            </div>
                        </div>

                        <div className={styles.statsRow}>
                            <motion.div className={`${styles.stat} ${styles.statGreen}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}>
                                <div className={styles.statIcon}><Wallet size={15} /></div>
                                <strong>480 DH</strong><span>Économies</span>
                                <svg className={styles.spark} viewBox="0 0 70 20" preserveAspectRatio="none"><path d="M0,20 Q12,14 25,17 T50,6 T70,3" fill="none" stroke="rgba(16,185,129,.35)" strokeWidth="2" strokeLinecap="round" /></svg>
                            </motion.div>
                            <motion.div className={`${styles.stat} ${styles.statBlue}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>
                                <div className={styles.statIcon}><BookOpen size={15} /></div>
                                <strong>{annonces.length}</strong><span>Annonces Actives</span>
                            </motion.div>
                            <motion.div className={`${styles.stat} ${styles.statPurple}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}>
                                <div className={styles.statIcon}><Award size={15} /></div>
                                <strong>Niveau 4</strong><span>Rang Campus</span>
                            </motion.div>
                        </div>
                    </header>

                    {/* Slider : Recommandés (Shuffled subset of real data) */}
                    <section className={styles.sec}>
                        <div className={styles.secHead}>
                            <h2><TrendingUp size={17}/> Recommandés pour vous</h2>
                        </div>
                        <div className={styles.slider}>
                            {isLoading ? (
                                <div className={styles.loadingSmall}>Chargement...</div>
                            ) : annonces.length > 0 ? (
                                annonces.slice().reverse().slice(0, 6).map(b => <BookCard key={b.id} book={b} />)
                            ) : (
                                <div className={styles.emptySmall}>Aucun livre disponible.</div>
                            )}
                        </div>
                    </section>

                    {/* Slider : Dernières Annonces */}
                    <section className={styles.sec}>
                        <div className={styles.secHead}>
                            <h2><Sparkles size={17}/> Dernières Annonces</h2>
                            <button className={styles.viewAll} onClick={() => navigate('/student-dashboard/search')}>
                                Voir tout <ArrowRight size={13} />
                            </button>
                        </div>
                        <div className={styles.slider}>
                            {isLoading ? (
                                <div className={styles.loadingSmall}>Chargement...</div>
                            ) : annonces.length > 0 ? (
                                annonces.slice(0, 6).map(b => <BookCard key={b.id} book={b} showBadge />)
                            ) : (
                                <div className={styles.emptySmall}>Soyez le premier à publier !</div>
                            )}
                        </div>
                    </section>

                    {/* CTA Banner */}
                    <motion.div className={styles.cta} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
                        <div>
                            <h2>Faites de la place sur vos étagères !</h2>
                            <p>Partagez les manuels du semestre dernier. Un petit geste, un grand impact.</p>
                        </div>
                        <button className={styles.ctaBtn} onClick={() => navigate('/student-dashboard/publish')}>
                            <Send size={14}/> Publier un manuel
                        </button>
                    </motion.div>
                </main>

                {/* —— RIGHT COLUMN (30%) — SIDEBAR —— */}
                <aside className={styles.aside}>
                    <div className={styles.asideSticky}>

                        {/* Profile */}
                        <div className={styles.box}>
                            <div className={styles.profile}>
                                <img src={`https://ui-avatars.com/api/?name=${user?.prenom||'U'}+${user?.nom||'U'}&background=4f46e5&color=fff&rounded=true&size=80`} alt="" className={styles.avatar}/>
                                <div>
                                    <h3>{user?.prenom} {user?.nom}</h3>
                                    <span className={styles.badge2}><Award size={11}/> Membre Or</span>
                                </div>
                            </div>
                            <div className={styles.trust}>
                                <div className={styles.trustHead}><span>Indice de Fiabilité</span><span className={styles.trustVal}><Star size={11} color="#eab308" fill="#eab308"/> 4.9/5</span></div>
                                <div className={styles.bar}><motion.div className={styles.barFill} initial={{width:0}} animate={{width:'92%'}} transition={{duration:1,delay:.4}}/></div>
                                <small>Plus que 3 prêts sans retard pour le rang Platine !</small>
                            </div>
                        </div>

                        {/* Wishlist Alert (Moved here from main) */}
                        <motion.div className={styles.alert} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
                            <div className={styles.alertHeader}>
                                <div className={styles.alertIcon}><Target size={16} color="#4f46e5"/></div>
                                <strong>Coup de chance !</strong>
                            </div>
                            <p><b>3 étudiants</b> cherchent des livres que vous possédez.</p>
                            <button className={styles.alertBtn}>Vendre mes livres</button>
                        </motion.div>

                        {/* Emprunts */}
                        <div className={styles.box}>
                            <h3 className={styles.boxTitle}><Clock size={14} style={{color:'#f59e0b'}}/> Emprunts en cours</h3>
                            {MOCK_EMPRUNTS.map(e => (
                                <div key={e.id} className={styles.emprunt}>
                                    <img src={getFullImageUrl(e.image)} alt="" />
                                    <div>
                                        <span className={styles.empruntName}>{e.titre}</span>
                                        <span className={`${styles.empruntTag} ${e.urgence === 'haute' ? styles.urgent : styles.ok}`}>{e.rendu}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Leaderboard */}
                        <div className={styles.box}>
                            <h3 className={styles.boxTitle}><Trophy size={14} style={{color:'#eab308'}}/> Leaderboard</h3>
                            <div className={styles.podium}>
                                {MOCK_LEADERBOARD.map(u => (
                                    <div key={u.id} className={styles.podiumUser}>
                                        <div className={styles.podiumAv}>
                                            <img src={`https://ui-avatars.com/api/?name=${u.pseudo}&background=f1f5f9&color=334155&rounded=true&size=64`} alt=""/>
                                            <span style={{background: u.color}}>{u.rang}</span>
                                        </div>
                                        <strong>{u.pseudo}</strong>
                                        <em>{u.points} pts</em>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activité */}
                        <div className={styles.box}>
                            <h3 className={styles.boxTitle}><MessageCircle size={14} style={{color:'#3b82f6'}}/> Activité Récente</h3>
                            {MOCK_TIMELINE.map(t => (
                                <div key={t.id} className={styles.activity}>
                                    <div className={styles.dot}/>
                                    <div>
                                        <p>{t.texte} — <strong>{t.livre}</strong></p>
                                        <small>{t.temps}</small>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </aside>
            </div>
        </div>
    );
}
