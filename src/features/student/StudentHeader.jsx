import { useState, useEffect } from 'react';
import { Bell, Plus, User, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import YTeraLogo from '../../components/common/YTeraLogo';
import styles from './StudentHeader.module.css';

export default function StudentHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);

    // Dynamic notification polling every 15 seconds (mock)
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulated API call — later replace with: fetch('/api/notifications/count')
            const randomNew = Math.floor(Math.random() * 2); // 0 or 1 new notification
            setUnreadCount(prev => prev + randomNew);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

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
                    <button className={styles.publishBtn} onClick={() => {}}>
                        <Plus size={18} />
                        <span>Publier une annonce</span>
                    </button>

                    <button className={styles.notifBtn} onClick={() => setUnreadCount(0)}>
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                    </button>

                    <div className={styles.profileWrapper}>
                        <button className={styles.profileBtn} onClick={() => setShowProfileMenu(!showProfileMenu)}>
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
