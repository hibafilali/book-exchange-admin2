import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './ForgotPassword.module.css';
import YTeraLogo from '../../components/common/YTeraLogo';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Veuillez saisir votre adresse email.");
            return;
        }

        setIsLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        setIsLoading(false);
        setIsSent(true);
        toast.success("Email de réinitialisation envoyé !");
    };

    return (
        <div className={styles.page}>
            <div className={styles.noiseOverlay} />

            {/* LEFT SIDE: Visual */}
            <div className={styles.visualSide}>
                <div className={styles.visualContent}>
                    <motion.div
                        className={styles.illustrationWrapper}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <svg className={styles.illustration} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">
                            {/* Warm Light Orange Background */}
                            <circle cx="300" cy="200" r="150" fill="#FFF7ED" />
                            <path d="M180,250 C120,150 250,100 350,120 C480,140 500,280 400,380 C300,450 150,450 180,250 Z" fill="#FFF1E8" />

                            {/* Lock illustration */}
                            <path d="M180,250 C150,180 200,120 280,150 C320,165 300,220 280,250 Z" fill="#4F46E5" />
                            <polygon points="120,150 160,150 140,110" fill="#FED7AA" />
                            <g transform="translate(250, 70) rotate(45)">
                                <rect width="40" height="40" fill="#FFEDD5" />
                            </g>
                            <circle cx="160" cy="190" r="15" fill="none" stroke="#FF5722" strokeWidth="3" opacity="0.3" />

                            {/* Shield / Lock Icon */}
                            <rect x="260" y="200" width="100" height="120" rx="12" fill="#312E81" />
                            <rect x="275" y="215" width="70" height="90" rx="8" fill="#4F46E5" />
                            <circle cx="310" cy="255" r="14" fill="#FFF7ED" />
                            <rect x="305" y="260" width="10" height="20" rx="4" fill="#FFF7ED" />
                            <path d="M280,200 L280,175 C280,145 340,145 340,175 L340,200" fill="none" stroke="#312E81" strokeWidth="12" strokeLinecap="round" />

                            {/* Decorative elements */}
                            <circle cx="400" cy="150" r="8" fill="#FDBA74" opacity="0.5" />
                            <circle cx="180" cy="350" r="6" fill="#FF5722" opacity="0.3" />
                            <rect x="420" y="280" width="20" height="20" rx="4" fill="#FFEDD5" transform="rotate(15 430 290)" />

                            {/* Base elements */}
                            <path d="M230,380 L200,400 L420,400 L390,380 Z" fill="#FED7AA" opacity="0.5" />
                        </svg>
                    </motion.div>

                    <motion.div
                        className={styles.visualText}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1>Pas de panique, on gère.</h1>
                        <p>Réinitialisez votre mot de passe en quelques secondes.</p>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className={styles.formSide}>
                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                    <div className={styles.cardHeader}>
                        <YTeraLogo size={32} showSlogan={true} />
                        <div className={styles.cardTitle}>
                            <h2>Mot de passe oublié</h2>
                            <p>Entrez votre email pour recevoir un lien de réinitialisation.</p>
                        </div>
                    </div>

                    {!isSent ? (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label>Adresse Email</label>
                                <div className={styles.field}>
                                    <Mail size={18} className={styles.fieldIcon} />
                                    <input
                                        type="email"
                                        placeholder="votre@email.ma"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 size={18} className={styles.spinning} /> : 'Envoyer le lien'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            className={styles.successMessage}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className={styles.successIcon}>
                                <CheckCircle size={48} />
                            </div>
                            <h3>Email envoyé !</h3>
                            <p>
                                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
                                Vérifiez votre boîte de réception (et vos spams).
                            </p>
                            <button
                                className={styles.resendBtn}
                                onClick={() => { setIsSent(false); setEmail(''); }}
                            >
                                Renvoyer un email
                            </button>
                        </motion.div>
                    )}

                    <div className={styles.cardFooter}>
                        <button onClick={() => navigate('/login')}>
                            <ArrowLeft size={14} />
                            Retour à la connexion
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
