import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Bell, LogOut, Plus, LayoutDashboard, MessageSquare, Shield, ShieldAlert, Lock, Eye, EyeOff, Save, X, Clock, CheckCircle, XCircle, Info, Library } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';
import { notificationApi } from '../../api/client';
import YTeraLogo from '../../components/common/YTeraLogo';

const NOTIF_ICONS = {
    SUCCESS: <CheckCircle size={16} style={{ color: '#22c55e' }} />,
    ERROR: <XCircle size={16} style={{ color: '#ef4444' }} />,
    INFO: <Info size={16} style={{ color: '#3b82f6' }} />
};
import styles from './StudentLayout.module.css';

export default function StudentLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfile, setShowProfile] = useState(false);
    
    // Notification state
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    
    const [navSearch, setNavSearch] = useState('');
    const [searchFilter, setSearchFilter] = useState('all');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
    const searchInputRef = React.useRef(null);

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleNavSearch = (e) => {
        if (e.key === 'Enter' && navSearch.trim()) {
            navigate(`/student-dashboard/search?q=${encodeURIComponent(navSearch.trim())}&filter=${searchFilter}`);
            setNavSearch('');
            searchInputRef.current?.blur();
        }
    };

    // --- Notification Logic ---
    const userId = user?.id || 1;

    const fetchUnreadCount = async () => {
        try {
            const { data } = await notificationApi.getUnreadCount(userId);
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await notificationApi.getByUserId(userId);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    React.useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => clearInterval(interval);
    }, [userId]);

    const handleNotifClick = () => {
        if (!showNotifMenu) {
            fetchNotifications();
            if (unreadCount > 0) {
                notificationApi.markAllAsRead(userId).then(() => setUnreadCount(0));
            }
        }
        setShowNotifMenu(!showNotifMenu);
        setShowProfile(false);
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) {
            toast.error("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }
        if (passData.new.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Mise à jour du mot de passe...',
                success: 'Mot de passe mis à jour avec succès !',
                error: 'Erreur lors de la mise à jour.',
            }
        ).then(() => {
            setShowPasswordModal(false);
            setPassData({ old: '', new: '', confirm: '' });
        });
    };

    return (
        <div className={styles.layout}>
            {/* ——— Translucent Navbar ——— */}
            <motion.nav
                className={styles.navbar}
                initial={{ y: -80 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <div className={styles.navInner}>
                    {/* Logo */}
                    <div className={styles.logo} onClick={() => navigate('/student-dashboard')}>
                        <YTeraLogo size={20} />
                    </div>

                    {/* Global Search (Always Visible, with Focus Overlay & Filters) */}
                    <div className={`${styles.searchBar} ${isSearchFocused ? styles.searchBarFocused : ''}`}>
                        <select 
                            className={styles.searchSelect} 
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        >
                            <option value="all">Toute la plateforme</option>
                            <option value="title">Titre</option>
                            <option value="filiere">Filière</option>
                        </select>
                        <div className={styles.searchDivider}></div>
                        <Search size={18} className={styles.searchIcon} />
                        <input 
                            ref={searchInputRef}
                            className={styles.searchInput}
                            type="text" 
                            placeholder="Rechercher des manuels..." 
                            value={navSearch} 
                            onChange={e => setNavSearch(e.target.value)} 
                            onKeyDown={handleNavSearch} 
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                        <kbd className={styles.searchShortcut}>
                            ⌘ K
                        </kbd>
                    </div>

                    {/* Overlay d'assombrissement (Focus Effect) */}
                    {isSearchFocused && <div className={styles.searchOverlay} onClick={() => searchInputRef.current?.blur()}></div>}

                    {/* Actions */}
                    <div className={styles.actions}>
                        <button className={styles.dashboardBtn} onClick={() => navigate('/student-dashboard/messages')} title="Messagerie">
                            <MessageSquare size={16} /> <span className={styles.hideOnMobile}>Messages</span>
                        </button>

                        <button className={styles.dashboardBtn} onClick={() => navigate('/student-dashboard/dashboard')} title="Mon Tableau de Bord">
                            <LayoutDashboard size={16} /> <span className={styles.hideOnMobile}>Dashboard</span>
                        </button>

                        <button className={styles.publishBtn} onClick={() => navigate('/student-dashboard/publish')}>
                            <Plus size={16} /> <span className={styles.hideOnMobile}>Publier</span>
                        </button>

                        <div className={styles.notifWrapper}>
                            <button className={`${styles.iconBtn} ${showNotifMenu ? styles.active : ''}`} onClick={handleNotifClick}>
                                <Bell size={19} />
                                {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
                            </button>

                            <AnimatePresence>
                                {showNotifMenu && (
                                    <motion.div className={styles.notifMenu}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <div className={styles.notifHeader}>
                                            <h3>Notifications</h3>
                                        </div>
                                        <div className={styles.notifList}>
                                            {notifications.length === 0 ? (
                                                <div className={styles.emptyNotif}>Aucune notification</div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div key={notif.id} className={`${styles.notifItem} ${!notif.is_read ? styles.notifUnread : ''}`}>
                                                        <div className={styles.notifIcon}>
                                                            {NOTIF_ICONS[notif.type] || <Info size={16} />}
                                                        </div>
                                                        <div className={styles.notifContent}>
                                                            <p className={styles.notifTitle}>{notif.titre}</p>
                                                            <p className={styles.notifMessage}>{notif.message}</p>
                                                            <span className={styles.notifDate}>
                                                                <Clock size={12} /> {new Date(notif.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className={styles.profileWrap}>
                            <button className={styles.avatarBtn} onClick={() => { setShowProfile(!showProfile); setShowNotifMenu(false); }}>
                                <div className={styles.avatar}>
                                    <img 
                                        src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${user?.nom || user?.name || 'Etudiant'}&background=random`} 
                                        alt="Profil" 
                                        className={styles.avatarImg}
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=User&background=random"; }}
                                    />
                                </div>
                            </button>
                            {showProfile && (
                                <motion.div className={styles.profileMenu}
                                    key="profile-menu"
                                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className={styles.profileHeader}>
                                        <strong>{user?.name || 'Étudiant'}</strong>
                                        <span>{user?.email || 'etudiant@ytera.ma'}</span>
                                    </div>
                                    <button onClick={() => { setShowProfile(false); navigate('/student-dashboard/dashboard'); }}><User size={15} /> Mon Profil</button>
                                    <button onClick={() => { setShowProfile(false); navigate('/student-dashboard/library'); }}><Library size={15} /> Ma Bibliothèque</button>
                                    <button onClick={() => { setShowPasswordModal(true); setShowProfile(false); }}><Shield size={15} /> Sécurité</button>
                                    <button onClick={() => { setShowProfile(false); navigate('/student-dashboard/support'); }}><ShieldAlert size={15} /> Support & Signalements</button>
                                    <div className={styles.menuDivider}></div>
                                    <button onClick={() => { logout(); navigate('/login'); }}><LogOut size={15} /> Déconnexion</button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* GLOBAL PASSWORD MODAL */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className={styles.modalOverlay} key="password-modal-overlay">
                        <motion.div 
                            className={styles.passwordModal}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <div className={styles.modalHeader}>
                                <div className={styles.modalTitleIcon}><Lock size={20} /></div>
                                <div>
                                    <h3>Changer de mot de passe</h3>
                                    <p>Protégez l'accès à votre compte yTera.</p>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setShowPasswordModal(false)}><X size={20} /></button>
                            </div>

                            <form onSubmit={handlePasswordUpdate} className={styles.passwordForm}>
                                <div className={styles.inputField}>
                                    <label>Ancien mot de passe</label>
                                    <div className={styles.passInputWrapper}>
                                        <input 
                                            type={showPass ? "text" : "password"} 
                                            placeholder="Mot de passe actuel"
                                            required
                                            value={passData.old}
                                            onChange={(e) => setPassData({...passData, old: e.target.value})}
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)}>
                                            {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formDivider}></div>

                                <div className={styles.inputField}>
                                    <label>Nouveau mot de passe</label>
                                    <input 
                                        type="password" 
                                        placeholder="Min. 6 caractères"
                                        required
                                        value={passData.new}
                                        onChange={(e) => setPassData({...passData, new: e.target.value})}
                                    />
                                </div>

                                <div className={styles.inputField}>
                                    <label>Confirmer le nouveau mot de passe</label>
                                    <input 
                                        type="password" 
                                        placeholder="Confirmer"
                                        required
                                        value={passData.confirm}
                                        onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                                    />
                                </div>

                                <div className={styles.modalFooter}>
                                    <button type="button" className={styles.secondaryBtn} onClick={() => setShowPasswordModal(false)}>Annuler</button>
                                    <button type="submit" className={styles.primaryBtn}><Save size={16}/> Mettre à jour</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ——— Content ——— */}
            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}
