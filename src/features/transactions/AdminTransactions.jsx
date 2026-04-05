import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
    MoreHorizontal, Eye, CheckCircle2, Clock, XCircle, 
    Calendar, User, BookOpen, CreditCard, MapPin, Repeat
} from 'lucide-react';
import { transactionApi } from '../../api/client';
import styles from './AdminTransactions.module.css';

const STATUS_CONFIG = {
    PENDING: { label: 'En attente', color: '#f59e0b', icon: Clock, bg: 'rgba(245,158,11,0.1)' },
    ACCEPTED: { label: 'Accepté', color: '#3b82f6', icon: CheckCircle2, bg: 'rgba(59,130,246,0.1)' },
    MEETING_SCHEDULED: { label: 'RDV Fixé', color: '#8b5cf6', icon: MapPin, bg: 'rgba(139,92,246,0.1)' },
    COMPLETED: { label: 'Terminée', color: '#10b981', icon: CheckCircle2, bg: 'rgba(16,185,129,0.1)' },
    CANCELLED: { label: 'Annulée', color: '#ef4444', icon: XCircle, bg: 'rgba(239,68,68,0.1)' }
};

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setIsLoading(true);
                const { data } = await transactionApi.getAdminTransactions();
                setTransactions(data);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.ouvrage_titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.id.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    // Calc pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    // Optimized pagination range for large datasets
    const getPaginationRange = () => {
        const delta = 2;
        const range = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        const rangeWithDots = [];
        let l;
        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };

    const handleStatusUpdate = async (id, action) => {
        try {
            let response;
            if (action === 'accept') response = await transactionApi.accept(id);
            else if (action === 'schedule') response = await transactionApi.schedule(id, { date: new Date().toISOString(), lieu: 'Campus yTera' });
            else if (action === 'complete') response = await transactionApi.complete(id);
            else if (action === 'cancel') response = await transactionApi.cancel(id);

            if (response) {
                // Update local list
                setTransactions(prev => prev.map(t => 
                    t.id === id ? { ...t, status: (action === 'schedule' ? 'MEETING_SCHEDULED' : action.toUpperCase()) } : t
                ));
            }
        } catch (error) {
            console.error(`Failed to update status (${action}):`, error);
        } finally {
            // Updated: Removed openMenu state update
        }
    };

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Suivi des Transactions</h1>
                    <p className={styles.subtitle}>Consultez et gérez l'ensemble des échanges COD sur yTera.</p>
                </div>
                <div className={styles.statsOverview}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total</span>
                        <span className={styles.statValue}>{transactions.length}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Terminées</span>
                        <span className={styles.statValue} style={{ color: '#10b981' }}>
                            {transactions.filter(t => t.status === 'COMPLETED').length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className={styles.filtersBar}>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input 
                        type="text" 
                        placeholder="Rechercher un livre, un étudiant, un ID..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <Filter size={18} className={styles.filterIcon} />
                    <select 
                        value={statusFilter} 
                        onChange={handleStatusFilterChange}
                        className={styles.filterSelect}
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="PENDING">En attente</option>
                        <option value="ACCEPTED">Acceptés</option>
                        <option value="MEETING_SCHEDULED">RDV Fixés</option>
                        <option value="COMPLETED">Terminées</option>
                        <option value="CANCELLED">Annulées</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className={styles.tableCard}>
                {isLoading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Chargement des transactions...</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Repeat size={48} className={styles.emptyIcon} />
                        <h3>Aucune transaction trouvée</h3>
                        <p>Ajustez vos filtres ou recherchez un autre terme.</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th># ID</th>
                                <th>Livre / Manuel</th>
                                <th>Acheteur</th>
                                <th>Vendeur</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Date Création</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTransactions.map((t) => {
                                const stat = STATUS_CONFIG[t.status];
                                const StatusIcon = stat.icon;
                                
                                return (
                                    <motion.tr 
                                        key={t.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        layout
                                    >
                                        <td className={styles.idCell}>#{t.id}</td>
                                        <td className={styles.bookCell}>
                                            <div className={styles.bookInfo}>
                                                <BookOpen size={16} className={styles.cellIcon} />
                                                <span>{t.ouvrage_titre}</span>
                                            </div>
                                        </td>
                                        <td className={styles.userCell}>
                                            <div className={styles.userInfo}>
                                                <User size={16} className={styles.cellIcon} />
                                                <span>{t.buyer_name}</span>
                                            </div>
                                        </td>
                                        <td className={styles.userCell}>
                                            <div className={styles.userInfo}>
                                                <User size={16} className={styles.cellIcon} />
                                                <span>{t.seller_name}</span>
                                            </div>
                                        </td>
                                        <td className={styles.priceCell}>
                                            <div className={styles.priceInfo}>
                                                <CreditCard size={16} className={styles.cellIcon} />
                                                <strong>{t.amount} DH</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <span 
                                                className={styles.statusBadge}
                                                style={{ backgroundColor: stat.bg, color: stat.color }}
                                            >
                                                <StatusIcon size={12} className={styles.badgeIcon} />
                                                {stat.label}
                                            </span>
                                        </td>
                                        <td className={styles.dateCell}>
                                            <div className={styles.dateInfo}>
                                                <Calendar size={14} className={styles.cellIcon} />
                                                {new Date(t.created_at).toLocaleDateString('fr-FR')}
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
                
                {/* Pagination Stats */}
                {!isLoading && filteredTransactions.length > 0 && (
                    <div className={styles.paginationFooter}>
                        <div className={styles.paginationInfo}>
                            Affichage de <b>{indexOfFirstItem + 1}</b> à <b>{Math.min(indexOfLastItem, filteredTransactions.length)}</b> sur <b>{filteredTransactions.length}</b> transactions
                        </div>
                        <div className={styles.paginationControls}>
                            <button 
                                className={styles.pageBtn} 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            {getPaginationRange().map((page, index) => (
                                page === '...' ? (
                                    <span key={`dots-${index}`} className={styles.paginationEllipsis}>...</span>
                                ) : (
                                    <button 
                                        key={`page-${page}`}
                                        className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            <button 
                                className={styles.pageBtn}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
