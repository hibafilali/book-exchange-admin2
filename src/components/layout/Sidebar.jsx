import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, ShieldAlert, Settings, LogOut } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useAuth } from '../../features/auth/useAuth';
import YTeraLogo from '../common/YTeraLogo';

const NAV_ITEMS = [
    { path: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Utilisateurs', icon: Users },
    { path: '/admin/annonces', label: 'Annonces', icon: BookOpen },
    { path: '/admin/moderation', label: 'Modération', icon: ShieldAlert },
    { path: '/admin/settings', label: 'Paramètres', icon: Settings },
];

export default function Sidebar() {
    const { logout } = useAuth();

    return (
        <aside className={`${styles.sidebar}`}>
            <div className={styles.logoContainer}>
                <YTeraLogo size={22} showSlogan={false} />
            </div>

            <nav className={styles.navMenu}>
                <p className={styles.menuLabel}>MENU PRINCIPAL</p>
                <ul className={styles.navList}>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.path === '/admin'}
                                    className={({ isActive }) =>
                                        `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                                    }
                                >
                                    <Icon size={20} className={styles.navIcon} />
                                    <span>{item.label}</span>
                                    <div className={styles.activeIndicator} />
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className={styles.bottomSection}>
                <button className={styles.logoutBtn} onClick={logout}>
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}
