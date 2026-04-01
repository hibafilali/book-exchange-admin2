import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Eye, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import styles from './AnnoncesList.module.css';
import { bookApi } from '../../api/client';
import Modal from '../../components/ui/Modal';

// Import des assets réels (fallback)
import book1 from '../../assets/book1.png';
import book2 from '../../assets/book2.png';
import book3 from '../../assets/book3.png';
import book4 from '../../assets/book4.png';
import book5 from '../../assets/book5.png';

const MOCK_IMAGES = [book1, book2, book3, book4, book5];
const MOCK_ANNONCES = []; // Kept to satisfy potential unused imports issues, but empty.

const getFullImageUrl = (url, id) => {
    // Les URLs relatives (comme /admin/books/...) venant de la BDD sont factices 
    // car le backend ne sert pas encore de fichiers statiques.
    if (!url || !url.startsWith('http')) {
        return MOCK_IMAGES[(Math.max(1, id || 1)) % MOCK_IMAGES.length];
    }
    return url;
};

export default function AnnoncesList() {
    const [annonces, setAnnonces] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [viewingAnnonce, setViewingAnnonce] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchAnnonces = async () => {
        try {
            const response = await bookApi.getAll();
            const formatted = response.data.map(a => {
                const ouvrage = a.exemplaire?.ouvrage || {};
                const proprietaire = a.exemplaire?.proprietaire || {};
                return {
                    id: a.id,
                    titre: ouvrage.titre || 'Sans titre',
                    auteur: ouvrage.auteur || 'Inconnu',
                    type: a.typeEchange || 'VENTE',
                    prix: a.prixVente ? `${a.prixVente} DH` : 'Gratuit',
                    etat: a.exemplaire?.etat || 'INCONNU',
                    statut: a.status === 'ACTIF' ? 'Validée' 
                          : a.status === 'REJETEE' ? 'Refusée' 
                          : 'En attente',
                    etudiant: `${proprietaire.nom || ''} ${proprietaire.prenom || ''}`.trim() || 'Inconnu',
                    image: getFullImageUrl(a.exemplaire?.photoUrl, a.id),
                    description: a.description || 'Aucune description fournie.',
                    datePublication: a.datePublication ? new Date(a.datePublication).toLocaleDateString() : 'N/A',
                    categorie: ouvrage.categorie?.label || 'Non classé',
                    filiere: proprietaire.filiere || 'N/A',
                    ville: proprietaire.ville || 'N/A',
                    dbStatus: a.status
                };
            });
            setAnnonces(formatted);
        } catch(err) {
            toast.error("Erreur de chargement des annonces");
            console.error(err);
        }
    }

    useEffect(() => {
        fetchAnnonces();
    }, []);

    // Reset pagination to page 1 on search or filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const updateStatut = async (id, newStatutUI) => {
        const dbStatus = newStatutUI === 'Validée' ? 'ACTIF' 
                     : newStatutUI === 'Refusée' ? 'REJETEE' 
                     : 'ATTENTE';
        
        try {
            await bookApi.updateStatus(id, dbStatus);
            setAnnonces(annonces.map(a => a.id === id ? { ...a, statut: newStatutUI, dbStatus: dbStatus } : a));
            
            if (newStatutUI === 'Validée') {
                toast.success(`L'annonce a été validée.`);
            } else if (newStatutUI === 'Refusée') {
                toast.error(`L'annonce a été refusée.`);
            } else {
                toast.success(`L'annonce a été remise en attente.`);
            }
        } catch(err) {
            toast.error("Échec de la mise à jour");
        }
    };

    const filtered = annonces.filter(a => {
        const matchesSearch = a.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.etudiant.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === 'ALL' || a.statut === statusFilter;
        return matchesSearch && matchesFilter;
    });

    // Calc pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedAnnonces = filtered.slice(indexOfFirstItem, indexOfLastItem);

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
                {paginatedAnnonces.map(annonce => (
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
                            <button 
                                className={`${styles.iconAction} ${styles.viewBtn}`} 
                                title="Détails"
                                onClick={() => setViewingAnnonce(annonce)}
                            >
                                <Eye size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>

                {/* Pagination Controls */}
                {filtered.length > 0 && (
                    <div className={styles.pagination}>
                        <div className={styles.pageInfo}>
                            Affichage de <b>{indexOfFirstItem + 1}</b> à <b>{Math.min(indexOfLastItem, filtered.length)}</b> sur <b>{filtered.length}</b> annonces
                        </div>
                        <div className={styles.paginationActions}>
                            <button
                                className={styles.pageBtn}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                ‹
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.activePage : ''}`}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className={styles.pageBtn}
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {viewingAnnonce && (
                <Modal 
                    isOpen={true} 
                    onClose={() => setViewingAnnonce(null)} 
                    title="Détails de l'annonce"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <img 
                                src={viewingAnnonce.image} 
                                alt={viewingAnnonce.titre} 
                                style={{ width: '90px', height: '125px', objectFit: 'cover', borderRadius: '6px' }} 
                            />
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '18px', marginBottom: '2px', lineHeight: '1.2' }}>{viewingAnnonce.titre}</h2>
                                <p style={{ color: '#6b7280', marginBottom: '8px' }}>par {viewingAnnonce.auteur}</p>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                    <span className={styles.simpleBadge} style={{ padding: '2px 6px', fontSize: '11px' }}>{viewingAnnonce.type}</span>
                                    <span className={styles.priceBadge} style={{ padding: '2px 6px', fontSize: '11px' }}>{viewingAnnonce.prix}</span>
                                    <span className={styles.etatBadge} style={{ padding: '2px 6px', fontSize: '11px' }}>{viewingAnnonce.etat}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 10px' }}>
                                    <span style={{ fontWeight: '600' }}>Catégorie:</span> <span>{viewingAnnonce.categorie}</span>
                                    <span style={{ fontWeight: '600' }}>Date ajout:</span> <span>{viewingAnnonce.datePublication}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: '#f9fafb', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <h4 style={{ marginBottom: '4px', fontSize: '13px', color: '#374151', fontWeight: '600' }}>Description</h4>
                            <p style={{ color: '#4b5563', lineHeight: '1.4' }}>{viewingAnnonce.description}</p>
                        </div>

                        <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                            <h4 style={{ gridColumn: 'span 2', marginBottom: '2px', fontSize: '13px', color: '#166534', fontWeight: '600' }}>Vendeur (Étudiant)</h4>
                            <p><strong>Nom:</strong> {viewingAnnonce.etudiant}</p>
                            <p><strong>Ville:</strong> {viewingAnnonce.ville}</p>
                            <p style={{ gridColumn: 'span 2' }}><strong>Filière:</strong> {viewingAnnonce.filiere}</p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                            <button 
                                onClick={() => setViewingAnnonce(null)}
                                style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
