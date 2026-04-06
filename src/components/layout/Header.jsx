import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { 
    Search, User, LogOut, Settings, 
    ChevronDown, Shield, Lock, Eye, EyeOff, X, Save,
    BellRing, ShieldAlert, BookPlus, Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { notificationApi } from '../../api/client';
import styles from './Header.module.css';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchFilter, setSearchFilter] = useState('all');
    const [showProfile, setShowProfile] = useState(false);
    
    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
    const profileRef = useRef();
    const notificationRef = useRef();

    // Notifications State
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchUnreadCount();
        }
    }, [user?.id]);

    const fetchUnreadCount = async () => {
        try {
            const res = await notificationApi.getUnreadCount(user.id);
            setUnreadCount(res.data.count);
        } catch (error) {
            console.error('Fetch unread count error:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await notificationApi.getByUserId(user.id);
            setNotifications(res.data);
            setShowNotifications(!showNotifications);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllAsRead(user.id);
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success("Toutes les notifications marquées comme lues.");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour.");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        
        // Simuler mise à jour
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

    const dropdownVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        },
        exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 25 }
        },
        exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.2 } }
    };

    return (
        <header className={styles.header}>
            <div className={styles.searchContainer}>
                <div className={styles.searchBar}>
                    <div className={styles.filterWrapper}>
                        <select 
                            className={styles.searchSelect}
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        >
                            <option value="all">Tout</option>
                            <option value="users">Utilisateurs</option>
                            <option value="ads">Annonces</option>
                        </select>
                        <ChevronDown size={14} className={styles.selectChevron} />
                    </div>
                    <div className={styles.searchDivider}></div>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Rechercher sur yTera..."
                        className={styles.searchInput}
                    />
                    <div className={styles.searchKbd}>⌘K</div>
                </div>
            </div>

            <div className={styles.rightSection}>
                {/* Notification Bell */}
                <div className={styles.dropdownContainer} ref={notificationRef}>
                    <button className={styles.iconBtn} onClick={fetchNotifications}>
                        <BellRing size={19} />
                        {unreadCount > 0 && (
                            <>
                                <span className={styles.badge}>{unreadCount}</span>
                                <div className={styles.pulseBadge}></div>
                            </>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div 
                                className={styles.notificationDropdown}
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <div className={styles.notifHeader}>
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button onClick={handleMarkAllRead} className={styles.markReadBtn}>
                                            <Check size={14} /> Tout lire
                                        </button>
                                    )}
                                </div>
                                <div className={styles.notifList}>
                                    {notifications.length === 0 ? (
                                        <div className={styles.emptyNotif}>
                                            <BellRing size={24} />
                                            <p>Aucune notification</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <div 
                                                key={n.id} 
                                                className={`${styles.notifItem} ${!n.is_read ? styles.unreadItem : ''}`}
                                                onClick={async () => {
                                                    if (!n.is_read) {
                                                        await notificationApi.markRead(n.id);
                                                        setUnreadCount(prev => Math.max(0, prev - 1));
                                                    }
                                                    if (n.target_url) {
                                                        navigate(n.target_url);
                                                    } else if (n.type === 'PLAINTE') {
                                                        navigate('/admin/moderation');
                                                    } else {
                                                        navigate(user?.role === 'ADMIN' ? '/admin' : '/student-dashboard');
                                                    }
                                                    setShowNotifications(false);
                                                }}
                                            >
                                                <div className={styles.notifIcon}>
                                                    {n.type === 'PLAINTE' ? <ShieldAlert size={16} color="#ef4444" /> : <BookPlus size={16} color="#3b82f6" />}
                                                </div>
                                                <div className={styles.notifContent}>
                                                    <p className={styles.notifTitle}>{n.titre}</p>
                                                    <p className={styles.notifMessage}>{n.message}</p>
                                                    <p className={styles.notifTime}>{new Date(n.created_at).toLocaleDateString()} à {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                                {!n.is_read && <div className={styles.unreadDot}></div>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Section */}
                <div className={styles.dropdownContainer} ref={profileRef}>
                    <button 
                        className={`${styles.avatarBtn} ${showProfile ? styles.activeAvatar : ''}`} 
                        onClick={() => setShowProfile(!showProfile)}
                    >
                        <div className={styles.avatarWrapper}>
                            <img 
                                src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${user?.nom || user?.name || 'Admin'}&background=random`}
                                alt="Profil" 
                                className={styles.avatarImg} 
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=User&background=random"; }}
                            />
                            <div className={styles.onlineDot}></div>
                        </div>
                        <div className={styles.userInfo}>
                            <p className={styles.userName}>{user?.name?.split(' ')[0] || 'Utilisateur'}</p>
                            <ChevronDown size={14} className={`${styles.chevron} ${showProfile ? styles.rotate : ''}`} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div 
                                className={styles.dropdownMenu}
                                variants={dropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <div className={styles.profileSummary}>
                                    <div className={styles.profileAvatarBig}>
                                        <img src={user?.avatar || 'https://i.pravatar.cc/150?u=admin'} alt="Profil" />
                                    </div>
                                    <div className={styles.profileText}>
                                        <p className={styles.pName}>{user?.name || 'Administrateur'}</p>
                                        <p className={styles.pRole}>{user?.role === 'ADMIN' ? 'Super-Admin yTera' : 'Étudiant yTera'}</p>
                                    </div>
                                </div>
                                <div className={styles.dropdownList}>
                            <button 
                                className={styles.menuActionBtn} 
                                onClick={() => { 
                                    if(user?.role === 'ADMIN') navigate('/admin');
                                    else navigate('/student-dashboard'); 
                                    setShowProfile(false); 
                                }}
                            >
                                        <User size={15} /> Mon Profil
                                    </button>
                                    <button 
                                        className={styles.menuActionBtn} 
                                        onClick={() => { setShowPasswordModal(true); setShowProfile(false); }}
                                    >
                                        <Shield size={15} /> Sécurité
                                    </button>
                                    <div className={styles.menuDivider}></div>
                                    <button className={`${styles.menuActionBtn} ${styles.logoutBtn}`} onClick={() => { logout(); setShowProfile(false); }}>
                                        <LogOut size={15} /> Déconnexion
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* GLOBAL PASSWORD MODAL */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className={styles.modalOverlay} key="password-modal-overlay">
                        <motion.div 
                            className={styles.passwordModal}
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
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
        </header>
    );
}
