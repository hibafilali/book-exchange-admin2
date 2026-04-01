import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Heart, TrendingUp, Wallet, Trophy, ArrowRight, Eye, PlusCircle, MessageCircle, Clock, Send, Target, Star, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import styles from './StudentHome.module.css';

// Badge Colors (Pastels doux)
const TYPE_BG    = { VENTE: '#FDDCB5', PRET: '#BEE3F8', DON: '#B2F5D8' };
const TYPE_COLOR = { VENTE: '#9C4221', PRET: '#2B6CB0', DON: '#22543D' };
const TYPE_LABEL = { VENTE: 'Vente', PRET: 'Prêt', DON: 'Don' };

// ============================
// MOCK DATA — Couvertures Réalistes
// ============================
const MOCK_RECOMMENDATIONS = [
    { id: 101, titre: "Clean Code", auteur: "Robert C. Martin", prix: 75, photo: "/admin/books/clean-code.png" },
    { id: 102, titre: "Design Patterns", auteur: "Gang of Four", prix: 95, photo: "/admin/books/design-patterns.png" },
    { id: 103, titre: "Introduction to Algorithms", auteur: "Cormen et al.", prix: 108, photo: "/admin/books/intro-algorithms.png" },
    { id: 104, titre: "Refactoring", auteur: "Martin Fowler", prix: 45, photo: "/admin/books/refactoring.png" },
    { id: 105, titre: "Test-Driven Development", auteur: "Kent Beck", prix: null, photo: "/admin/books/tdd.png" },
    { id: 106, titre: "System Design Interview", auteur: "Alex Xu", prix: 85, photo: "/admin/books/system-design.png" },
];

const MOCK_ANNONCES = [
    { id: 1, titre: "Introduction to Algorithms", auteur: "Cormen et al.", type: "VENTE", prix: 98, photo: "/admin/books/intro-algorithms.png", filiere: "Informatique" },
    { id: 2, titre: "Code Civil 2024", auteur: "Dalloz", type: "DON", prix: null, photo: "/admin/books/code-civil.png", filiere: "Droit" },
    { id: 3, titre: "Principles of Economics", auteur: "N. Gregory Mankiw", type: "PRET", prix: null, photo: "/admin/books/economics.png", filiere: "Économie" },
    { id: 4, titre: "Clean Code", auteur: "Robert C. Martin", type: "VENTE", prix: 75, photo: "/admin/books/clean-code.png", filiere: "Informatique" },
    { id: 5, titre: "Gray's Anatomy", auteur: "Susan Standring", type: "VENTE", prix: 105, photo: "/admin/books/grays-anatomy.png", filiere: "Médecine" },
    { id: 6, titre: "Refactoring", auteur: "Martin Fowler", type: "PRET", prix: null, photo: "/admin/books/refactoring.png", filiere: "Informatique" },
    { id: 7, titre: "Droit Constitutionnel", auteur: "Michel Verpeaux", type: "VENTE", prix: 65, photo: "/admin/books/droit-constitutionnel.png", filiere: "Droit" },
    { id: 8, titre: "Harrison's Medicine", auteur: "Kasper et al.", type: "VENTE", prix: 109, photo: "/admin/books/harrisons-medicine.png", filiere: "Médecine" },
    { id: 9, titre: "Capital au XXIe siècle", auteur: "Thomas Piketty", type: "DON", prix: null, photo: "/admin/books/capital-piketty.png", filiere: "Économie" },
    { id: 10, titre: "Design Patterns", auteur: "Gang of Four", type: "VENTE", prix: 85, photo: "/admin/books/design-patterns.png", filiere: "Informatique" },
];

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
    const navigate = useNavigate();

    // ---- Reusable Book Card ----
    const BookCard = ({ book, showBadge = false }) => (
        <div className={styles.bookCard} onClick={() => navigate(`/student-dashboard/book/${book.id}`)}>
            <div className={styles.bookCover}>
                {imgErrors[book.id] ? (
                    <div className={styles.bookFallback}><BookOpen size={24} /></div>
                ) : (
                    <img
                        src={book.photo}
                        alt={book.titre}
                        loading="lazy"
                        onError={() => setImgErrors(p => ({...p, [book.id]: true}))}
                    />
                )}
                {/* Badge */}
                {showBadge && book.type && (
                    <span className={styles.badge} style={{ background: TYPE_BG[book.type], color: TYPE_COLOR[book.type] }}>
                        {TYPE_LABEL[book.type]}
                    </span>
                )}
                {/* Heart */}
                <button className={styles.heartBtn} onClick={e => e.stopPropagation()}>
                    <Heart size={13} />
                </button>
            </div>
            <div className={styles.bookMeta}>
                <h4>{book.titre}</h4>
                <span className={styles.bookPrice}>
                    {book.prix ? `${book.prix} DH` : <em className={styles.free}>Gratuit</em>}
                </span>
                <span className={styles.bookAuthor}>{book.auteur}</span>
            </div>
        </div>
    );

    return (
        <div className={styles.page}>



            {/* ═══════ SPLIT 70 / 30 ═══════ */}
            <div className={styles.split}>

                {/* —— LEFT COLUMN (70%) —— */}
                <main className={styles.main}>

                    {/* ═══════ HERO ═══════ */}
                    <header className={styles.hero}>
                        <div className={styles.heroText}>
                            <h1>Hey {user?.name?.split(' ')[0] || 'Hiba'},</h1>
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
                                <strong>12</strong><span>Annonces Actives</span>
                            </motion.div>
                            <motion.div className={`${styles.stat} ${styles.statPurple}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}>
                                <div className={styles.statIcon}><Award size={15} /></div>
                                <strong>Niveau 4</strong><span>Rang Campus</span>
                            </motion.div>
                        </div>
                    </header>

                    {/* Slider : Recommandés */}
                    <section className={styles.sec}>
                        <div className={styles.secHead}>
                            <h2><TrendingUp size={17}/> Recommandés pour votre filière</h2>
                        </div>
                        <div className={styles.slider}>
                            {MOCK_RECOMMENDATIONS.map(b => <BookCard key={b.id} book={b} />)}
                        </div>
                    </section>



                    {/* Slider : Dernières Annonces */}
                    <section className={styles.sec}>
                        <div className={styles.secHead}>
                            <h2><Sparkles size={17}/> Dernières Annonces</h2>
                            <button className={styles.viewAll} onClick={() => navigate('/student-dashboard/browse')}>
                                Voir tout <ArrowRight size={13} />
                            </button>
                        </div>
                        <div className={styles.slider}>
                            {MOCK_ANNONCES.map(b => <BookCard key={b.id} book={b} showBadge />)}
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
                                    <img src={e.image} alt="" />
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
