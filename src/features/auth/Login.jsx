import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styles from './Login.module.css';
import { BookOpen, Lock, Mail, User, Shield, Loader2, ArrowRight } from 'lucide-react';
import YTeraLogo from '../../components/common/YTeraLogo';

export default function Login() {
    const [isStudent, setIsStudent] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const role = isStudent ? 'STUDENT' : 'ADMIN';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simuler un appel système
        await new Promise(r => setTimeout(r, 1200));

        const success = await login(email, password, role);
        setIsLoading(false);

        if (success) {
            toast.success(`Connexion réussie ! Bienvenue ${isStudent ? 'Étudiant' : 'Admin'}`, { duration: 3000 });
            if (role === 'ADMIN') {
                navigate('/');
            } else {
                navigate('/student-dashboard');
            }
        } else {
            toast.error("Identifiants invalides.");
            setError(`Identifiants invalides pour l'espace ${isStudent ? 'Étudiant' : 'Admin'}.`);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.noiseOverlay} />
            {/* LEFT SIDE: VISUAL area (Desktop only) */}
            <div className={styles.visualSide}>
                <div className={styles.visualContent}>

                    <motion.div
                        className={styles.illustrationWrapper}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        key={isStudent ? 'student' : 'admin'}
                    >
                        {isStudent ? (
                            <svg className={styles.illustration} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">
                                {/* Warm Light Orange Background */}
                                <circle cx="300" cy="200" r="150" fill="#FFF7ED" />
                                <path d="M180,250 C120,150 250,100 350,120 C480,140 500,280 400,380 C300,450 150,450 180,250 Z" fill="#FFF1E8" />

                                {/* Main Character Shapes - Navy & Slate (Stays) */}
                                <path d="M180,250 C150,180 200,120 280,150 C320,165 300,220 280,250 Z" fill="#4F46E5" />
                                <polygon points="120,150 160,150 140,110" fill="#FED7AA" />
                                <g transform="translate(250, 70) rotate(45)">
                                    <rect width="40" height="40" fill="#FFEDD5" />
                                </g>
                                <circle cx="160" cy="190" r="15" fill="none" stroke="#FF5722" strokeWidth="3" opacity="0.3" />
                                <polygon points="450,250 550,320 450,390" fill="none" stroke="#FB923C" strokeWidth="6" opacity="0.1" />
                                <polygon points="455,260 540,320 455,380" fill="#FFFFFF" />

                                {/* Accents - Book-In Orange & Warm tones */}
                                <rect x="330" y="320" width="100" height="20" fill="#FF5722" rx="4" />
                                <rect x="330" y="345" width="100" height="20" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="1.5" rx="4" />
                                <rect x="330" y="370" width="100" height="20" fill="#FDBA74" rx="4" />

                                <path d="M280,300 L200,390 L230,410 L300,320 Z" fill="#FDFCFE" />
                                <path d="M300,320 L240,410 L270,420 L330,320 Z" fill="#FFF7ED" />

                                {/* Base elements */}
                                <path d="M190,385 L140,370 L150,400 L210,410 Z" fill="#1E1B4B" />
                                <path d="M230,410 L190,430 L200,440 L260,425 Z" fill="#1E1B4B" />

                                {/* Head & Features */}
                                <path d="M340,180 C360,180 390,220 380,280 C350,280 300,280 270,250 C270,200 300,180 340,180 Z" fill="#312E81" />
                                <polygon points="250,170 290,160 300,240 260,250" fill="#FF5722" />

                                <circle cx="340" cy="150" r="20" fill="#FFD8D8" />
                                <path d="M320,150 C320,120 370,120 370,150 C370,160 360,170 340,160 C330,160 320,160 320,150 Z" fill="#4F46E5" />
                            </svg>
                        ) : (
                            <svg className={styles.illustration} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">
                                {/* Warm Light Orange Background */}
                                <circle cx="300" cy="200" r="150" fill="#FFF7ED" />
                                <path d="M180,250 C120,150 250,100 350,120 C480,140 500,280 400,380 C300,450 150,450 180,250 Z" fill="#FFF1E8" />

                                <path d="M180,250 C150,180 200,120 280,150 C320,165 300,220 280,250 Z" fill="#312E81" />
                                <polygon points="120,150 160,150 140,110" fill="#FED7AA" />
                                <g transform="translate(250, 70) rotate(45)">
                                    <rect width="40" height="40" fill="#FFEDD5" />
                                </g>
                                <circle cx="160" cy="190" r="15" fill="none" stroke="#FF5722" strokeWidth="3" opacity="0.3" />
                                <polygon points="450,250 550,320 450,390" fill="none" stroke="#FB923C" strokeWidth="6" opacity="0.2" />
                                <polygon points="455,260 540,320 455,380" fill="#FFFFFF" />

                                {/* Server/Database */}
                                <path d="M330,350 L330,380 C330,388 352,395 380,395 C408,395 430,388 430,380 L430,350 Z" fill="#3730A3" />
                                <ellipse cx="380" cy="350" rx="50" ry="15" fill="#4338CA" />
                                <path d="M330,320 L330,350 C330,358 352,365 380,365 C408,365 430,358 430,350 L430,320 Z" fill="#4338CA" />
                                <ellipse cx="380" cy="320" rx="50" ry="15" fill="#4F46E5" />
                                <circle cx="350" cy="370" r="2.5" fill="#2DD4BF" />
                                <circle cx="360" cy="370" r="2.5" fill="#2DD4BF" />
                                <circle cx="350" cy="340" r="2.5" fill="#2DD4BF" />
                                <circle cx="360" cy="340" r="2.5" fill="#FF5722" />

                                {/* Body elements */}
                                <path d="M280,300 L200,390 L230,410 L300,320 Z" fill="#312E81" />
                                <path d="M300,320 L240,410 L270,420 L330,320 Z" fill="#1E1B4B" />
                                <path d="M190,385 L140,370 L150,400 L210,410 Z" fill="#0F172A" />
                                <path d="M230,410 L190,430 L200,440 L260,425 Z" fill="#0F172A" />

                                {/* Torso & arm */}
                                <path d="M340,180 C360,180 390,220 380,280 C350,280 300,280 270,250 C270,200 300,180 340,180 Z" fill="#312E81" />
                                <polygon points="320,180 345,195 355,180" fill="#FFFFFF" />
                                <polygon points="335,185 340,215 345,185" fill="#FF5722" />

                                {/* Laptop */}
                                <polygon points="210,180 270,170 280,230 220,240" fill="#4338CA" />
                                <polygon points="215,185 265,176 273,225 225,234" fill="#6B7280" opacity="0.6" />
                                <polygon points="220,240 280,230 310,250 250,260" fill="#FDBA74" />
                                <path d="M340,200 C320,220 290,230 260,240" stroke="#1E1B4B" strokeWidth="20" strokeLinecap="round" fill="none" />

                                {/* Head */}
                                <circle cx="340" cy="150" r="20" fill="#FFD8D8" />
                                <path d="M320,150 C320,120 365,120 360,150 C360,155 355,150 340,150 C330,150 320,155 320,150 Z" fill="#312E81" />
                            </svg>
                        )}
                    </motion.div>

                    <motion.div
                        className={styles.visualText}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1>Libérez le potentiel de vos manuels.</h1>
                        <p>Rejoignez <span style={{ color: '#FF5722' }}>y</span>Tera, la communauté d'échange de manuels au Maroc.</p>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SIDE: AUTH FORM */}
            <div className={styles.formSide}>
                <motion.div
                    className={styles.loginCard}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                    <div className={styles.cardHeader}>
                        <YTeraLogo size={32} showSlogan={true} />
                        <div className={styles.cardTitle}>
                            <h2>Ravi de vous revoir !</h2>
                            <p>Accédez à votre espace sécurisé.</p>
                        </div>
                    </div>

                    {/* Elegant Role Toggle */}
                    <div className={styles.roleToggle}>
                        <button
                            className={`${styles.roleOption} ${isStudent ? styles.roleActive : ''}`}
                            onClick={() => setIsStudent(true)}
                        >
                            <span>Espace Étudiant</span>
                            {isStudent && <motion.div layoutId="activeTab" className={styles.activeBar} />}
                        </button>
                        <button
                            className={`${styles.roleOption} ${!isStudent ? styles.roleActive : ''}`}
                            onClick={() => setIsStudent(false)}
                        >
                            <span>Espace Admin</span>
                            {!isStudent && <motion.div layoutId="activeTab" className={styles.activeBar} />}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Adresse Email</label>
                            <div className={styles.field}>
                                <Mail size={18} className={styles.fieldIcon} />
                                <input
                                    type="email"
                                    placeholder={isStudent ? "etudiant@ytera.ma" : "admin@ytera.ma"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Mot de passe</label>
                            <div className={styles.field}>
                                <Lock size={18} className={styles.fieldIcon} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.forgotPassword}>
                            <button type="button" onClick={() => navigate('/forgot-password')}>
                                Mot de passe oublié ?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                            style={{ background: isStudent ? '#FF5722' : '#0F172A' }}
                        >
                            {isLoading ? <Loader2 size={18} className={styles.spinning} /> : 'Continuer'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className={styles.cardFooter}>
                        {isStudent ? (
                            <p>Pas encore de compte ? <button onClick={() => navigate('/register')}>S'inscrire gratuitement</button></p>
                        ) : (
                            <p>Réservé aux collaborateurs <span style={{ color: '#FF5722' }}>y</span>Tera.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
