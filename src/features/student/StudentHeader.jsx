import { useState, useEffect } from 'react';
import { Bell, Plus, User, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import YTeraLogo from '../../components/common/YTeraLogo';
import styles from './StudentHeader.module.css';
import { notificationApi } from '../../api/client';
import { Clock, CheckCircle, XCircle, Info } from 'lucide-react';

const NOTIF_ICONS = {
    SUCCESS: <CheckCircle size={16} style={{ color: '#22c55e' }} />,
    ERROR: <XCircle size={16} style={{ color: '#ef4444' }} />,
    INFO: <Info size={16} style={{ color: '#3b82f6' }} />
};

export default function StudentHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifMenu, setShowNotifMenu] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    // Actual user ID (1 by default as per requirements)
    const userId = user?.id || 1;

    // Fetch real unread count
    const fetchUnreadCount = async () => {
        try {
            const { data } = await notificationApi.getUnreadCount(userId);
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Fetch notifications list
    const fetchNotifications = async () => {
        try {
            const { data } = await notificationApi.getByUserId(userId);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [userId]);

    const handleNotifItemClick = async (notif) => {
        if (!notif.is_read) {
            try {
                await notificationApi.markRead(notif.id);
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        setShowNotifMenu(false);

        if (notif.target_url) {
            navigate(notif.target_url);
        } else {
            // Default to dashboard
            navigate('/student-dashboard');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <div className={styles.logo} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <YTeraLogo size={20} showSlogan={false} />
                </div>

                <div className={styles.actions}>
                    <button className={styles.publishBtn} onClick={() => navigate('/student-dashboard/publish')}>
                        <Plus size={18} />
                        <span>Publier une annonce</span>
                    </button>

                    <div className={styles.notifWrapper}>
                        <button className={`${styles.notifBtn} ${showNotifMenu ? styles.active : ''}`} onClick={() => {
                            if (!showNotifMenu) fetchNotifications();
                            setShowNotifMenu(!showNotifMenu);
                            setShowProfileMenu(false);
                        }}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>

                        {showNotifMenu && (
                            <div className={styles.notifMenu}>
                                <div className={styles.notifHeader}>
                                    <h3>Notifications</h3>
                                </div>
                                <div className={styles.notifList}>
                                    {notifications.length === 0 ? (
                                        <div className={styles.emptyNotif}>Aucune notification</div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                className={`${styles.notifItem} ${!notif.is_read ? styles.notifUnread : ''}`}
                                                onClick={() => handleNotifItemClick(notif)}
                                                style={{ cursor: 'pointer' }}
                                            >
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
                            </div>
                        )}
                    </div>

                    <div className={styles.profileWrapper}>
                        <button className={styles.profileBtn} onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}>
                            <div className={styles.avatar}><User size={18} /></div>
                            <span className={styles.userName}>{user?.name || 'Étudiant'}</span>
                        </button>

                        {showProfileMenu && (
                            <div className={styles.profileMenu}>
                                <button onClick={() => setShowProfileMenu(false)}><User size={16} /> Mon Profil</button>
                                <button onClick={handleLogout}><LogOut size={16} /> Déconnexion</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
