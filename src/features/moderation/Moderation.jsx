import { useState } from 'react';
import { ShieldAlert, CheckCircle, Trash2, ArrowRight } from 'lucide-react';
import styles from './Moderation.module.css';

const MOCK_REPORTS = [
    { id: 1, type: 'Arnaque', date: '08/03/2026', reporter: 'Youssef B.', reported: 'Khalid M.', subject: 'Livre non reçu après virement', status: 'Pending', severity: 'High' },
    { id: 2, type: 'Contenu', date: '07/03/2026', reporter: 'Fatima Zahra F.', reported: 'Mehdi R.', subject: 'Photos inappropriées sur l\'annonce #103', status: 'Resolved', severity: 'Medium' },
    { id: 3, type: 'Harcèlement', date: '06/03/2026', reporter: 'Sofia K.', reported: 'Omar L.', subject: 'Langage agressif dans les messages', status: 'Pending', severity: 'High' },
    { id: 4, type: 'Qualité', date: '06/03/2026', reporter: 'Hassan D.', reported: 'Wafae B.', subject: 'Livre fortement surligné contrairement à l\'annonce', status: 'Pending', severity: 'Low' },
    { id: 5, type: 'Prix', date: '05/03/2026', reporter: 'Amine El Amrani', reported: 'Salma J.', subject: 'Prix différent lors du rendez-vous réel', status: 'Pending', severity: 'Medium' },
    { id: 6, type: 'No-Show', date: '05/03/2026', reporter: 'Khadija Bennani', reported: 'Ahmed S.', subject: 'Ne s\'est pas présenté au point de rendez-vous sur le campus', status: 'Pending', severity: 'Medium' },
    { id: 7, type: 'Fake', date: '04/03/2026', reporter: 'Zineb C.', reported: 'Imane O.', subject: 'Faux manuel photocopié (Interdit)', status: 'Pending', severity: 'High' },
    { id: 8, type: 'Comportement', date: '04/03/2026', reporter: 'Rachid L.', reported: 'Meryem Z.', subject: 'Comportement irrespectueux lors de l\'échange', status: 'Pending', severity: 'Medium' },
    { id: 9, type: 'Vandalisme', date: '03/03/2026', reporter: 'Anas I.', reported: 'Yassir B.', subject: 'Pages manquantes dans le tome 2 d\'Anatomie', status: 'Pending', severity: 'High' },
    { id: 10, type: 'Usurpation', date: '03/03/2026', reporter: 'Sara Z.', reported: 'Mehdi T.', subject: 'Utilise la photo de profil d\'un autre étudiant', status: 'Pending', severity: 'Medium' },
];

export default function Moderation() {
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

    const resolveReport = (id) => {
        setReports(reports.map(r => r.id === id ? { ...r, status: 'Resolved' } : r));
    };

    const deleteReport = (id) => {
        setReports(reports.filter(r => r.id !== id));
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
