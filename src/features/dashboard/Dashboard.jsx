import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, ShieldAlert, ArrowUpRight, TrendingUp, Calendar, Inbox, BarChart3, GraduationCap, ShoppingCart, HandHeart, Gift, MoreHorizontal, Zap, Command, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './Dashboard.module.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1, y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className={styles.customTooltip}>
                <p className={styles.tooltipLabel}>{label}</p>
                <div className={styles.tooltipValue}>
                    <TrendingUp size={12} style={{ marginRight: '4px' }} />
                    {payload[0].value} <span className={styles.tooltipUnit}>interactions</span>
                </div>
            </div>
        );
    }
    return null;
};

const STATS = [
    { label: 'Utilisateurs Actifs', value: '1,482', change: '+12%', icon: Users, color: '#3b82f6', trend: [{v:40},{v:35},{v:50},{v:45},{v:60},{v:55},{v:70}] },
    { label: 'Annonces en ligne', value: '3,210', change: '+5%', icon: BookOpen, color: '#10b981', trend: [{v:20},{v:25},{v:22},{v:30},{v:28},{v:35},{v:40}] },
    { label: 'Signalements récents', value: '12', change: '-8%', icon: ShieldAlert, color: '#ef4444', trend: [{v:50},{v:40},{v:45},{v:30},{v:25},{v:20},{v:15}] },
    { label: 'Échanges réussis', value: '892', change: '+18%', icon: TrendingUp, color: '#f59e0b', trend: [{v:30},{v:45},{v:40},{v:60},{v:55},{v:75},{v:70}] },
];

const CHART_DATA_7 = [
    { label: 'Lun', value: 450 }, { label: 'Mar', value: 650 },
    { label: 'Mer', value: 350 }, { label: 'Jeu', value: 850 },
    { label: 'Ven', value: 550 }, { label: 'Sam', value: 950 },
    { label: 'Dim', value: 750 },
];

const CHART_DATA_30 = [
    { label: 'Sem 1', value: 1200 }, { label: 'Sem 2', value: 1850 },
    { label: 'Sem 3', value: 1400 }, { label: 'Sem 4', value: 2100 },
];

const TOP_FILIERES = [
    { nom: 'Informatique', annonces: 142, pct: 85, color: '#3b82f6' },
    { nom: 'Droit & Sciences Po', annonces: 98, pct: 62, color: '#f97316' },
    { nom: 'Économie & Gestion', annonces: 76, pct: 48, color: '#10b981' },
    { nom: 'Médecine & Santé', annonces: 45, pct: 30, color: '#ef4444' },
    { nom: 'Génie Civil', annonces: 32, pct: 22, color: '#8b5cf6' },
    { nom: 'Lettres & Langues', annonces: 28, pct: 18, color: '#ec4899' },
    { nom: 'Architecture', annonces: 15, pct: 10, color: '#f59e0b' },
    { nom: 'Mathématiques', annonces: 12, pct: 8, color: '#06b6d4' },
];

const TYPE_DISTRIBUTION = [
    { name: 'Vente', value: 520, color: '#3b82f6' },
    { name: 'Prêt', value: 280, color: '#f59e0b' },
    { name: 'Don', value: 140, color: '#10b981' },
];

const RECENT_ACTIVITIES = [
    { id: 1, type: 'inscription', user: 'Meryem A.', action: "s'est inscrite", time: '2m', avatar: 'https://i.pravatar.cc/150?u=meryem', color: '#3b82f6', icon: Users },
    { id: 2, type: 'validation', user: 'Yassine K.', action: 'Analyse Mathématique validée', time: '15m', avatar: 'https://i.pravatar.cc/150?u=yassine', color: '#10b981', icon: BookOpen },
    { id: 3, type: 'signalement', user: '#1290', action: 'Signalement reçu', time: '1h', avatar: 'https://i.pravatar.cc/150?u=report', color: '#ef4444', icon: ShieldAlert },
    { id: 4, type: 'echange', user: 'Hicham B.', action: 'A complété un échange', time: '3h', avatar: 'https://i.pravatar.cc/150?u=hicham', color: '#f59e0b', icon: TrendingUp },
];

export default function Dashboard() {
    const [chartRange, setChartRange] = useState('7');
    const [isDownloading, setIsDownloading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFilieres = TOP_FILIERES.filter(f => 
        f.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownloadReport = () => {
        setIsDownloading(true);
        setTimeout(() => {
            setIsDownloading(false);
            alert("✅ Le rapport hebdomadaire a été généré avec succès !");
        }, 1500);
    };

    return (
        <motion.div 
            className={styles.dashboard}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className={styles.header}>
                <div className={styles.welcomeText}>
                    <h1 className={styles.title}>Tableau de Bord</h1>
                    <div className={styles.subtitleWrapper}>
                        <div className={styles.livePulse} />
                        <p className={styles.subtitle}>Supervision globale en temps réel</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.exportBtn} onClick={handleDownloadReport} disabled={isDownloading}>
                        <Calendar size={16} />
                        <span>{isDownloading ? 'Génération...' : 'Exporter'}</span>
                    </button>
                </div>
            </header>

            <div className={styles.statsGrid}>
                {STATS.map((stat, i) => {
                    const Icon = stat.icon;
                    const isPositive = stat.change.startsWith('+');
                    return (
                        <motion.div 
                            key={i} 
                            className={styles.statCard}
                            variants={itemVariants}
                            whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
                        >
                            <div className={styles.statHeader}>
                                <div className={styles.iconWrapper} style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    <Icon size={18} />
                                </div>
                                <div className={styles.sparklineWrapper}>
                                    <ResponsiveContainer width="100%" height={30}>
                                        <AreaChart data={stat.trend}>
                                            <Area type="monotone" dataKey="v" stroke={stat.color} fill={stat.color} fillOpacity={0.1} strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className={styles.statBody}>
                                <div className={styles.statValueRow}>
                                    <h3>{stat.value}</h3>
                                    <span className={`${styles.compactBadge} ${isPositive ? styles.positive : styles.negative}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <p>{stat.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className={styles.chartsGrid}>
                <motion.div className={styles.chartCard} style={{ gridColumn: 'span 1' }} variants={itemVariants}>
                    <div className={styles.chartHeader}>
                        <div className={styles.titleWithIcon}>
                            <TrendingUp size={16} color="#3b82f6" />
                            <h3>Trafic & Inscriptions</h3>
                        </div>
                        <div className={styles.chartActions}>
                            <button className={`${styles.chartTab} ${chartRange === '7' ? styles.activeTab : ''}`} onClick={() => setChartRange('7')}>7J</button>
                            <button className={`${styles.chartTab} ${chartRange === '30' ? styles.activeTab : ''}`} onClick={() => setChartRange('30')}>30J</button>
                        </div>
                    </div>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={150}>
                            <AreaChart data={chartRange === '7' ? CHART_DATA_7 : CHART_DATA_30}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div className={styles.chartCard} variants={itemVariants}>
                    <div className={styles.chartHeader}>
                        <div className={styles.titleWithIcon}>
                            <Inbox size={16} color="#f59e0b" />
                            <h3>Activités Récentes</h3>
                        </div>
                        <button className={styles.viewMoreBtn}>Voir tout</button>
                    </div>
                    <ul className={styles.listArea}>
                        {RECENT_ACTIVITIES.map((act) => (
                            <li key={act.id} className={styles.listItem}>
                                <div className={styles.timelineNode} style={{ borderColor: act.color }} />
                                <div className={styles.itemAvatar}>
                                    <img src={act.avatar} alt={act.user} />
                                    {(() => {
                                        const Icon = act.icon;
                                        return (
                                            <div className={styles.avatarIcon} style={{ background: act.color }}>
                                                <Icon size={8} color="white" />
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className={styles.itemInfo}>
                                    <h4>{act.user}</h4>
                                    <p>{act.action}</p>
                                </div>
                                <span className={styles.timeLabel}>{act.time}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            </div>

            <div className={styles.analyticsGrid}>
                <motion.div className={styles.analyticsCard} variants={itemVariants}>
                    <div className={styles.chartHeader}>
                        <div className={styles.titleWithIcon}>
                            <GraduationCap size={16} color="#3b82f6" />
                            <h3>Filières & Campus</h3>
                        </div>
                        <div className={styles.searchWrapper}>
                            <input 
                                type="text" 
                                placeholder="Chercher..." 
                                className={styles.cardSearch}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.progressList}>
                        {filteredFilieres.map((f, i) => (
                            <div key={i} className={styles.progressItem}>
                                <div className={styles.progressHeader}>
                                    <span className={styles.progressName}>{f.nom}</span>
                                    <span className={styles.progressCount}>{f.annonces} ads</span>
                                </div>
                                <div className={styles.progressBarBg}>
                                    <motion.div 
                                        className={styles.progressBarFill} 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${f.pct}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        style={{ background: f.color }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className={styles.analyticsCard} variants={itemVariants}>
                    <div className={styles.chartHeader}>
                        <div className={styles.titleWithIcon}>
                            <BarChart3 size={16} color="#f59e0b" />
                            <h3>Répartition par Type</h3>
                        </div>
                    </div>
                    <div className={styles.donutWrapper}>
                        <ResponsiveContainer width="100%" height={140}>
                            <PieChart>
                                <Pie
                                    data={TYPE_DISTRIBUTION}
                                    innerRadius={45}
                                    outerRadius={65}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {TYPE_DISTRIBUTION.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className={styles.donutLegend}>
                            {TYPE_DISTRIBUTION.map((item, i) => (
                                <div key={i} className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ background: item.color }} />
                                    <span className={styles.legendName}>{item.name}</span>
                                    <span className={styles.legendVal}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div className={styles.quickActionsBar} variants={itemVariants}>
                <div className={styles.qaTitle}>
                    <Zap size={14} className={styles.zapIcon} />
                    <span>Actions Rapides</span>
                </div>
                <div className={styles.qaList}>
                    <button className={styles.qaBtn}><Users size={12} /> Bannir</button>
                    <button className={styles.qaBtn}><ShieldAlert size={12} /> Modérer</button>
                    <button className={styles.qaBtn}><Database size={12} /> Backup</button>
                    <button className={styles.qaBtn}><Command size={12} /> Logs</button>
                </div>
                <div className={styles.qaStatus}>
                    <div className={styles.statusDot} />
                    Système Opérationnel
                </div>
            </motion.div>
        </motion.div>
    );
}
