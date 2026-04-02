import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Trash2, ArrowRight, Eye, User, FileText, Calendar, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { plainteApi } from '../../api/client';
import Modal from '../../components/ui/Modal';
import { getFullImageUrl } from '../../utils/imageHandler';
import styles from './Moderation.module.css';

export default function Moderation() {
    const [reports, setReports] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadReports = async () => {
        try {
            const response = await plainteApi.getAll();
            
            const typeMap = {
                'COMPORTEMENT': 'Comportement',
                'FRAUDE': 'Fraude',
                'LIVRE_NON_CONFORME': 'Non Conforme',
                'RETARD_RETOUR': 'Retard',
                'AUTRE': 'Autre'
            };

            // Map DB format to the UI format expected by Moderation styles
            const formatted = response.data.map(r => ({
                id: r.id,
                type: typeMap[r.type] || r.type,
                date: new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                reporter: r.plaignant_nom || 'Utilisateur inconnu',
                reported: r.reported_item ? `${r.reported_item} (${r.reported_user})` : (r.reported_user || 'Signalement Général'),
                subject: r.sujet,
                description: r.description || "Aucune description fournie.",
                proofUrl: r.preuve_url,
                status: r.status === 'RESOLU' ? 'Resolved' : 'Pending',
                severity: r.type === 'FRAUDE' || r.type === 'COMPORTEMENT' ? 'High' : 'Medium' 
            }));
            
            setReports(formatted);
        } catch (error) {
            toast.error("Échec du chargement des plaintes.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const resolveReport = async (id) => {
        try {
            await plainteApi.updateStatus(id, 'RESOLU');
            setReports(reports.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
            if (selectedReport?.id === id) {
                setSelectedReport({ ...selectedReport, status: 'Resolved' });
            }
            toast.success("Plainte marquée comme résolue.");
        } catch (err) {
            toast.error("Erreur lors de la mise à jour.");
        }
    };

    const deleteReport = (id) => {
        setReports(reports.filter(r => r.id !== id));
        toast.success("Signalement archivé de l'historique.");
    };

    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const displayedReports = reports.filter(r =>
        activeTab === 'active' ? r.status === 'Pending' : r.status === 'Resolved'
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Modération & Plaintes</h1>
                    <p className={styles.subtitle}>Gérez les signalements et les conflits entre utilisateurs.</p>
                </div>
            </header>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'active' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Plaintes en attente
                    <span className={styles.tabCount}>
                        {reports.filter(r => r.status === 'Pending').length}
                    </span>
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Historique
                    <span className={styles.tabCount}>
                        {reports.filter(r => r.status === 'Resolved').length}
                    </span>
                </button>
            </div>

            <div className={styles.reportsContainer}>
                {displayedReports.length > 0 ? displayedReports.map(report => (
                    <div key={report.id} className={styles.reportRow}>
                        <div className={styles.typeCol}>
                            <div className={`${styles.priorityDot} ${styles[report.severity.toLowerCase()]}`} />
                            <span className={styles.typeBadge}>{report.type}</span>
                        </div>

                        <div className={styles.subjectCol}>
                            <span className={styles.subjectText}>{report.subject}</span>
                        </div>

                        <div className={styles.actorsCol}>
                            <span className={styles.actorName}>{report.reporter}</span>
                            <ArrowRight size={14} className={styles.actorArrow} />
                            <span className={styles.actorName}>{report.reported}</span>
                        </div>

                        <div className={styles.dateCol}>
                            <span className={styles.dateText}>{report.date}</span>
                        </div>

                        <div className={styles.actionsCol}>
                            <button 
                                className={`${styles.iconAction} ${styles.viewBtn}`} 
                                onClick={() => handleViewDetails(report)}
                                title="Voir les détails"
                            >
                                <Eye size={18} />
                            </button>

                            {report.status === 'Pending' ? (
                                <>
                                    <button 
                                        className={`${styles.iconAction} ${styles.resolveBtn}`} 
                                        onClick={() => resolveReport(report.id)}
                                        title="Marquer comme résolu"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                    <button 
                                        className={`${styles.iconAction} ${styles.banBtn}`}
                                        title="Bannir l'utilisateur"
                                    >
                                        <ShieldAlert size={18} />
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={`${styles.iconAction} ${styles.deleteBtn}`} 
                                    onClick={() => deleteReport(report.id)}
                                    title="Supprimer de l'historique"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className={styles.emptyState}>Aucun signalement en attente.</div>
                )}
            </div>

            {/* Détails de la plainte Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Détails du Signalement"
            >
                {selectedReport && (
                    <div className={styles.detailContainer}>
                        <div className={styles.detailHeader}>
                            <div className={`${styles.detailBadge} ${styles[selectedReport.severity.toLowerCase()]}`}>
                                {selectedReport.type}
                            </div>
                            <h2 className={styles.detailTitle}>{selectedReport.subject}</h2>
                        </div>

                        <div className={styles.detailInfoGrid}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}><User size={14} /> Plaignant</div>
                                <div className={styles.infoValue}>{selectedReport.reporter}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}><ArrowRight size={14} /> Mis en cause</div>
                                <div className={styles.infoValue}>{selectedReport.reported}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}><Calendar size={14} /> Date</div>
                                <div className={styles.infoValue}>{selectedReport.date}</div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}><Info size={14} /> Statut</div>
                                <div className={`${styles.statusBadge} ${selectedReport.status === 'Pending' ? styles.pending : styles.resolved}`}>
                                    {selectedReport.status === 'Pending' ? 'En attente' : 'Résolu'}
                                </div>
                            </div>
                        </div>

                        <div className={styles.descriptionSection}>
                            <h3 className={styles.sectionTitle}><FileText size={16} /> Description des faits</h3>
                            <div className={styles.descriptionContent}>
                                {selectedReport.description}
                            </div>
                        </div>

                        {selectedReport.proofUrl && (
                            <div className={styles.proofSection}>
                                <h3 className={styles.sectionTitle}>Preuve fournie</h3>
                                <div className={styles.proofImageWrapper}>
                                    <img 
                                        src={getFullImageUrl(selectedReport.proofUrl)} 
                                        alt="Preuve" 
                                        className={styles.proofImage}
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=Image+non+disponible'}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.modalActions}>
                            {selectedReport.status === 'Pending' && (
                                <button 
                                    className={styles.primaryActionBtn}
                                    onClick={() => {
                                        resolveReport(selectedReport.id);
                                        setIsModalOpen(false);
                                    }}
                                >
                                    <CheckCircle size={18} /> Marquer comme résolu
                                </button>
                            )}
                            <button 
                                className={styles.secondaryActionBtn}
                                onClick={() => setIsModalOpen(false)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
