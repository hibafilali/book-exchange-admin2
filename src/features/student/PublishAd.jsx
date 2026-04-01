import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Check, Hash, Image as ImageIcon, MapPin, Search,
    UploadCloud, X, ArrowRight, ArrowLeft, Loader2, Sparkles, Building2,
    AlertCircle, PartyPopper, Eye, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ManualCard from './ManualCard';
import styles from './PublishAd.module.css';

const STEPS = [
    { id: 1, title: 'Le Manuel', icon: BookOpen },
    { id: 2, title: "L'Exemplaire", icon: ImageIcon },
    { id: 3, title: "L'Annonce", icon: Hash },
];

const ETATS = ['NEUF', 'BON', 'ACCEPTABLE', 'USE'];
const ETAT_LABELS = { NEUF: 'Neuf', BON: 'Bon état', ACCEPTABLE: 'Acceptable', USE: 'Usé' };
const TYPES = ['VENTE', 'PRET', 'DON'];
const TYPE_LABELS = { VENTE: 'Vente', PRET: 'Prêt', DON: 'Don' };

const MOCK_ISBN_DB = {
    '978-0262033848': { titre: 'Algorithmes et Structures de Données', auteur: 'Thomas H. Cormen', filiere: 'Informatique', niveau: 'L3' },
    '978-2130789123': { titre: 'Introduction au Droit Civil', auteur: 'Jean Carbonnier', filiere: 'Droit', niveau: 'L1' },
};

export default function PublishAd() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isPublishing, setIsPublishing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isbnLoading, setIsbnLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Form State mapped to SQL Tables mentally
    const [formData, setFormData] = useState({
        // T_MANUEL
        isbn: '', titre: '', auteur: '', filiere: '', niveau: '',
        // T_EXEMPLAIRE
        etat: 'BON', photos: [], ville: '',
        // T_ANNONCE
        typeEchange: 'VENTE', prixVente: '', dureePret: '', caution: '', description: ''
    });

    const updateForm = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
        setErrorMsg(''); // clear error when user types
    };

    const handleIsbnSearch = () => {
        if (!formData.isbn) return;
        setIsbnLoading(true);
        setTimeout(() => {
            const stripped = formData.isbn.replace(/[-\s]/g, '');
            const foundKey = Object.keys(MOCK_ISBN_DB).find(k => k.replace(/-/g, '') === stripped);
            if (foundKey) {
                const data = MOCK_ISBN_DB[foundKey];
                setFormData(prev => ({ ...prev, titre: data.titre, auteur: data.auteur, filiere: data.filiere, niveau: data.niveau }));
            }
            setIsbnLoading(false);
        }, 600);
    };

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newPhotos = files.map(f => URL.createObjectURL(f));
        setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
        setErrorMsg('');
    };

    const removePhoto = (index) => {
        setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    };

    const handlePublish = () => {
        if (!validateStep3()) return;
        setIsPublishing(true);
        // Simulate DB insertion (Manuel -> Exemplaire -> Annonce)
        setTimeout(() => {
            setIsPublishing(false);
            toast.success("Annonce publiée avec succès !");
            setShowSuccess(true);
            
            // Redirect automatically after showing confetti for a few seconds
            setTimeout(() => {
                navigate('/student-dashboard/dashboard');
            }, 3500);
        }, 1500);
    };

    // Validations
    const validateStep1 = () => {
        if (!formData.titre || !formData.auteur || !formData.filiere || !formData.niveau) {
            setErrorMsg("Veuillez remplir tous les champs obligatoires du manuel.");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (formData.photos.length === 0) {
            setErrorMsg("Veuillez ajouter au moins une photo de l'exemplaire.");
            return false;
        }
        if (!formData.ville) {
            setErrorMsg("Veuillez indiquer la ville d'échange.");
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (formData.typeEchange === 'VENTE' && (!formData.prixVente || formData.prixVente <= 0)) {
            setErrorMsg("Veuillez indiquer un prix de vente valide.");
            return false;
        }
        if (formData.typeEchange === 'PRET' && !formData.dureePret) {
            setErrorMsg("Veuillez indiquer la durée du prêt.");
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setErrorMsg('');
        setStep(p => Math.min(3, p + 1));
    };

    const prevStep = () => {
        setErrorMsg('');
        setStep(p => Math.max(1, p - 1));
    };

    // Sub-variants for sliding lateral animation
    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (dir) => ({ zIndex: 0, x: dir < 0 ? 50 : -50, opacity: 0 })
    };

    // Success Screen
    if (showSuccess) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <motion.div className={styles.successCard}
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
                        <div className={styles.successIconWrap}>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}>
                                <PartyPopper size={64} className={styles.successIcon} />
                            </motion.div>
                        </div>
                        <h2 className={styles.successTitle}>Annonce publiée avec succès !</h2>
                        <p className={styles.successText}>
                            Votre manuel a été enregistré avec succès et l'annonce est publiée.
                            Il est maintenant visible par les autres étudiants.
                        </p>
                        <button className={styles.btnPrimary} style={{ margin: '0 auto', display: 'flex' }} onClick={() => navigate('/student-dashboard')}>
                            Retour au tableau de bord
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>

                {/* ====== HEADER ====== */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Créer une Annonce</h1>
                    <p className={styles.subtitle}>Processus optimisé en 3 étapes (Manuel → Exemplaire → Offre)</p>
                </div>

                {/* ====== MAIN FORM COLUMN ====== */}
                <div className={styles.publishMain}>
                        
                        {/* ====== STEPPER ====== */}
                <div className={styles.stepperWrap}>
                    <div className={styles.stepper}>
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const isActive = s.id === step;
                            const isDone = s.id < step;
                            return (
                                <div key={s.id} className={`${styles.step} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}>
                                    <div className={styles.stepBubble}>
                                        {isDone ? <Check size={18} /> : <Icon size={18} />}
                                    </div>
                                    <div className={styles.stepTextWrap}>
                                        <span className={styles.stepLabel}>Étape {s.id}</span>
                                        <span className={styles.stepTitle}>{s.title}</span>
                                    </div>
                                    {i < STEPS.length - 1 && <div className={styles.stepLine}></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ====== FORM CONTENT ====== */}
                <div className={styles.formCard}>
                    <AnimatePresence mode="wait" custom={1}>
                        <motion.div
                            key={step}
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className={styles.stepContent}
                        >

                            {/* ——— ÉTAPE 1: LE MANUEL ——— */}
                            {step === 1 && (
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>Données du Manuel</h2>
                                    
                                    <div className={styles.isbnBox}>
                                        <label className={styles.miniLabel}>Entrer l'ISBN</label>
                                        <div className={styles.isbnInputWrap}>
                                            <input type="text" placeholder="Ex: 978-0262033848" 
                                                value={formData.isbn} onChange={e => updateForm('isbn', e.target.value)}
                                                className={styles.input} />
                                            <button className={styles.isbnBtn} onClick={handleIsbnSearch} disabled={isbnLoading || !formData.isbn}>
                                                {isbnLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Vérifier
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Titre de l'ouvrage *</label>
                                        <input type="text" className={styles.input} placeholder="Titre complet" 
                                            value={formData.titre} onChange={e => updateForm('titre', e.target.value)} />
                                    </div>

                                    <div className={styles.grid2}>
                                        <div className={styles.inputGroup}>
                                            <label>Auteur(s) *</label>
                                            <input type="text" className={styles.input} placeholder="Nom de l'auteur"
                                                value={formData.auteur} onChange={e => updateForm('auteur', e.target.value)} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Filière *</label>
                                            <select className={styles.select} value={formData.filiere} onChange={e => updateForm('filiere', e.target.value)}>
                                                <option value="">Sélectionner...</option>
                                                <option value="Informatique">Informatique</option>
                                                <option value="Droit">Droit</option>
                                                <option value="Économie">Économie</option>
                                                <option value="Médecine">Médecine</option>
                                            </select>
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Niveau d'études *</label>
                                            <select className={styles.select} value={formData.niveau} onChange={e => updateForm('niveau', e.target.value)}>
                                                <option value="">Sélectionner...</option>
                                                <option value="L1">L1 / 1ère année</option>
                                                <option value="L2">L2 / 2ème année</option>
                                                <option value="L3">L3 / 3ème année</option>
                                                <option value="Master">Master</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ——— ÉTAPE 2: L'EXEMPLAIRE ——— */}
                            {step === 2 && (
                                <div className={styles.formSection}>
                                    <h2 className={styles.sectionTitle}>Caractéristiques de l'Exemplaire</h2>

                                    <label className={styles.blockLabel}>État visuel de l'exemplaire *</label>
                                    <div className={styles.grid2} style={{ marginBottom: '1.5rem' }}>
                                        {ETATS.map(e => (
                                            <label key={e} className={`${styles.radioCard} ${formData.etat === e ? styles.radioActive : ''}`}>
                                                <input type="radio" name="etat" value={e} checked={formData.etat === e} 
                                                    onChange={() => updateForm('etat', e)} className={styles.radioHidden} />
                                                <div className={styles.radioCircle}></div>
                                                <div className={styles.radioText}>
                                                    <span>{ETAT_LABELS[e]}</span>
                                                    <small>{e === 'NEUF' ? 'Jamais utilisé, pages intactes' : e === 'BON' ? 'Léger usage, pas de déchirures' : 'Surlignages présents'}</small>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Photos (Preuve d'état) *</label>
                                        <div className={styles.uploadZone}>
                                            <input type="file" multiple accept="image/*" className={styles.fileInput} onChange={handlePhotoUpload} />
                                            <UploadCloud size={40} className={styles.uploadIcon} />
                                            <p>Glissez-déposez vos photos ou <strong>cliquez ici</strong></p>
                                            <span>Maximum 5 Mo par image</span>
                                        </div>
                                        {formData.photos.length > 0 && (
                                            <div className={styles.photoPreviewList}>
                                                <AnimatePresence>
                                                    {formData.photos.map((url, i) => (
                                                        <motion.div key={i} className={styles.photoThumb} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                                                            <img src={url} alt={`Preview ${i}`} />
                                                            <button className={styles.removePhoto} onClick={() => removePhoto(i)}><X size={14} /></button>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                                        <label>Ville de disponibilité *</label>
                                        <div className={styles.iconInputWrap}>
                                            <MapPin size={18} className={styles.inputIcon} />
                                            <input type="text" className={`${styles.input} ${styles.inputWithIcon}`} placeholder="Campus ou ville (ex: Fès)"
                                                value={formData.ville} onChange={e => updateForm('ville', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ——— ÉTAPE 3: L'OFFRE (ANNONCE) + PREVIEW ——— */}
                            {step === 3 && (
                                <div className={styles.reviewWrapper}>
                                    <div className={styles.reviewInputs}>
                                        <h2 className={styles.sectionTitle}>Paramètres de l'Offre</h2>

                                        <label className={styles.blockLabel}>Type de transaction souhaitée *</label>
                                        <div className={styles.segmentGroup}>
                                            {TYPES.map(t => (
                                                <button key={t}
                                                    className={`${styles.segmentBtn} ${formData.typeEchange === t ? styles.segmentActive : ''}`}
                                                    data-type={t}
                                                    onClick={() => updateForm('typeEchange', t)}>
                                                    {TYPE_LABELS[t]}
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                            {formData.typeEchange === 'VENTE' && (
                                                <motion.div key="vente" className={styles.inputGroup}
                                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                                    <label>Prix de vente (DH) *</label>
                                                    <div className={styles.priceInputWrap}>
                                                        <input type="number" className={`${styles.input} ${styles.priceInput}`} placeholder="Ex: 150" 
                                                            value={formData.prixVente} onChange={e => updateForm('prixVente', e.target.value)} />
                                                        <span className={styles.currency}>DH</span>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {formData.typeEchange === 'PRET' && (
                                                <motion.div key="pret" className={styles.grid2}
                                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                                        <label>Durée du prêt *</label>
                                                        <input type="text" className={styles.input} placeholder="Ex: 2 semaines" 
                                                            value={formData.dureePret} onChange={e => updateForm('dureePret', e.target.value)} />
                                                    </div>
                                                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                                                        <label>Caution (Optionnel - DH)</label>
                                                        <input type="number" className={styles.input} placeholder="Ex: 50" 
                                                            value={formData.caution} onChange={e => updateForm('caution', e.target.value)} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className={styles.inputGroup} style={{ marginTop: '1.5rem' }}>
                                            <label>Description détaillée</label>
                                            <textarea className={styles.textarea} rows={4} placeholder="Informations complémentaires, disponibilités pour la remise..."
                                                value={formData.description} onChange={e => updateForm('description', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className={styles.reviewPreview}>
                                        <h3 className={styles.previewLabel}>Aperçu de votre Annonce</h3>
                                        <div className={styles.previewCardContainer}>
                                            <ManualCard 
                                                annonce={{
                                                    id: 0,
                                                    titreAnnonce: formData.titre || 'Titre du manuel',
                                                    auteur: formData.auteur || 'Nom de l\'auteur',
                                                    photoUrl: formData.photos[0] || 'https://via.placeholder.com/300x450?text=Pas+de+photo',
                                                    prixVente: formData.prixVente || 0,
                                                    typeEchange: formData.typeEchange,
                                                    etat: formData.etat,
                                                    ville: formData.ville || 'Ville non spécifiée',
                                                    nbVues: 0,
                                                    nbOperations: 0
                                                }}
                                            />
                                        </div>
                                        <p className={styles.previewHint}>Voici comment votre annonce apparaîtra dans le catalogue public.</p>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* ====== ERROR MESSAGE ====== */}
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div className={styles.errorBanner} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <AlertCircle size={16} /> {errorMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ====== FOOTER ACTIONS ====== */}
                    <div className={styles.footerActions}>
                        {step > 1 ? (
                            <button className={styles.btnSecondary} onClick={prevStep} disabled={isPublishing}>
                                <ArrowLeft size={16} /> Précédent
                            </button>
                        ) : <div></div>} {/* spacer */}

                        {step < 3 ? (
                            <button className={styles.btnPrimary} onClick={nextStep}>
                                Suivant <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button className={`${styles.btnPrimary} ${styles.btnPublish}`} onClick={handlePublish} disabled={isPublishing}>
                                {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} 
                                {isPublishing ? 'Création...' : 'Publier l\'Annonce'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
