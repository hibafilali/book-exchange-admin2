import { useState } from 'react';
import styles from './AdminForm.module.css';
import { Mail, User, Lock, ShieldCheck } from 'lucide-react';

export default function AdminForm({ onSubmit, onCancel, initialData = null, isEdit = false }) {
    const [formData, setFormData] = useState({
        nom: initialData?.nom || '',
        prenom: initialData?.prenom || '',
        email: initialData?.email || '',
        password: '',
        codeAcces: initialData?.codeAcces || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = { ...formData };
        if (isEdit && !submissionData.password) {
            delete submissionData.password;
        }
        onSubmit(submissionData);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label>Prénom</label>
                    <div className={styles.inputWrapper}>
                        <User size={16} />
                        <input name="prenom" value={formData.prenom} onChange={handleChange} required placeholder="Jean" />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <label>Nom</label>
                    <div className={styles.inputWrapper}>
                        <User size={16} />
                        <input name="nom" value={formData.nom} onChange={handleChange} required placeholder="Dupont" />
                    </div>
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Email Professionnel</label>
                <div className={styles.inputWrapper}>
                    <Mail size={16} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="admin@ytera.ma" />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>{isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe temporaire'}</label>
                <div className={styles.inputWrapper}>
                    <Lock size={16} />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!isEdit}
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {(!isEdit || initialData?.role === 'ADMIN') && (
                <div className={styles.inputGroup}>
                    <label>Code d'accès Admin</label>
                    <div className={styles.inputWrapper}>
                        <ShieldCheck size={16} />
                        <input name="codeAcces" value={formData.codeAcces} onChange={handleChange} required placeholder="ADM-XXXX" />
                    </div>
                </div>
            )}

            <div className={styles.actions}>
                <button type="button" className={styles.cancelBtn} onClick={onCancel}>Annuler</button>
                <button type="submit" className={styles.submitBtn}>
                    {isEdit ? 'Mettre à jour' : 'Créer le compte'}
                </button>
            </div>
        </form>
    );
}
