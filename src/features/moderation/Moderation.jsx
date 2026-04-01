import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { plainteApi } from '../../api/client';
import styles from './Moderation.module.css';

export default function Moderation() {
    const [reports, setReports] = useState([]);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
    const [isLoading, setIsLoading] = useState(true);

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
                date: new Date(r.created_at).toLocaleDateString(),
                reporter: r.plaignant_nom || 'Utilisateur inconnu',
                reported: r.concerne_id || 'System/Inconnu', // Optional in our DB, defaulting for UI
                subject: r.sujet,
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
            toast.success("Plainte marquée comme résolue.");
        } catch (err) {
            toast.error("Erreur lors de la mise à jour.");
        }
    };

    const deleteReport = (id) => {
        // Technically hide it or map it to another DB column if we add physical delete
        setReports(reports.filter(r => r.id !== id));
        toast.success("Signalement archivé de l'historique.");
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
        </div>
    );
}
