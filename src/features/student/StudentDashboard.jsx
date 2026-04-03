import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Leaf, BookHeart, Plus, Edit2, Trash2, CheckCircle,
    Clock, XCircle, Bell, MessageSquare, ExternalLink, ShieldCheck, Send, Sparkles,
    Calendar, MapPin, Camera, Save, X
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useFavorites } from '../../context/FavoritesContext';
import { bookApi, dashboardApi } from '../../api/client';
import ManualCard from './ManualCard';
import styles from './StudentDashboard.module.css';

// Status badge mapping - matching DB ENUMs: 'ACTIF', 'ATTENTE', 'EXPIREE'
const STATUS_STYLES = {
    ACTIF:   { bg: 'rgba(16,185,129,0.15)', color: '#10b981', icon: CheckCircle, label: 'En ligne' },
    ATTENTE: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', icon: Clock,       label: 'En revue' },
    EXPIREE: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: XCircle,     label: 'Expirée' },
};

// ============================
// MAIN COMPONENT
// ============================
export default function StudentDashboard() {
    const { user, updateAvatar, updateName } = useAuth();
    const { favoritedIds } = useFavorites();
    const navigate = useNavigate();
    
    const [allBooks, setAllBooks] = useState([]);
    const [dashboardFeatures, setDashboardFeatures] = useState({ stats: null, actions: [], appointments: [], wishes: [] });
    const [isLoading, setIsLoading] = useState(true);
    
    const [myAnnonces, setMyAnnonces] = useState([]);
    const [activeFilter, setActiveFilter] = useState('Tous');
    
    // Profile Logic
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(user?.name || '');
    const fileInputRef = useRef(null);

    // Fetch Books & Dashboard Features from Backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [myBooksRes, allBooksRes, featuresRes] = await Promise.all([
                    bookApi.getMy(),
                    bookApi.getAll(),
                    dashboardApi.getStats(user?.id || 1)
                ]);
                setAllBooks(allBooksRes.data || []);
                setDashboardFeatures(featuresRes.data);
                setMyAnnonces(myBooksRes.data || []);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const favoritedBooks = allBooks.filter(b => favoritedIds.includes(b.id));

    const onlineCount = myAnnonces.filter(a => a.status === 'ACTIF').length;
    const pendingCount = myAnnonces.filter(a => a.status === 'ATTENTE').length;

    const filteredAnnonces = activeFilter === 'Tous' 
        ? myAnnonces 
        : activeFilter === 'En ligne' 
            ? myAnnonces.filter(a => a.status === 'ACTIF')
            : myAnnonces.filter(a => a.status === 'ATTENTE');

    const handleAvatarClick = () => fileInputRef.current?.click();
    
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            updateAvatar(url);
        }
    };

    const handleSaveName = () => {
        if (tempName.trim()) {
            updateName(tempName.trim());
            setIsEditing(false);
        }
    };

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className={styles.page}>
            <div className={styles.meshBg}></div>

            <div className={styles.container}>
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                    
                    {/* ——— INTERACTIVE PROFILE HEADER ——— */}
                    <motion.div className={styles.dashboardHeader} variants={itemVariants}>
                        <div className={styles.profileSection}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            <div className={styles.avatarContainer} onClick={handleAvatarClick} title="Changer ma photo">
                                <img 
                                    src={user?.avatar || 'https://i.pravatar.cc/120?u=hiba'} 
                                    className={styles.profileImg} 
                                    alt="Profil" 
                                />
                                <div className={styles.cameraOverlay}>
                                    <Camera size={14} />
                                </div>
                            </div>
                            <div className={styles.welcomeText}>
                                <div className={styles.nameHeader}>
                                    {isEditing ? (
                                        <div className={styles.editNameGroup}>
                                            <input 
                                                type="text" 
                                                value={tempName} 
                                                onChange={(e) => setTempName(e.target.value)}
                                                className={styles.nameInput}
                                                autoFocus
                                            />
                                            <button onClick={handleSaveName} className={styles.saveBtn}><Save size={16} /></button>
                                            <button onClick={() => { setIsEditing(false); setTempName(user?.name); }} className={styles.cancelBtn}><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <div className={styles.displayNameGroup}>
                                            <h1>Bienvenue, {user?.name?.split(' ')[0] || 'Étudiant'} !</h1>
                                            <button onClick={() => setIsEditing(true)} className={styles.editBtn}><Edit2 size={16} /></button>
                                        </div>
                                    )}
                                </div>
                                <p>Gérez votre bibliothèque et suivez vos échanges avec la communauté yTera.</p>
                            </div>
                        </div>
                        <div className={styles.headerActions}>
                            <button className={styles.btnSecondary} onClick={() => navigate('/student-dashboard/search')}>
                                <BookHeart size={18} /> Explorer le catalogue
                            </button>
                            <button className={styles.btnPrimary} onClick={() => navigate('/student-dashboard/publish')}>
                                <Plus size={18} /> Créer une annonce
                            </button>
                        </div>
                    </motion.div>


                    {/* ——— SPLIT CONTROL CENTER (65/35) ——— */}
                    <div className={styles.splitGrid}>
                        
                        {/* === COLONNE GAUCHE (65%) === */}
                        <div className={styles.leftCol}>
                            <motion.div className={styles.panel} variants={itemVariants}>
                                <div className={styles.panelHeader}>
                                    <h2>Mon Inventaire Actif</h2>
                                    <div className={styles.panelFilters}>
                                        <button 
                                            className={activeFilter === 'Tous' ? styles.filterPillActive : styles.filterPill}
                                            onClick={() => setActiveFilter('Tous')}
                                        >
                                            Tous
                                        </button>
                                        <button 
                                            className={activeFilter === 'En ligne' ? styles.filterPillActive : styles.filterPill}
                                            onClick={() => setActiveFilter('En ligne')}
                                        >
                                            En ligne ({onlineCount})
                                        </button>
                                        <button 
                                            className={activeFilter === 'En attente' ? styles.filterPillActive : styles.filterPill}
                                            onClick={() => setActiveFilter('En attente')}
                                        >
                                            En revue ({pendingCount})
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.inventoryList}>
                                    {isLoading ? (
                                        <div className={styles.loading}>Chargement...</div>
                                    ) : filteredAnnonces.length === 0 ? (
                                        <div className={styles.emptyInventory}>Aucune annonce dans cette catégorie.</div>
                                    ) : filteredAnnonces.map(listing => {
                                        const statusConfig = STATUS_STYLES[listing.status] || STATUS_STYLES['ATTENTE'];
                                        const StatusIcon = statusConfig.icon;
                                        
                                        return (
                                            <div key={listing.id} className={styles.inventoryCard}>
                                                <div className={styles.invImageWrap}>
                                                    <img 
                                                        src={
                                                            (listing.exemplaire?.photoUrl || listing.photoUrl)?.startsWith('/uploads')
                                                            ? `http://localhost:5000${listing.exemplaire?.photoUrl || listing.photoUrl}`
                                                            : (listing.exemplaire?.photoUrl || listing.photoUrl) || `https://via.placeholder.com/150/f4f4f5/64748b?text=${listing.exemplaire?.ouvrage?.titre?.substring(0,2) || 'AD'}`
                                                        } 
                                                        alt={listing.exemplaire?.ouvrage?.titre || 'Annonce'} 
                                                        onError={(e) => { 
                                                            if (!e.target.dataset.triedFallback) {
                                                                e.target.dataset.triedFallback = 'true';
                                                                e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=150&auto=format&fit=crop';
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className={styles.invContent}>
                                                    <div className={styles.invMain}>
                                                        <div className={styles.listingInfo}>
                                                            <h3>{listing.exemplaire?.ouvrage?.titre || 'Annonce générique'}</h3>
                                                            <div className={styles.listingMeta}>
                                                                <span className={styles.typeBadge} style={{ backgroundColor: listing.typeEchange === 'VENTE' ? '#F97316' : listing.typeEchange === 'PRET' ? '#06B6D4' : '#10B981' }}>{listing.typeEchange}</span>
                                                                <span className={styles.priceText}>{listing.typeEchange === 'VENTE' ? `${listing.prixVente} DH` : listing.typeEchange === 'DON' ? 'Gratuit' : 'Prêt'}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.invMeta}>
                                                            <span className={styles.invStatus} style={{ background: statusConfig.bg, color: statusConfig.color }}>
                                                                <StatusIcon size={12} /> {statusConfig.label}
                                                            </span>
                                                            <span className={styles.invViews}>• {listing.nbVues || 0} vues</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.invActions}>
                                                        {listing.status === 'EXPIREE' ? (
                                                            <button className={styles.btnActionPro}>Prolonger (+30j)</button>
                                                        ) : (
                                                            <button className={styles.btnActionSub}>Promouvoir (Boost)</button>
                                                        )}
                                                        <div className={styles.actionIcons}>
                                                            <button className={styles.btnActionIcon} title="Modifier"><Edit2 size={16} /></button>
                                                            <button className={styles.btnActionIconDanger} title="Archiver"><Trash2 size={16} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>

                            {/* Mes Favoris */}
                            <motion.div className={styles.panel} variants={itemVariants}>
                                <div className={styles.panelHeader}>
                                    <h2>Ma Liste d'Envies ({favoritedBooks.length})</h2>
                                </div>
                                {favoritedBooks.length > 0 ? (
                                    <div className={styles.favoritesGrid}>
                                        {favoritedBooks.map((b, i) => (
                                            <ManualCard 
                                                key={b.id} 
                                                annonce={b} 
                                                index={i}
                                                onCardClick={(ann) => navigate(`/student-dashboard/book/${ann.id}`)} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyFavorites}>
                                        <BookHeart size={40} className={styles.emptyFavIcon} />
                                        <p>Vous n'avez pas encore de favoris. Parcourez le catalogue pour en ajouter !</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* === COLONNE DROITE (35%) === */}
                        <div className={styles.rightCol}>
                            <motion.div className={styles.panelAction} variants={itemVariants}>
                                <div className={styles.panelActionHeader}>
                                    <h2>Actions Requises</h2>
                                    <span className={styles.pulseDot}></span>
                                </div>
                                <div className={styles.actionList}>
                                    {dashboardFeatures.actions.map(act => (
                                        <div key={act.id} className={styles.actionItem}>
                                            <div className={styles.actionTop}>
                                                <div className={styles.actionAvatar}>{act.avatar}</div>
                                                <div className={styles.actionText}>
                                                    <p><strong>{act.avec}</strong> a demandé <em>{act.livre}</em></p>
                                                    <span className={styles.actionTime}>{act.temps}</span>
                                                </div>
                                            </div>
                                            <div className={styles.actionBtns}>
                                                <button className={styles.btnAccept}><CheckCircle size={14} /> Accepter</button>
                                                <button className={styles.btnRefuse}><XCircle size={14} /> Refuser</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Impact Stats */}
                            <motion.div className={styles.panelImpact} variants={itemVariants}>
                                <div className={styles.panelImpactHeader}>
                                    <h2>Résumé d'Impact</h2>
                                    <TrendingUp size={16} color="var(--accent-color)" />
                                </div>
                                <div className={styles.impactRows}>
                                    <div className={styles.impactRow}>
                                        <div className={styles.impactIcon} style={{ background: '#ecfdf5', color: '#10b981' }}><TrendingUp size={14}/></div>
                                        <div className={styles.impactInfo}>
                                            <span className={styles.impactLabel}>Économies</span>
                                            <span className={styles.impactVal}>{dashboardFeatures.stats?.economies || 0} DH</span>
                                        </div>
                                    </div>
                                    <div className={styles.impactRow}>
                                        <div className={styles.impactIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}><BookHeart size={14}/></div>
                                        <div className={styles.impactInfo}>
                                            <span className={styles.impactLabel}>Livres Partagés</span>
                                            <span className={styles.impactVal}>{dashboardFeatures.stats?.livresPartages || 0}</span>
                                        </div>
                                    </div>
                                    <div className={styles.impactRow}>
                                        <div className={styles.impactIcon} style={{ background: '#fff1f2', color: '#ec4899' }}><Leaf size={14}/></div>
                                        <div className={styles.impactInfo}>
                                            <span className={styles.impactLabel}>Arbres Sauvés</span>
                                            <span className={styles.impactVal}>{dashboardFeatures.stats?.arbresSauves || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}
