import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Image as ImageIcon, Send, Clock, CheckCircle, UploadCloud, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';
import { plainteApi } from '../../api/client';
import styles from './SupportPlaintes.module.css';

const TYPE_OPTIONS = [
    { value: 'COMPORTEMENT', label: 'Comportement inacceptable' },
    { value: 'FRAUDE', label: 'Soupçon de fraude' },
    { value: 'LIVRE_NON_CONFORME', label: 'Livre non conforme à l\'annonce' },
    { value: 'RETARD_RETOUR', label: 'Retard de retour (Prêt)' },
    { value: 'AUTRE', label: 'Autre problème' }
];

export default function SupportPlaintes() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('NOUVEAU'); // 'NOUVEAU' | 'HISTORIQUE'
    const [plaintes, setPlaintes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        sujet: '',
        type: 'COMPORTEMENT',
        description: '',
        preuve_url: '' // Will store simulated upload URL
    });
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (activeTab === 'HISTORIQUE') {
            loadPlaintes();
        }
    }, [activeTab]);

    const loadPlaintes = async () => {
        setIsLoading(true);
        try {
            const res = await plainteApi.getByUserId(user?.id || 1);
            setPlaintes(res.data);
        } catch (err) {
            toast.error("Impossible de charger l'historique.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("L'image est trop volumineuse (Max 5MB).");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.sujet.trim() || !formData.description.trim()) {
            toast.error("Veuillez remplir les champs obligatoires.");
            return;
        }

        setIsLoading(true);
        try {
            // Simulate file upload delay
            let preuveUrl = null;
            if (file) {
                await new Promise(resolve => setTimeout(resolve, 800)); // simulated upload
                preuveUrl = URL.createObjectURL(file);
            }

            const payload = {
                plaignant_id: user?.id || 1,
                sujet: formData.sujet,
                type: formData.type,
                description: formData.description,
                preuve_url: preuveUrl
            };

            await plainteApi.create(payload);
            toast.success("Votre plainte a été enregistrée avec succès. Notre équipe va l'examiner rapidement.");
            
            // Reset form
            setFormData({
                sujet: '',
                type: 'COMPORTEMENT',
                description: '',
                preuve_url: ''
            });
            setFile(null);
            
            // Switch to history
            setActiveTab('HISTORIQUE');
        } catch (err) {
            toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
            console.error("Plainte submit error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'RESOLU': return <CheckCircle size={16} />;
            case 'EN_TRAITEMENT': return <Clock size={16} />;
            default: return <ShieldAlert size={16} />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'RESOLU': return 'Résolu';
            case 'EN_TRAITEMENT': return 'En cours de traitement';
            default: return 'Ouvert';
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}><ShieldAlert size={32} color="var(--accent-color)" /> Support & Signalements</h1>
                <p className={styles.subtitle}>Un problème avec un échange ou un autre étudiant ? Déclarez-le ici.</p>
            </header>

            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'NOUVEAU' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('NOUVEAU')}
                >
                    <Send size={18} /> Faire un signalement
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'HISTORIQUE' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('HISTORIQUE')}
                >
                    <FileText size={18} /> Mes requêtes en cours
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'NOUVEAU' ? (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={styles.formCard}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Sujet du problème *</label>
                                <input 
                                    type="text" 
                                    className={styles.input}
                                    placeholder="Ex: Le livre de Ahmed est complètement déchiré"
                                    value={formData.sujet}
                                    onChange={(e) => setFormData({...formData, sujet: e.target.value})}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Type de problème</label>
                                <select 
                                    className={styles.select}
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    {TYPE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Description détaillée *</label>
                                <textarea 
                                    className={styles.textarea}
                                    placeholder="Veuillez décrire la situation en détail pour aider l'administration à enquêter..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    required
                                ></textarea>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Joindre une preuve (Capture d'écran, Optionnel)</label>
                                <div className={styles.uploadZone}>
                                    <input 
                                        type="file" 
                                        className={styles.fileInput} 
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                    />
                                    {file ? (
                                        <div className={styles.fileName}>
                                            <ImageIcon size={20} />
                                            <span>{file.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud size={32} className={styles.uploadIcon} />
                                            <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-secondary)' }}>Cliquez ou glissez une image ici</p>
                                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG jusqu'à 5MB</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                {isLoading ? "Envoi en cours..." : "Soumettre le signalement"}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {isLoading ? (
                            <div className={styles.emptyState}>Chargement de vos requêtes...</div>
                        ) : plaintes.length === 0 ? (
                            <div className={styles.emptyState}>
                                <ShieldAlert size={48} />
                                <p>Vous n'avez soumis aucune plainte pour le moment.</p>
                            </div>
                        ) : (
                            <div className={styles.list}>
                                {plaintes.map(p => (
                                    <div key={p.id} className={styles.requestCard}>
                                        <div className={styles.reqMain}>
                                            <div className={styles.reqHeader}>
                                                <span className={styles.reqType}>
                                                    {TYPE_OPTIONS.find(o => o.value === p.type)?.label || p.type}
                                                </span>
                                                <span className={styles.reqDate}>
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className={styles.reqTitle}>{p.sujet}</h3>
                                            <p className={styles.reqDesc}>{p.description}</p>
                                        </div>
                                        <div className={`${styles.reqStatus} ${styles['status_' + p.status]}`}>
                                            {getStatusIcon(p.status)}
                                            {getStatusLabel(p.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
