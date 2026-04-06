import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Heart, TrendingUp, Wallet, Trophy, ArrowRight, Eye, PlusCircle, MessageCircle, Clock, Send, Target, Star, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { bookApi, userApi } from '../../api/client';
import { getFullImageUrl } from '../../utils/imageHandler';
import styles from './StudentHome.module.css';

// Badge Colors (Pastels doux)
const TYPE_BG    = { VENTE: '#FDDCB5', PRET: '#BEE3F8', DON: '#B2F5D8', ECHANGE: '#E9D5FF' };
const TYPE_COLOR = { VENTE: '#9C4221', PRET: '#2B6CB0', DON: '#22543D', ECHANGE: '#6B21A8' };
const TYPE_LABEL = { VENTE: 'Vente', PRET: 'Prêt', DON: 'Don', ECHANGE: 'Échange' };

// Mock data removed in favor of dynamic API data

// ============================
// COMPONENT
// ============================
export default function StudentHome() {
    const { user } = useAuth();
    const [imgErrors, setImgErrors] = useState({});
    const [annonces, setAnnonces] = useState([]);
    const [sidebarData, setSidebarData] = useState({ 
        stats: null, 
        emprunts: [], 
        prets: [], 
        leaderboard: [], 
        activities: [] 
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarLoading, setIsSidebarLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setIsSidebarLoading(true);
                
                const [annoncesRes, sidebarRes] = await Promise.all([
                    bookApi.getAll({ status: 'ACTIF' }),
                    userApi.getSidebarData()
                ]);
                
                setAnnonces(annoncesRes.data);
                setSidebarData(sidebarRes.data);
            } catch (error) {
                console.error('Failed to fetch home data:', error);
            } finally {
                setIsLoading(false);
                setIsSidebarLoading(false);
            }
        };
        fetchData();
    }, []);

    const getLoanDurationInfo = (empruntDate, returnDate) => {
        const now = new Date();
        const start = new Date(empruntDate);
        const end = new Date(returnDate);

        // Elapsed
        const elapsedDiff = now - start;
        const elapsedDays = Math.floor(elapsedDiff / (1000 * 60 * 60 * 24));
        
        // Remaining
        const remainingDiff = end - now;
        const remainingDays = Math.ceil(remainingDiff / (1000 * 60 * 60 * 24));

        let elapsedStr = `${elapsedDays}j écoulés`;
        if (elapsedDays === 0) elapsedStr = "Débuté aujourd'hui";

        let remainingStr = `${remainingDays}j restants`;
        if (remainingDays < 0) remainingStr = "En retard";
        else if (remainingDays === 0) remainingStr = "À rendre aujourd'hui";
        else if (remainingDays === 1) remainingStr = "À rendre demain";

        return { elapsedStr, remainingStr, isUrgent: remainingDays < 3, isOverdue: remainingDays < 0 };
    };

    const getRelativeTime = (dateStr) => {
        const diff = new Date() - new Date(dateStr);
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);

        if (mins < 1) return 'À l\'instant';
        if (mins < 60) return `Il y a ${mins} min`;
        if (hrs < 24) return `Il y a ${hrs}h`;
        if (days === 1) return 'Hier';
        return `Il y a ${days} jours`;
    };

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

                        {/* Profile & Trust */}
                        <div className={styles.box}>
                            {isSidebarLoading ? (
                                <div className={styles.loadingSmall}>Chargement...</div>
                            ) : (
                                <>
                                    <div className={styles.profile}>
                                        <img 
                                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.prenom||'U'}+${user?.nom||'U'}&background=4f46e5&color=fff&rounded=true&size=80`} 
                                            alt="" 
                                            className={styles.avatar}
                                        />
                                        <div>
                                            <h3>{user?.prenom} {user?.nom}</h3>
                                            <span className={styles.badge2}>
                                                <Award size={11}/> {sidebarData.stats?.rank_label || 'Membre Argent'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.trust}>
                                        <div className={styles.trustHead}>
                                            <span>Indice de Fiabilité</span>
                                            <span className={styles.trustVal}>
                                                <Star size={11} color="#eab308" fill="#eab308"/> 
                                                {sidebarData.stats?.reliability_index || '4.50'}/5
                                            </span>
                                        </div>
                                        <div className={styles.bar}>
                                            <motion.div 
                                                className={styles.barFill} 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${(sidebarData.stats?.reliability_index || 4.5) * 20}%` }} 
                                                transition={{ duration: 1, delay: .4 }}
                                            />
                                        </div>
                                        <small>{sidebarData.stats?.next_rank_info}</small>
                                    </div>
                                </>
                            )}
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

                        {/* Mes Emprunts (Books I borrowed) */}
                        <div className={styles.box}>
                            <h3 className={styles.boxTitle}><Clock size={14} style={{color:'#f59e0b'}}/> Mes Emprunts en cours</h3>
                            {isSidebarLoading ? (
                                <div className={styles.loadingSmall}>Chargement...</div>
                            ) : sidebarData.emprunts.length === 0 ? (
                                <div className={styles.emptySmall}>Aucun emprunt actif.</div>
                            ) : sidebarData.emprunts.map(e => {
                                const info = getLoanDurationInfo(e.date_emprunt, e.date_retour);
                                return (
                                    <div key={e.id} className={styles.emprunt}>
                                        <img src={getFullImageUrl(e.image)} alt="" />
                                        <div>
                                            <span className={styles.empruntName}>{e.titre}</span>
                                            <div className={styles.empruntMeta}>
                                                <small>{e.owner_name}</small>
                                                <span className={`${styles.empruntTag} ${info.isUrgent ? styles.urgent : styles.ok}`}>
                                                    {info.elapsedStr} • {info.remainingStr}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mes Prêts (Books I lent to others) */}
                        <div className={styles.box}>
                            <h3 className={styles.boxTitle}><Send size={14} style={{color:'#3b82f6'}}/> Mes Prêts en cours</h3>
                            {isSidebarLoading ? (
                                <div className={styles.loadingSmall}>Chargement...</div>
                            ) : sidebarData.prets.length === 0 ? (
                                <div className={styles.emptySmall}>Aucun prêt actif.</div>
                            ) : sidebarData.prets.map(p => {
                                const info = getLoanDurationInfo(p.date_emprunt, p.date_retour);
                                return (
                                    <div key={p.id} className={styles.emprunt}>
                                        <img src={getFullImageUrl(p.image)} alt="" />
                                        <div>
                                            <span className={styles.empruntName}>{p.titre}</span>
                                            <div className={styles.empruntMeta}>
                                                <small>Prêté à: {p.borrower_name}</small>
                                                <span className={`${styles.empruntTag} ${info.isUrgent ? styles.urgent : styles.ok}`}>
                                                    {info.elapsedStr} • {info.remainingStr}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Leaderboard */}
                        <div className={styles.box}>
                            <h3 className={styles.boxTitle}><Trophy size={14} style={{color:'#eab308'}}/> Leaderboard</h3>
                            {isSidebarLoading ? (
                                <div className={styles.loadingSmall}>Chargement...</div>
                            ) : (
                                <div className={styles.podium}>
                                    {sidebarData.leaderboard.map(u => (
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
                            )}
                        </div>

                        {/* Activité */}
                        <div className={styles.box}>
                            <h3 className={styles.boxTitle}><MessageCircle size={14} style={{color:'#3b82f6'}}/> Activité Récente</h3>
                            {isSidebarLoading ? (
                                <div className={styles.loadingSmall}>Chargement...</div>
                            ) : sidebarData.activities.length === 0 ? (
                                <div className={styles.emptySmall}>Aucun événement récent.</div>
                            ) : sidebarData.activities.map(t => (
                                <div key={t.id} className={styles.activity}>
                                    <div className={styles.dot}/>
                                    <div>
                                        <p>{t.texte} — <strong>{t.livre}</strong></p>
                                        <small>{getRelativeTime(t.created_at)}</small>
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
