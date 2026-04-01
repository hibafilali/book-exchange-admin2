import { useState } from 'react';
import { CheckCircle, XCircle, Search, Eye, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import styles from './AnnoncesList.module.css';

// Import des assets réels
import book1 from '../../assets/book1.png';
import book2 from '../../assets/book2.png';
import book3 from '../../assets/book3.png';
import book4 from '../../assets/book4.png';
import book5 from '../../assets/book5.png';
import book6 from '../../assets/book6.png';
import book7 from '../../assets/book7.png';
import book8 from '../../assets/book8.png';
import book9 from '../../assets/book9.png';
import book10 from '../../assets/book10.png';

const MOCK_ANNONCES = [
    { id: 101, titre: 'Anatomie Humaine', auteur: 'Dr. Salim Alaoui', type: 'VENTE', prix: '85 DH', etat: 'NEUF', statut: 'En attente', etudiant: 'Amine El Amrani', image: book2 },
    { id: 102, titre: 'Maths pour Ingénieurs', auteur: 'Prof. Kamal Ziani', type: 'VENTE', prix: '105 DH', etat: 'BON', statut: 'Validée', etudiant: 'Fatima Zahra Fassi', image: book5 },
    { id: 103, titre: 'Droit Civil : Obligations', auteur: 'Prof. Y. Benani', type: 'DON', prix: 'Gratuit', etat: 'COMME NEUF', statut: 'En attente', etudiant: 'Youssef Benjelloun', image: book3 },
    { id: 104, titre: 'Macroéconomie Moderne', auteur: 'Dr. Amina El Fassi', type: 'VENTE', prix: '95 DH', etat: 'USE', statut: 'En attente', etudiant: 'Khadija Bennani', image: book4 },
    { id: 105, titre: 'Chimie Organique', auteur: 'Dr. Sophie Meyer', type: 'VENTE', prix: '80 DH', etat: 'BON', statut: 'En attente', etudiant: 'Mehdi Tazi', image: book1 },
    { id: 106, titre: 'Introduction au Marketing', auteur: 'Prof. Philip Kotler', type: 'DON', prix: 'Gratuit', etat: 'BON', statut: 'Validée', etudiant: 'Anas Idrissi', image: book8 },
    { id: 107, titre: 'Physique : Scientifiques', auteur: 'Prof. D. Halliday', type: 'VENTE', prix: '100 DH', etat: 'NEUF', statut: 'En attente', etudiant: 'Omar Berrada', image: book7 },
    { id: 108, titre: 'Psychologie Contemporaine', auteur: 'Dr. Jane Smith', type: 'VENTE', prix: '75 DH', etat: 'BON', statut: 'En attente', etudiant: 'Sofia Amal', image: book9 },
    { id: 109, titre: 'Réseaux Informatiques', auteur: 'Prof. Alex Turner', type: 'PRET', prix: '45 DH/sem', etat: 'NEUF', statut: 'En attente', etudiant: 'Rachid Lahlou', image: book10 },
    { id: 110, titre: 'Gestion de Projet', auteur: 'J.P. Marot', type: 'VENTE', prix: '120 DH', etat: 'BON', statut: 'Refusée', etudiant: 'Sami Alami', image: book6 },
    { id: 111, titre: 'Algèbre Linéaire', auteur: 'Prof. S. Sahli', type: 'DON', prix: 'Gratuit', etat: 'USE', statut: 'Refusée', etudiant: 'Laila Zahid', image: book1 },
];

export default function AnnoncesList() {
    const [annonces, setAnnonces] = useState(MOCK_ANNONCES);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const updateStatut = (id, newStatut) => {
        setAnnonces(annonces.map(a => a.id === id ? { ...a, statut: newStatut } : a));
        if (newStatut === 'Validée') {
            toast.success(`L'annonce a été validée.`);
        } else {
            toast.error(`L'annonce a été refusée.`);
        }
    };

    const filtered = annonces.filter(a => {
        const matchesSearch = a.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.etudiant.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === 'ALL' || a.statut === statusFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Modération des Annonces</h1>
                    <p className={styles.subtitle}>Validez les manuels authentiques de la communauté yTera.</p>
                </div>
            </header>

            <div className={styles.statsBar}>
                <div
                    className={`${styles.statBadge} ${statusFilter === 'En attente' ? styles.activeFilter : ''}`}
                    onClick={() => setStatusFilter(statusFilter === 'En attente' ? 'ALL' : 'En attente')}
                >
                    <span>En attente</span>
                    <div className={styles.countBadge} style={{ background: '#f59e0b', color: '#fff' }}>
                        {annonces.filter(a => a.statut === 'En attente').length}
                    </div>
                </div>
                <div
                    className={`${styles.statBadge} ${statusFilter === 'Validée' ? styles.activeFilter : ''}`}
                    onClick={() => setStatusFilter(statusFilter === 'Validée' ? 'ALL' : 'Validée')}
                >
                    <span>Validées</span>
                    <div className={styles.countBadge} style={{ background: '#10b981', color: '#fff' }}>
                        {annonces.filter(a => a.statut === 'Validée').length}
                    </div>
                </div>
                <div
                    className={`${styles.statBadge} ${statusFilter === 'Refusée' ? styles.activeFilter : ''}`}
                    onClick={() => setStatusFilter(statusFilter === 'Refusée' ? 'ALL' : 'Refusée')}
                >
                    <span>Refusées</span>
                    <div className={styles.countBadge} style={{ background: '#ef4444', color: '#fff' }}>
                        {annonces.filter(a => a.statut === 'Refusée').length}
                    </div>
                </div>
                <div className={styles.searchArea}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Rechercher titre, auteur, étudiant..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.listContainer}>
                <AnimatePresence mode="popLayout">
                {filtered.map(annonce => (
                    <motion.div 
                        layout 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        key={annonce.id} 
                        className={styles.listRow}
                    >
                        <div className={styles.bookThumb}>
                            <img src={annonce.image} alt={annonce.titre} />
                        </div>

                        <div className={styles.bookInfo}>
                            <h3 className={styles.bookTitle}>{annonce.titre}</h3>
                            <p className={styles.bookMeta}>par {annonce.auteur} • {annonce.etudiant}</p>
                        </div>

                        <div className={styles.badgesWrapper}>
                            <span className={`${styles.simpleBadge} ${styles[annonce.type.toLowerCase()]}`}>{annonce.type}</span>
                            <span className={styles.priceBadge}>{annonce.prix}</span>
                            <span className={styles.etatBadge}>{annonce.etat}</span>
                            <span className={`
                                ${styles.statusTag} 
                                ${annonce.statut === 'Validée' ? styles.statusValid : ''}
                                ${annonce.statut === 'Refusée' ? styles.statusRefused : ''}
                                ${annonce.statut === 'En attente' ? styles.statusPending : ''}
                            `}>
                                {annonce.statut}
                            </span>
                        </div>

                        <div className={styles.rowActions}>
                            {annonce.statut === 'En attente' ? (
                                <>
                                    <button
                                        className={`${styles.iconAction} ${styles.approveBtn}`}
                                        onClick={() => updateStatut(annonce.id, 'Validée')}
                                        title="Valider"
                                    >
                                        <CheckCircle size={16} />
                                    </button>
                                    <button
                                        className={`${styles.iconAction} ${styles.rejectBtn}`}
                                        onClick={() => updateStatut(annonce.id, 'Refusée')}
                                        title="Refuser"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </>
                            ) : null}
                            {annonce.statut === 'Refusée' && (
                                <button
                                    className={`${styles.iconAction} ${styles.restoreBtn}`}
                                    onClick={() => updateStatut(annonce.id, 'En attente')}
                                    title="Remettre en attente"
                                >
                                    <RotateCcw size={16} />
                                </button>
                            )}
                            <button className={`${styles.iconAction} ${styles.viewBtn}`} title="Détails">
                                <Eye size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
