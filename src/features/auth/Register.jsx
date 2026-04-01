import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Building2, MapPin, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './Register.module.css';
import YTeraLogo from '../../components/common/YTeraLogo';

export default function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: '', prenom: '', email: '',
        password: '', confirmPassword: '',
        filiere: '', etablissement: '', ville: ''
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Real-time validation for password match
        if (name === 'confirmPassword' || name === 'password') {
            const pwd = name === 'password' ? value : formData.password;
            const confirm = name === 'confirmPassword' ? value : formData.confirmPassword;
            if (confirm && pwd !== confirm) {
                setErrors(prev => ({ ...prev, passwordMismatch: 'Les mots de passe ne correspondent pas' }));
            } else {
                setErrors(prev => ({ ...prev, passwordMismatch: null }));
            }
        }
    };

    const validateForm = () => {
        if (!formData.nom || !formData.prenom || !formData.email || !formData.password || !formData.filiere) {
            toast.error("Veuillez remplir les champs obligatoires.");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("Vos mots de passe ne correspondent pas.");
            return false;
        }
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        // Simulate API call for user registration
        await new Promise(r => setTimeout(r, 1500));
        setIsLoading(false);

        toast.success("Bienvenue dans la communauté ! Redirection vers la page de connexion...", { duration: 4000 });
        navigate('/login');
    };
    return (
        <div className={styles.page}>
            <div className={styles.noiseOverlay} />
            {/* LEFT SIDE: Visual (Desktop) */}
            <div className={styles.visualSide}>
                <div className={styles.visualContent}>
                    <motion.div className={styles.blobGreen} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 10, repeat: Infinity }} />
                    <motion.div className={styles.blobBlue} animate={{ x: [-10, 10, -10] }} transition={{ duration: 8, repeat: Infinity }} />

                    <svg className={styles.illustration} viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Organic Shapes Background */}
                        <circle cx="250" cy="250" r="180" fill="#FABE24" fillOpacity="0.1" />
                        <path d="M50 300 C 50 200 150 150 250 200 C 350 250 450 200 450 300" stroke="#3B82F6" strokeWidth="40" strokeOpacity="0.05" strokeLinecap="round" />
                        <circle cx="400" cy="150" r="60" fill="#FF5722" fillOpacity="0.08" />

                        {/* Two Students Exchanging Books */}
                        {/* Student 1 (Left - Giving) */}
                        <circle cx="150" cy="180" r="35" fill="#1E293B" />
                        <circle cx="150" cy="190" r="30" fill="#FFC9A9" />
                        <path d="M100 380 L200 380 L180 240 C 180 240 150 220 120 240 Z" fill="#3B82F6" />
                        <path d="M150 320 Q 220 320 250 280" stroke="#FFC9A9" strokeWidth="12" strokeLinecap="round" />

                        {/* Student 2 (Right - Receiving) */}
                        <circle cx="350" cy="180" r="35" fill="#1E293B" />
                        <circle cx="350" cy="190" r="30" fill="#FDBA74" />
                        <path d="M300 380 L400 380 L380 240 C 380 240 350 220 320 240 Z" fill="#FF5722" />
                        <path d="M350 320 Q 280 320 250 280" stroke="#FDBA74" strokeWidth="12" strokeLinecap="round" />

                        {/* The Exchanged Book */}
                        <rect x="220" y="250" width="60" height="40" rx="4" transform="rotate(-5 220 250)" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
                        <path d="M225 270 H 275" stroke="#E2E8F0" strokeWidth="1" />

                        {/* Happy Faces */}
                        <circle cx="140" cy="185" r="2" fill="#1E293B" />
                        <circle cx="160" cy="185" r="2" fill="#1E293B" />
                        <path d="M142 200 Q 150 208 158 200" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

                        <circle cx="340" cy="185" r="2" fill="#1E293B" />
                        <circle cx="360" cy="185" r="2" fill="#1E293B" />
                        <path d="M342 200 Q 350 208 358 200" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                    </svg>

                    <div className={styles.visualText}>
                        <h1>Pas de gâchis, juste du partage.</h1>
                        <p>Donnez une seconde vie à vos livres et économisez sur vos prochains semestres.</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Register Form */}
            <div className={styles.formSide}>
                <motion.div
                    className={styles.registerCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className={styles.cardHeader}>
                        <YTeraLogo size={24} showSlogan={false} />
                        <div className={styles.cardTitle}>
                            <h2>Créer un compte</h2>
                            <p>C'est rapide et gratuit.</p>
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className={styles.formSpace}>
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label>Prénom</label>
                                <div className={styles.field}>
                                    <User size={16} className={styles.fieldIcon} />
                                    <input type="text" name="prenom" placeholder="Ex: Omar" value={formData.prenom} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Nom</label>
                                <div className={styles.field}>
                                    <User size={16} className={styles.fieldIcon} />
                                    <input type="text" name="nom" placeholder="Ex: Benslim" value={formData.nom} onChange={handleInputChange} required />
                                </div>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Email Universitaire</label>
                            <div className={styles.field}>
                                <Mail size={14} className={styles.fieldIcon} />
                                <input type="email" name="email" placeholder="etudiant@univ.ma" value={formData.email} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label>Mot de passe</label>
                                <div className={styles.field}>
                                    <Lock size={16} className={styles.fieldIcon} />
                                    <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Confirmer</label>
                                <div className={styles.field}>
                                    <Lock size={16} className={styles.fieldIcon} />
                                    <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} required />
                                </div>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Filière & Établissement</label>
                            <div className={styles.inputRow}>
                                <div className={styles.field} style={{ flex: 1.5 }}>
                                    <GraduationCap size={16} className={styles.fieldIcon} />
                                    <input type="text" name="filiere" placeholder="Filière" value={formData.filiere} onChange={handleInputChange} required />
                                </div>
                                <div className={styles.field} style={{ flex: 1 }}>
                                    <Building2 size={16} className={styles.fieldIcon} />
                                    <input type="text" name="etablissement" placeholder="Fac" value={formData.etablissement} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? <Loader2 size={18} className={styles.spinning} /> : 'Créer mon compte'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className={styles.cardFooter}>
                        Vous avez déjà un compte ? <button onClick={() => navigate('/login')}>Se connecter</button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
