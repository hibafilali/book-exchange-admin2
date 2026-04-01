import { useState, useRef } from 'react';
import { 
    User, Shield, Save, Camera, 
    Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/useAuth';
import styles from './Settings.module.css';

export default function Settings() {
    const { user, updateAvatar } = useAuth();
    const [activeTab, setActiveTab] = useState('Profile');
    const fileInputRef = useRef(null);

    const tabs = [
        { id: 'Profile', label: 'Mon Profil', icon: User },
        { id: 'Security', label: 'Sécurité', icon: Shield },
        { id: 'System', label: 'Système', icon: SettingsIcon },
    ];

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            updateAvatar(url);
        }
    };

    const tabVariants = {
        hidden: { opacity: 0, x: 10 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
        exit: { opacity: 0, x: -10, transition: { duration: 0.15 } }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Paramètres</h1>
                </div>
            </header>

            <div className={styles.content}>
                <aside className={styles.sidebar}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={`${styles.tabBtn} ${isActive ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </aside>

                <main className={styles.mainBoard}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={styles.tabContent}
                        >
                            <div className={styles.formContainer}>
                                {activeTab === 'Profile' && (
                                    <div className={styles.formSection}>
                                        <div className={styles.profileHeader}>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                style={{ display: 'none' }} 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            <div 
                                                className={styles.avatarWrapper} 
                                                onClick={handleAvatarClick}
                                                style={{ cursor: 'pointer' }}
                                                title="Cliquez pour changer la photo"
                                            >
                                                <img 
                                                    src={user?.avatar || 'https://i.pravatar.cc/150?u=admin'} 
                                                    alt="Avatar" 
                                                    className={styles.avatar} 
                                                />
                                                <div className={styles.avatarEditBadge}>
                                                    <Camera size={14} />
                                                </div>
                                            </div>
                                            <div className={styles.profileIntro}>
                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Photo de profil</h3>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Admin@yTera.ma • Fès, Maroc</p>
                                            </div>
                                        </div>

                                        <div className={styles.inputGrid}>
                                            <div className={styles.inputGroup}>
                                                <label>Nom complet</label>
                                                <input type="text" defaultValue="Admin Demo" />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Numéro de téléphone</label>
                                                <input type="text" defaultValue="+212 661 23 45 67" />
                                            </div>
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label>Email professionnel</label>
                                            <input type="email" defaultValue="admin@ytera.ma" />
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label>Rôle</label>
                                            <input type="text" defaultValue="Superadministrateur" disabled />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Security' && (
                                    <div className={styles.formSection}>
                                        <div className={styles.passwordGrid}>
                                            <div className={styles.inputGroup}>
                                                <label>Nouveau mot de passe</label>
                                                <input type="password" placeholder="••••••••" />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Confirmer le mot de passe</label>
                                                <input type="password" placeholder="••••••••" />
                                            </div>
                                        </div>
                                        
                                        <div className={styles.securityLog}>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                Dernière connexion : Aujourd'hui à 14:22 (IP: 196.200.44.12)
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'System' && (
                                    <div className={styles.formSection}>
                                        <div className={styles.toggleGroup}>
                                            <div className={styles.toggleInfo}>
                                                <span>Validation manuelle des annonces</span>
                                                <p className={styles.toggleDesc}>Toutes les nouvelles annonces doivent être approuvées.</p>
                                            </div>
                                            <label className={styles.switch}>
                                                <input type="checkbox" defaultChecked />
                                                <span className={styles.slider}></span>
                                            </label>
                                        </div>

                                        <div className={styles.numericGrid}>
                                            <div className={styles.inputGroup}>
                                                <label>Limite d'annonces / utilisateur</label>
                                                <input type="number" defaultValue="25" />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label>Limite de photos / annonce</label>
                                                <input type="number" defaultValue="5" />
                                            </div>
                                        </div>

                                        <div className={styles.toggleGroup}>
                                            <div className={styles.toggleInfo}>
                                                <span>Inscriptions ouvertes</span>
                                                <p className={styles.toggleDesc}>Autoriser les nouveaux étudiants à s'inscrire.</p>
                                            </div>
                                            <label className={styles.switch}>
                                                <input type="checkbox" defaultChecked />
                                                <span className={styles.slider}></span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.formFooter}>
                                    <button className={styles.saveBtn}>
                                        <Save size={18} /> Enregistrer les modifications
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
