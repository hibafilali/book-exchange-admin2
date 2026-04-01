import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Search, ArrowRight, DollarSign, Leaf,
    Users, BookMarked, TrendingUp, Heart, MapPin, Eye,
    ChevronLeft, ChevronRight, Mail, Star, Quote, ShieldCheck,
    Stethoscope, GraduationCap, Gavel, Landmark, Languages
} from 'lucide-react';
import YTeraLogo from '../../components/common/YTeraLogo';
import HowItWorksStepper from './HowItWorksStepper';
import ImpactSection from './ImpactSection';
import ProximityMap from './ProximityMap';
import styles from './LandingPage.module.css';
import livresIllustration from '../../assets/LIVRES.png';
import megaphoneWoman from '../../assets/megaphone-woman.png';
import heroMascot from '../../assets/hero-mascot.png';
import phoneIllustration from '../../assets/phone-illustration.png';
import thinkingWoman from '../../assets/thinking-woman-new.png';
import examCalendar from '../../assets/exam-calendar-drawing.png';
import thoughtBubble from '../../assets/thought-bubble-drawing.png';
import solidaireLabel from '../../assets/emprunt-solidaire-label.png';
import book1 from '../../assets/book1.png';
import book2 from '../../assets/book2.png';
import book3 from '../../assets/book3.png';
import book4 from '../../assets/book4.png';
import book5 from '../../assets/book5.png';
import book6 from '../../assets/book6.png';
import book7 from '../../assets/book7.png';
import book8 from '../../assets/book8.png';
import book9 from '../../assets/book9.png';
import book10 from '../../assets/book10.png';

// ============================
// MOCK DATA
// ============================
const TEASER_BOOKS = [
    { id: 1, titre: "Anatomie Humaine", auteur: "Dr. Salim Alaoui", type: "VENTE", prix: 85, etat: "Très bon", nbVues: 230, ville: "Fès", photo: book1 },
    { id: 2, titre: "Mathématiques pour Ingénieurs", auteur: "Prof. Kamal Ziani", type: "VENTE", prix: 95, etat: "Comme neuf", nbVues: 145, ville: "Casablanca", photo: book2 },
    { id: 3, titre: "Droit Civil : Les Obligations", auteur: "Prof. Yassir Benani", type: "DON", prix: null, etat: "Bon", nbVues: 180, ville: "Rabat", photo: book3 },
    { id: 4, titre: "Principes de Macroéconomie", auteur: "Dr. Amina El Fassi", type: "VENTE", prix: 75, etat: "Très bon", nbVues: 120, ville: "Marrakech", photo: book4 },
    { id: 5, titre: "Analyse Mathématique", auteur: "Prof. Jean-Pierre Girard", type: "PRET", prix: null, etat: "Bon", nbVues: 95, ville: "Tanger", photo: book5 },
    { id: 6, titre: "Chimie Organique", auteur: "Dr. Sophie Meyer", type: "VENTE", prix: 90, etat: "Très bon", nbVues: 210, ville: "Fès", photo: book6 },
    { id: 7, titre: "Physique pour Scientifiques", auteur: "Prof. David Halliday", type: "VENTE", prix: 98, etat: "Comme neuf", nbVues: 115, ville: "Casablanca", photo: book7 },
    { id: 8, titre: "Introduction au Marketing", auteur: "Prof. Philip Kotler", type: "DON", prix: null, etat: "Bon", nbVues: 160, ville: "Rabat", photo: book8 },
    { id: 9, titre: "Psychologie Contemporaine", auteur: "Dr. Jane Smith", type: "VENTE", prix: 80, etat: "Très bon", nbVues: 130, ville: "Marrakech", photo: book9 },
    { id: 10, titre: "Réseaux Informatiques", auteur: "Prof. Alex Turner", type: "PRET", prix: null, etat: "Bon", nbVues: 85, ville: "Tanger", photo: book10 },
];

const TYPE_COLORS = { VENTE: '#FF5722', PRET: '#3B82F6', DON: '#10B981' };
const TYPE_LABELS = { VENTE: 'Vente', PRET: 'Prêt', DON: 'Don' };

const SLIDES = [
    {
        bg: "#128568",
        textColor: "#1A0F2E",
        titleParts: ["Tes manuels,", "à portée de clic", ""],
        highlightBg: "transparent",
        highlightColor: "#FF5722",
        highlightRotate: "0deg",
        highlightFont: "'Caveat', cursive",
        subtitle: "Vendez, achetez ou échangez vos livres de cours entre étudiants marocains. C'est gratuit et en 2 clics.",
        cta: "Vendre mes livres",
        ctaBg: "#1A0F2E",
        ctaColor: "#FFFFFF",
        heroImage: null,
        heroImageAlt: ""
    },
    {
        bg: "#3B108E",
        textColor: "#FFFFFF",
        titleParts: ["ÉCHANGEZ VOS LIVRES", "Zéro Dirham, Réussite Totale", ""],
        highlightBg: "transparent",
        highlightColor: "#FACC15",
        highlightRotate: "0deg",
        highlightFont: "'Inter', sans-serif",
        subtitle: "N'attendez pas ! Rejoignez notre communauté d'étudiants. Boostez votre semestre en échangeant vos manuels usagés contre ceux qu'il vous faut, gratuitement !",
        cta: "Proposer un échange",
        ctaBg: "#FACC15",
        ctaColor: "#000000",
        heroImage: null,
        heroImageAlt: "",
        isFlipped: true
    },
    {
        bg: "#3A7C88",
        textColor: "#FFFFFF",
        titleColor: "#FFFFFF",
        subtitleColor: "#f8fafc",
        titleParts: ["EXAMENS PROCHES ?", "RÉVISEZ SANS VOUS RUINER !", ""],
        highlightBg: "transparent",
        highlightColor: "#FACC15",
        highlightRotate: "0deg",
        highlightFont: "'Inter', sans-serif",
        subtitle: "Solidarité étudiante : accédez à prix solidaire aux manuels de révision dont vous avez besoin.",
        cta: "Emprunter des manuels",
        ctaBg: "#2B1B41",
        ctaColor: "#FFFFFF",
        heroImage: null,
        heroImageAlt: "",
        isTealHero: true
    },
    {
        bg: "#801C1E",
        textColor: "#FFFFFF",
        titleParts: ["Ne laissez plus vos manuels", "prendre de la poussière", "sur l’étagère."],
        highlightBg: "transparent",
        highlightColor: "#FF5722",
        highlightRotate: "0deg",
        highlightFont: "'Inter', sans-serif",
        subtitle: "Achetez, Vendez, Échangez vos manuels d'occasion. Intégrez notre économie circulaire solidaire.",
        cta: "S'INSCRIRE GRATUITEMENT",
        ctaBg: "#FF5722",
        ctaColor: "#FFFFFF",
        heroImage: heroMascot,
        heroImageAlt: "Mascotte yTera",
        isFlipped: true,
        titleClass: styles.bannerTitleSlide3,
        textClass: styles.bannerTextSlide3,
        mascotClass: styles.mascotSlide3
    }
];

const SlideDecoration = ({ slideIndex }) => {
    const decos = [
        <>
            <span style={{ position: 'absolute', top: '12%', left: '48%', fontSize: '32px', opacity: 0.25, color: '#1A0F2E' }}>✦</span>
            <span style={{ position: 'absolute', bottom: '18%', left: '42%', fontSize: '22px', opacity: 0.2, color: '#1A0F2E', transform: 'rotate(-30deg)' }}>⤻</span>
            <span style={{ position: 'absolute', top: '70%', left: '52%', fontSize: '18px', opacity: 0.15, color: '#1A0F2E' }}>✧</span>
        </>,
        <>
            <div className={styles.watermarkTroc}>PARTAGE</div>
            <div className={styles.watermarkArrows}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%', color: 'white', opacity: 0.08 }}>
                    <path d="M21 2v6h-6" />
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                    <path d="M3 22v-6h6" />
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
            </div>
        </>,
        null,
        <div className={styles.redSlideDecoration}>
            <div className={`${styles.dotGrid} ${styles.dotGridTopLeft}`} style={{ opacity: 0.12 }} />
            <div className={`${styles.dotGrid} ${styles.dotGridBottomRight}`} style={{ bottom: '10%', right: '5%', opacity: 0.12 }} />
            <div className={styles.circularBadge} style={{ right: '5%', bottom: '8%', top: 'auto', left: 'auto' }}>
                <svg className={styles.sketchCircleDrawn} viewBox="0 0 100 100" style={{ transform: 'rotate(10deg)' }}>
                    <path d="M50,10 C30,12 10,30 12,55 C15,80 40,92 65,88 C90,82 95,55 88,30 C82,10 60,8 45,15" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
                </svg>
                <div className={styles.circularBadgeInner} style={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                    ÉCONOMIE<br />SOLIDAIRE
                </div>
            </div>
            <span className={styles.handwrittenKeyword} style={{ top: '10%', left: '38%', fontSize: '1.8rem', transform: 'rotate(-8deg)', color: '#FCD34D' }}>ÉCHANGE</span>
            <span className={styles.handwrittenKeyword} style={{ top: '75%', left: '8%', fontSize: '1.5rem', transform: 'rotate(12deg)' }}>VENTE</span>
            <span className={styles.handwrittenKeyword} style={{ top: '20%', left: '8%', fontSize: '1.6rem', transform: 'rotate(-10deg)', color: '#FCD34D' }}>ACHAT</span>
            <span className={styles.handwrittenKeyword} style={{ bottom: '15%', left: '42%', fontSize: '1.4rem', transform: 'rotate(-5deg)' }}>PRÊT</span>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <path d="M15,65 Q25,55 35,62" className={styles.sketchLine} strokeDasharray="5,3" />
                <path d="M32,58 L37,63 L30,66" className={styles.sketchLine} />
                <path d="M25,12 Q30,8 35,15" className={styles.sketchLine} opacity="0.5" />
            </svg>
        </div>
    ];
    return decos[slideIndex] || null;
};

function AnimatedCounter({ target, suffix = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const num = parseInt(target.replace(/[^0-9]/g, ''));
        const steps = 60;
        const increment = num / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= num) { setCount(num); clearInterval(timer); }
            else setCount(Math.floor(current));
        }, 1800 / steps);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Reveal({ children, delay = 0, direction = 'up', animate = false }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const variants = {
        hidden: { opacity: 0, y: direction === 'up' ? 30 : 0, x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0 },
        visible: { opacity: 1, y: 0, x: 0 }
    };

    return (
        <motion.div
            ref={ref}
            initial={animate ? "hidden" : "visible"}
            animate={animate ? (isInView ? "visible" : "hidden") : "visible"}
            variants={variants}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay }}
        >
            {children}
        </motion.div>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [slide, setSlide] = useState(0);

    const handlePrev = () => {
        setSlide(s => (s === 0 ? SLIDES.length - 1 : s - 1));
    };

    const handleNext = () => {
        setSlide(s => (s === SLIDES.length - 1 ? 0 : s + 1));
    };

    const bookSliderRef = useRef(null);
    const scrollSlider = (direction) => {
        if (bookSliderRef.current) {
            const { scrollLeft, clientWidth } = bookSliderRef.current;
            const scrollAmount = clientWidth * 0.8;
            bookSliderRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const currentSlideData = SLIDES[slide];
    const cursorRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setSlide((prev) => (prev + 1) % SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 104;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const move = (e) => {
            if (cursorRef.current) {
                requestAnimationFrame(() => {
                    cursorRef.current.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
                });
            }
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    return (
        <div className={`${styles.page} ${styles.light}`}>
            <div ref={cursorRef} className={styles.customCursor} />
            <div className={styles.noiseOverlay} />
            <div className={`${styles.blurBlob} ${styles.blobOrange}`} />
            <div className={`${styles.blurBlob} ${styles.blobTeal}`} />
            <div className={`${styles.blurBlob} ${styles.blobIndigo}`} />

            <div className={styles.promoBar}>
                <span>Échangez vos manuels entre étudiants • Rejoignez la communauté solidaire du <span style={{ color: '#EA580C', fontWeight: 800 }}>Maroc</span></span>
            </div>

            <nav className={styles.navbar}>
                <div className={styles.navInner}>
                    <div className={styles.navLogo} onClick={() => scrollTo('hero')}>
                        <YTeraLogo size={18} />
                    </div>
                    <div className={styles.navLinks}>
                        <button onClick={() => scrollTo('books')}>Catalogue</button>
                        <button onClick={() => scrollTo('process')}>Comment ça marche</button>
                        <button onClick={() => scrollTo('map')}>Campus</button>
                        <button onClick={() => scrollTo('impact')}>Notre Impact</button>
                        <button onClick={() => navigate('/register')}>Déposer</button>
                    </div>
                    <div className={styles.navActions}>
                        <button id="nav-login" className={styles.navLogin} onClick={() => navigate('/login')}>Connexion</button>
                        <button id="nav-signup" className={styles.navSignup} onClick={() => navigate('/register')}>CRÉER UN COMPTE</button>
                    </div>
                </div>
            </nav>

            <section id="hero" className={styles.heroCarousel}>
                <div className={styles.carouselWrapper}>
                    <button className={styles.navArrowPrev} onClick={handlePrev} aria-label="Slide Précédente">
                        <ChevronLeft size={24} />
                    </button>

                    <div className={styles.heroBanner} style={{ background: currentSlideData.bg }}>
                        <SlideDecoration slideIndex={slide} />

                        {slide === 2 && (
                            <div className={styles.tealStaticAssets}>
                                <div className={styles.heroTealTexture} />
                                <div className={`${styles.dotGrid} ${styles.dotGridTopLeft}`} />
                                <div className={`${styles.dotGrid} ${styles.dotGridBottomRight}`} />
                                <div className={`${styles.floatingPlus} ${styles.floatingPlus1}`}>+</div>
                                <div className={`${styles.floatingPlus} ${styles.floatingPlus2}`}>x</div>
                                <img src={phoneIllustration} alt="Téléphone app yTera" className={styles.phoneIllustration} />
                                <div className={styles.calendarWrapper}>
                                    <img src={examCalendar} alt="Calendrier Examens" className={styles.examCalendar} />
                                </div>
                                <img src={thinkingWoman} alt="Étudiante qui réfléchit" className={styles.womanImage} />
                                <img src={thoughtBubble} alt="Bulle de pensée livres" className={styles.thoughtBubble} />
                                <img src={solidaireLabel} alt="Label Emprunt Solidaire" className={styles.empruntBadge} />
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={slide}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className={`${styles.bannerContent} ${currentSlideData.isFlipped ? styles.bannerContentFlipped : ''}`}
                            >
                                <div className={`${styles.bannerText} ${currentSlideData.textClass || ''}`}>
                                    <h1 className={`${styles.bannerTitle} ${currentSlideData.titleClass || ''}`} style={{ color: currentSlideData.titleColor || currentSlideData.textColor }}>
                                        {slide === 2 ? (
                                            <>
                                                EXAMENS PROCHES ?<br />
                                                RÉVISEZ SANS<br />
                                                VOUS <span style={{ position: 'relative', display: 'inline-block' }}>
                                                    RUINER !
                                                    <svg className={styles.sketchyUnderline} viewBox="0 0 100 12" preserveAspectRatio="none">
                                                        <path d="M5,7 Q25,2 45,8 T85,5" stroke="#FACC15" strokeWidth="3" fill="none" strokeLinecap="round" />
                                                    </svg>
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                {currentSlideData.titleParts[0]}
                                                <br />
                                                <span className={styles.bannerHighlight} style={{
                                                    background: currentSlideData.highlightBg,
                                                    color: currentSlideData.highlightColor,
                                                    transform: `rotate(${currentSlideData.highlightRotate})`,
                                                    fontFamily: currentSlideData.highlightFont
                                                }}>
                                                    {currentSlideData.titleParts[1]}
                                                </span>
                                                {currentSlideData.titleParts[2] && <><br />{currentSlideData.titleParts[2]}</>}
                                            </>
                                        )}
                                    </h1>
                                    <p className={styles.bannerSubtitle} style={{ color: currentSlideData.subtitleColor || currentSlideData.textColor, opacity: 0.9 }}>
                                        {currentSlideData.subtitle}
                                    </p>
                                    <button
                                        className={`${styles.bannerCta} ${slide === 1 ? styles.bannerCtaRect : ''}`}
                                        onClick={() => navigate('/register')}
                                        style={{ background: currentSlideData.ctaBg, color: currentSlideData.ctaColor }}
                                    >
                                        {currentSlideData.cta}
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                                <div className={styles.bannerHeroVisual}>
                                    {slide !== 2 && (
                                        <>
                                            {slide === 0 && (
                                                <>
                                                    <div className={styles.occasionBadge}>
                                                        <span className={styles.occasionText}>d'occasion</span>
                                                        <svg className={styles.occasionArrow} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M20,20 C40,10 70,30 50,60 C30,90 80,90 90,80" stroke="#1A0F2E" strokeWidth="3" fill="none" pathLength="1" className={styles.sketchPath} />
                                                            <path d="M85,75 L95,85 L80,90" stroke="#1A0F2E" strokeWidth="3" fill="none" pathLength="1" className={styles.sketchPathArrowhead} />
                                                        </svg>
                                                    </div>
                                                    <div className={styles.discountBadge}>
                                                        <svg className={styles.sketchCircle} viewBox="0 0 100 100">
                                                            <path d="M50,10 C20,10 10,40 10,60 C10,85 40,95 70,85 C95,75 95,30 70,15 C60,10 40,10 30,15" stroke="#FF5722" strokeWidth="3" fill="none" />
                                                        </svg>
                                                        <span className={styles.discountValue}>-70%</span>
                                                        <span className={styles.discountLabel}>du prix initial</span>
                                                    </div>
                                                    <div className={styles.moinscherLabel}>
                                                        <span>moins cher</span>
                                                        <svg className={styles.squigglyLine} viewBox="0 0 100 20">
                                                            <path d="M5,15 Q25,5 50,15 T95,15" stroke="#3B82F6" strokeWidth="2" fill="none" />
                                                        </svg>
                                                    </div>
                                                    <div className={styles.premiumStamp}>
                                                        <svg viewBox="0 0 100 100">
                                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#EA580C" strokeWidth="2" strokeDasharray="5,3" />
                                                            <text x="50" y="45" textAnchor="middle" fontSize="10" fill="#EA580C" fontWeight="bold">SATISFAIT</text>
                                                            <text x="50" y="60" textAnchor="middle" fontSize="10" fill="#EA580C" fontWeight="bold">OU ÉCHANGÉ</text>
                                                        </svg>
                                                    </div>
                                                    <img src={livresIllustration} alt="Main tenant une pile de manuels" className={styles.realBooksImage} />
                                                </>
                                            )}
                                            {slide === 1 && (
                                                <>
                                                    <div className={styles.groundCement} />
                                                    <div className={styles.megaphoneLight} />
                                                    <div className={styles.gratuitBadge}>
                                                        <span className={styles.gratuitText}>c'est gratuit</span>
                                                        <svg className={styles.gratuitArrow} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M20,20 C40,10 70,30 50,60 C30,90 80,90 90,80" stroke="#FACC15" strokeWidth="3" fill="none" />
                                                            <path d="M85,75 L95,85 L80,90" stroke="#FACC15" strokeWidth="3" fill="none" />
                                                        </svg>
                                                    </div>
                                                    <img src={megaphoneWoman} alt="Étudiante avec un mégaphone" className={styles.megaphoneWomanStudio} />
                                                </>
                                            )}
                                            {slide === 3 && (
                                                <img src={heroMascot} alt="Mascotte yTera" className={`${styles.megaphoneWomanStudio} ${currentSlideData.mascotClass || ''}`} style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }} />
                                            )}
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className={styles.paginationPill}>
                            {SLIDES.map((_, index) => (
                                <div key={index} className={`${styles.pDot} ${slide === index ? styles.pDotActive : ''}`} onClick={() => setSlide(index)} />
                            ))}
                        </div>
                    </div>

                    <button className={styles.navArrowNext} onClick={handleNext} aria-label="Slide Suivante">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </section>

            <section id="books" className={styles.bestSellers}>
                <Reveal>
                    <div className={styles.bestSellersHeader}>
                        <h2 className={styles.sectionTitleLeft}>Suggestions pour vous</h2>
                        <div className={styles.headerNavGroup}>
                            <button className={styles.viewAllButton} onClick={() => setShowModal(true)}>
                                Voir tout <ChevronRight size={18} />
                            </button>
                            <div className={styles.sliderNavButtons}>
                                <button className={styles.navArrow} onClick={() => scrollSlider('left')}>
                                    <ChevronLeft size={24} />
                                </button>
                                <button className={styles.navArrow} onClick={() => scrollSlider('right')}>
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <div className={styles.bestSellersSlider} ref={bookSliderRef}>
                    {TEASER_BOOKS.map((b, i) => (
                        <div key={b.id} className={styles.sliderItem}>
                            <Reveal delay={i * 0.05}>
                                <div className={styles.bestBookCard} onClick={() => setShowModal(true)}>
                                    <div className={styles.bestBookImgWrap}>
                                        <img src={b.photo} alt={b.titre} loading="lazy" />
                                        <div className={styles.floatingBadge} style={{ color: TYPE_COLORS[b.type] }}>
                                            {TYPE_LABELS[b.type]}
                                        </div>
                                        <div className={styles.actionButtons}>
                                            <button className={styles.actionBtn}><Eye size={16} /></button>
                                            <button className={styles.actionBtn}><Heart size={16} /></button>
                                        </div>
                                    </div>
                                    <div className={styles.bestBookInfoMinimal}>
                                        <h4 className={styles.bestBookTitle}>{b.titre}</h4>
                                        <div className={styles.bestBookPriceMinimal}>
                                            {b.prix ? (
                                                <span className={styles.priceTag}>{b.prix} DH</span>
                                            ) : (
                                                <span className={styles.freeTag}>Gratuit</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    ))}
                </div>
            </section>

            <HowItWorksStepper id="process" />
            <ProximityMap id="map" />
            <ImpactSection id="impact" />

            <section className={styles.ctaFinal}>
                <div className={styles.ctaCardsRow}>
                    <Reveal delay={0.1}>
                        <div className={styles.benefitCard}>
                            <div className={styles.cardIcon}><DollarSign size={24} /></div>
                            <h3>Vends tes livres</h3>
                            <p>Gagne de l'argent et libère de l'espace sur tes étagères facilement.</p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.2}>
                        <div className={styles.benefitCard}>
                            <div className={styles.cardIcon}><Users size={24} /></div>
                            <h3>Échange solidaire</h3>
                            <p>Troc tes anciens manuels contre ceux dont tu as besoin, 100% gratuit.</p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.3}>
                        <div className={styles.benefitCard}>
                            <div className={styles.cardIcon}><TrendingUp size={24} /></div>
                            <h3>Achete à prix mini</h3>
                            <p>Accède aux meilleurs manuels d'occasion jusqu'à -70% du prix neuf.</p>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={0.5}>
                    <div className={styles.finalCtaWrapper}>
                        <button className={styles.ctaPrimary} onClick={() => navigate('/register')}>
                            Rejoindre la communauté <ArrowRight size={20} />
                        </button>
                    </div>
                </Reveal>
            </section>

            <section className={styles.guaranteeSection}>
                <Reveal>
                    <div className={styles.guaranteeMinimal}>
                        <div className={styles.guaranteeHeaderCompact}>
                            <ShieldCheck size={20} className={styles.guaranteeIconMain} />
                            <h3>La Garantie <span style={{ color: '#FF5722' }}>y</span>Tera</h3>
                        </div>
                        <div className={styles.guaranteeGrid}>
                            <div className={styles.guaranteeItem}>
                                <Star size={18} />
                                <span>Profils étudiants vérifiés</span>
                            </div>
                            <div className={styles.guaranteeItem}>
                                <Users size={18} />
                                <span>Communauté d'entraide active</span>
                            </div>
                            <div className={`${styles.guaranteeItem} ${styles.textSuccess}`}>
                                <ShieldCheck size={18} />
                                <span>Zéro frais de commission</span>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerGrid}>
                        <div className={styles.footerColumn}>
                            <YTeraLogo size={20} />
                            <p>La première plateforme solidaire d'échange de manuels scolaires au Maroc. <strong>Fait par des étudiants, pour des étudiants.</strong></p>
                        </div>
                        <div className={styles.footerColumn}>
                            <h4>Catalogue</h4>
                            <ul className={styles.footerList}>
                                <li><a href="#books">Médecine</a></li>
                                <li><a href="#books">Ingénierie</a></li>
                                <li><a href="#books">Droit & Économie</a></li>
                                <li><a href="#books">Classes Préparatoires</a></li>
                            </ul>
                        </div>
                        <div className={styles.footerColumn}>
                            <h4>Plateforme</h4>
                            <ul className={styles.footerList}>
                                <li><a href="#process">Comment ça marche</a></li>
                                <li><a href="#impact">Notre Impact</a></li>
                                <li><a href="#hero">Vendre un livre</a></li>
                            </ul>
                        </div>
                        <div className={styles.footerColumn}>
                            <h4>Communauté</h4>
                            <ul className={styles.footerList}>
                                <li><a href="#">Centre d'aide</a></li>
                                <li><a href="#">Charte de confiance</a></li>
                                <li><a href="#">Contactez-nous</a></li>
                                <li><a href="#">Instagram</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.footerBottom}>
                        <span>© 2026 yTera — Tous droits réservés.</span>
                        <div className={styles.footerLegal}>
                            <a href="#" style={{ marginRight: '1.5rem', color: 'inherit' }}>Mentions légales</a>
                            <a href="#" style={{ color: 'inherit' }}>Confidentialité</a>
                        </div>
                    </div>
                </div>
            </footer>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <motion.div className={styles.modalBox} onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className={styles.modalIcon}><Heart size={32} /></div>
                        <h3>Hey, crée-toi un compte d'abord</h3>
                        <p>C'est gratuit, ça prend 30 secondes, et tu pourras chercher, contacter et publier librement.</p>
                        <div className={styles.modalActions}>
                            <button className={styles.modalPrimary} onClick={() => navigate('/register')}>
                                C'est parti ! <ArrowRight size={16} />
                            </button>
                            <button className={styles.modalSecondary} onClick={() => setShowModal(false)}>Je regarde encore un peu</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
