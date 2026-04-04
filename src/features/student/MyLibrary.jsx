import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Book, Trash2, Plus, Search, Filter, 
    MoreHorizontal, BookOpen, Clock, 
    CheckCircle, AlertCircle, Edit2, 
    ArrowRightCircle, Library, History, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exemplaireApi } from '../../api/client';
import { getFullImageUrl } from '../../utils/imageHandler';
import toast from 'react-hot-toast';
import styles from './MyLibrary.module.css';

const ETATS = ['NEUF', 'BON', 'ACCEPTABLE', 'USE'];
const ETAT_LABELS = { NEUF: 'Neuf', BON: 'Bon état', ACCEPTABLE: 'Acceptable', USE: 'Usé' };

export default function MyLibrary() {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [editEtat, setEditEtat] = useState('BON');
    const [editTitre, setEditTitre] = useState('');
    const [editAuteur, setEditAuteur] = useState('');
    const [editIsbn, setEditIsbn] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        try {
            setIsLoading(true);
            const { data } = await exemplaireApi.getMyLibrary();
            setBooks(data);
        } catch (error) {
            toast.error('Erreur lors du chargement de la bibliothèque');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (book) => {
        setSelectedBook(book);
        setEditEtat(book.etat);
        setEditTitre(book.titre);
        setEditAuteur(book.auteur || '');
        setEditIsbn(book.isbn || '');
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedBook) return;
        try {
            setIsUpdating(true);
            await exemplaireApi.update(selectedBook.id, { 
                etat: editEtat,
                photoUrl: selectedBook.photoUrl,
                titre: editTitre,
                auteur: editAuteur,
                isbn: editIsbn
            });
            toast.success('Livre mis à jour');
            setIsEditModalOpen(false);
            fetchLibrary();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous supprimer ce livre de votre bibliothèque ?')) return;
        try {
            await exemplaireApi.delete(id);
            toast.success('Livre supprimé');
            fetchLibrary();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const filteredBooks = books.filter(b => 
        b.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.auteur?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <Library className={styles.headerIcon} />
                    <div>
                        <h1>Ma Bibliothèque</h1>
                        <p>Gérez votre collection personnelle de manuels et ouvrages.</p>
                    </div>
                </div>
                <button 
                    className={styles.btnAdd}
                    onClick={() => navigate('/student-dashboard/publish')}
                >
                    <Plus size={20} />
                    <span>Nouveau Livre</span>
                </button>
            </div>

            {/* Stats Bar */}
            <div className={styles.statsBar}>
                <div className={styles.statCard}>
                    <span className={styles.statVal}>{books.length}</span>
                    <span className={styles.statLabel}>Ouvrages Total</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statVal}>
                        {books.filter(b => b.etat === 'NEUF').length}
                    </span>
                    <span className={styles.statLabel}>État Neuf</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statVal}>
                        {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
                    </span>
                    <span className={styles.statLabel}>Dernière Activité</span>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <Search className={styles.searchIcon} size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher par titre, auteur..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterBtn}>
                    <Filter size={18} />
                    <span>Filtrer</span>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Chargement de votre collection...</p>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className={styles.empty}>
                    <Book size={64} className={styles.emptyIcon} />
                    <h3>Votre bibliothèque est vide</h3>
                    <p>Commencez à ajouter des livres ou achetez-en pour agrandir votre collection.</p>
                    <button onClick={() => navigate('/student-dashboard/publish')}>Ajouter mon premier livre</button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredBooks.map((book) => (
                        <motion.div 
                            key={book.id} 
                            className={styles.card}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className={styles.cardImage}>
                                <img src={getFullImageUrl(book.photoUrl)} alt={book.titre} />
                                <div className={styles.badgeEtat} data-etat={book.etat}>{book.etat}</div>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardTitle}>
                                    <h3>{book.titre}</h3>
                                    <button className={styles.btnMore}><MoreHorizontal size={18}/></button>
                                </div>
                                <span className={styles.author}>{book.auteur || 'Auteur inconnu'}</span>
                                
                                <div className={styles.cardMeta}>
                                    <div className={styles.metaItem}>
                                        <Clock size={14} />
                                        <span>Ajouté le {new Date(book.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <BookOpen size={14} />
                                        <span>{book.categorie_label || 'Général'}</span>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <button 
                                        className={styles.btnPublish}
                                        onClick={() => navigate('/student-dashboard/publish', { state: { exemplaireId: book.id } })}
                                    >
                                        <ArrowRightCircle size={16} />
                                        Annoncer
                                    </button>
                                    <div className={styles.iconActions}>
                                        <button 
                                            className={styles.iconBtn} 
                                            title="Modifier"
                                            onClick={() => handleEditClick(book)}
                                        >
                                            <Edit2 size={16}/>
                                        </button>
                                        <button 
                                            className={styles.iconBtnDanger} 
                                            title="Supprimer"
                                            onClick={() => handleDelete(book.id)}
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className={styles.modalOverlay}>
                        <motion.div 
                            className={styles.modal}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <div className={styles.modalHeader}>
                                <h2>Modifier l'ouvrage</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className={styles.btnClose}><X /></button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className={styles.editSection}>
                                    <label>Titre de l'ouvrage</label>
                                    <input 
                                        type="text" 
                                        className={styles.modalInput}
                                        value={editTitre}
                                        onChange={(e) => setEditTitre(e.target.value)}
                                        placeholder="Titre complet"
                                    />
                                </div>

                                <div className={styles.editSection}>
                                    <label>Auteur(s)</label>
                                    <input 
                                        type="text" 
                                        className={styles.modalInput}
                                        value={editAuteur}
                                        onChange={(e) => setEditAuteur(e.target.value)}
                                        placeholder="Nom de l'auteur"
                                    />
                                </div>

                                <div className={styles.editSection}>
                                    <label>ISBN</label>
                                    <input 
                                        type="text" 
                                        className={styles.modalInput}
                                        value={editIsbn}
                                        onChange={(e) => setEditIsbn(e.target.value)}
                                        placeholder="Ex: 978-..."
                                    />
                                </div>

                                <div className={styles.editSection}>
                                    <label>État de l'exemplaire</label>
                                    <div className={styles.etatGrid}>
                                        {ETATS.map(e => (
                                            <button 
                                                key={e}
                                                className={`${styles.etatBtn} ${editEtat === e ? styles.etatBtnActive : ''}`}
                                                onClick={() => setEditEtat(e)}
                                            >
                                                {ETAT_LABELS[e]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button className={styles.btnCancel} onClick={() => setIsEditModalOpen(false)}>Annuler</button>
                                <button 
                                    className={styles.btnSave} 
                                    onClick={handleUpdate}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Mise à jour...' : 'Enregistrer'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
