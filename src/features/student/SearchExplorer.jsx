import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, SlidersHorizontal, X, LayoutGrid, List, ChevronDown, Map,
    BookOpen, MapPin, Eye, Heart, ShieldCheck, Hash, Filter,
    ChevronUp, RotateCcw, AlertCircle, Sparkles
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ManualCard from './ManualCard';
import { ALL_BOOKS, ETAT_LABELS, ETAT_COLORS, TYPE_LABELS, TYPE_COLORS } from '../../data/mockBooks';
import styles from './SearchExplorer.module.css';

// Fix Leaflet icons issues with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ISBN lookup map for "magic" auto-detection
const ISBN_MAP = {};
ALL_BOOKS.forEach(b => { ISBN_MAP[b.isbn] = b.titreAnnonce; });

const FILIERES = [...new Set(ALL_BOOKS.map(b => b.filiere))].sort();
const ETATS = ['NEUF', 'BON', 'ACCEPTABLE', 'USE'];
const TYPES = ['VENTE', 'PRET', 'DON'];
const SORT_OPTIONS = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'popular', label: 'Les plus consultés' },
];

// ============================
// SKELETON CARD (shimmer effect)
// ============================
function SkeletonCard() {
    return (
        <div className={styles.skeleton}>
            <div className={styles.skelImg}></div>
            <div className={styles.skelBody}>
                <div className={styles.skelLine} style={{ width: '80%' }}></div>
                <div className={styles.skelLine} style={{ width: '55%' }}></div>
                <div className={styles.skelRow}>
                    <div className={styles.skelLine} style={{ width: '35%' }}></div>
                    <div className={styles.skelLine} style={{ width: '25%' }}></div>
                </div>
            </div>
        </div>
    );
}

// ============================
// LIST VIEW ITEM
// ============================
function ListItem({ annonce, onClick }) {
    const priceLabel = annonce.typeEchange === 'VENTE' ? `${annonce.prixVente} DH`
        : annonce.typeEchange === 'DON' ? 'Gratuit' : 'Prêt';
    return (
        <motion.div className={styles.listItem} onClick={onClick}
            initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} whileHover={{ x: 4 }}>
            <img src={annonce.photoUrl} alt={annonce.titreAnnonce} className={styles.listImg} />
            <div className={styles.listInfo}>
                <h3>{annonce.titreAnnonce}</h3>
                <p className={styles.listAuthor}>{annonce.auteur}</p>
                <div className={styles.listMeta}>
                    <span><MapPin size={13} /> {annonce.ville}</span>
                    <span><Eye size={13} /> {annonce.nbVues}</span>
                    <span className={styles.listEtat} style={{ color: ETAT_COLORS[annonce.etat] }}>{ETAT_LABELS[annonce.etat]}</span>
                    {annonce.nbOperations >= 3 && <span className={styles.listTrust}><ShieldCheck size={12} /> Vérifié</span>}
                </div>
            </div>
            <div className={styles.listRight}>
                <span className={styles.listType} style={{ background: TYPE_COLORS[annonce.typeEchange] }}>
                    {TYPE_LABELS[annonce.typeEchange]}
                </span>
                <span className={styles.listPrice}>{priceLabel}</span>
            </div>
        </motion.div>
    );
}

// ============================
// MAP VIEW BUILDER
// ============================
function MapView({ results }) {
    // Coordonnées fictives pour les grandes villes universitaires
    const CITY_COORDS = {
        'Fès': [34.0331, -5.0002],
        'Casablanca': [33.5731, -7.5898],
        'Rabat': [34.0208, -6.8416],
        'Tanger': [35.7595, -5.8339],
        'Meknès': [33.8945, -5.5475],
        'Marrakech': [31.6295, -7.9811],
    };

    return (
        <motion.div
            className={styles.mapContainerWrapper}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
        >
            <MapContainer center={[33.8, -6.5]} zoom={6} scrollWheelZoom={true} className={styles.leafletMap}>
                {/* La tuile "voyager" a des couleurs neutres fluides, modifiée par CSS en Dark Mode */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />
                {results.map(b => {
                    const basePoint = CITY_COORDS[b.ville] || [33.5, -7.5];
                    // Petits décalages pour éviter que les livres d'une même ville soient superposés précisément
                    const lat = basePoint[0] + (Math.random() * 0.04 - 0.02);
                    const lng = basePoint[1] + (Math.random() * 0.04 - 0.02);

                    return (
                        <Marker key={b.id} position={[lat, lng]}>
                            <Popup className={styles.customPopup}>
                                <div className={styles.popupInner}>
                                    <img src={b.photoUrl} alt="" className={styles.popupImg} />
                                    <div className={styles.popupDetails}>
                                        <strong>{b.titreAnnonce}</strong>
                                        <p>{b.typeEchange === 'VENTE' ? `${b.prixVente} DH` : TYPE_LABELS[b.typeEchange]}</p>
                                        <span>📍 Campus {b.ville}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </motion.div>
    );
}

// ============================
// MAIN COMPONENT
// ============================
export default function SearchExplorer() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    // State
    const [query, setQuery] = useState(initialQuery);
    const [isbnDetected, setIsbnDetected] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('recent');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileSidebar, setMobileSidebar] = useState(false);

    // Filters
    const [maxPrice, setMaxPrice] = useState(110);
    const [selectedEtats, setSelectedEtats] = useState([]);
    const [selectedType, setSelectedType] = useState(null); // segment button: single selection
    const [selectedFilieres, setSelectedFilieres] = useState([]);
    const [filiereSearch, setFiliereSearch] = useState('');

    // Simulate loading delay on filter change
    useEffect(() => {
        setIsLoading(true);
        const t = setTimeout(() => setIsLoading(false), 700);
        return () => clearTimeout(t);
    }, [query, selectedEtats, selectedType, selectedFilieres, maxPrice, sortBy]);

    // ISBN magic auto-detection
    useEffect(() => {
        const trimmed = query.trim();
        if (/^978[-\s]?\d/.test(trimmed)) {
            const normalized = trimmed.replace(/[-\s]/g, '');
            const matchKey = Object.keys(ISBN_MAP).find(k => k.replace(/-/g, '').startsWith(normalized));
            setIsbnDetected(matchKey ? ISBN_MAP[matchKey] : null);
        } else {
            setIsbnDetected(null);
        }
    }, [query]);

    // Filter + Sort
    const results = useMemo(() => {
        let filtered = ALL_BOOKS.filter(b => {
            if (query) {
                const q = query.toLowerCase();
                const matchText = b.titreAnnonce.toLowerCase().includes(q)
                    || b.auteur.toLowerCase().includes(q)
                    || b.isbn.replace(/-/g, '').includes(q.replace(/[-\s]/g, ''))
                    || b.filiere.toLowerCase().includes(q);
                if (!matchText) return false;
            }
            if (b.typeEchange === 'VENTE' && b.prixVente > maxPrice) return false;
            if (selectedEtats.length > 0 && !selectedEtats.includes(b.etat)) return false;
            if (selectedType && b.typeEchange !== selectedType) return false;
            if (selectedFilieres.length > 0 && !selectedFilieres.includes(b.filiere)) return false;
            return true;
        });

        switch (sortBy) {
            case 'price_asc': filtered.sort((a, b) => (a.prixVente || 0) - (b.prixVente || 0)); break;
            case 'price_desc': filtered.sort((a, b) => (b.prixVente || 0) - (a.prixVente || 0)); break;
            case 'popular': filtered.sort((a, b) => b.nbVues - a.nbVues); break;
            default: filtered.sort((a, b) => new Date(b.datePublication) - new Date(a.datePublication));
        }
        return filtered;
    }, [query, maxPrice, selectedEtats, selectedType, selectedFilieres, sortBy]);

    const toggleEtat = (val) => setSelectedEtats(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    const toggleFiliere = (val) => setSelectedFilieres(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

    const resetFilters = () => {
        setSelectedEtats([]); setSelectedType(null); setSelectedFilieres([]);
        setMaxPrice(110); setQuery(''); setFiliereSearch('');
    };

    const activeFilterCount = selectedEtats.length + (selectedType ? 1 : 0) + selectedFilieres.length + (maxPrice < 110 ? 1 : 0);
    const filteredFilieres = FILIERES.filter(f => f.toLowerCase().includes(filiereSearch.toLowerCase()));

    // Shared sidebar content (reused for desktop + mobile)
    const sidebarContent = (
        <>
            <div className={styles.sidebarHeader}>
                <h3><Filter size={16} /> Filtres</h3>
                {activeFilterCount > 0 && (
                    <button className={styles.resetBtn} onClick={resetFilters}><RotateCcw size={13} /> Tout effacer</button>
                )}
            </div>

            {/* TYPE — Segment buttons */}
            <div className={styles.filterBlock}>
                <h4>Type d'échange</h4>
                <div className={styles.segmentGroup}>
                    {TYPES.map(t => (
                        <button key={t}
                            className={`${styles.segmentBtn} ${selectedType === t ? styles.segmentActive : ''}`}
                            style={selectedType === t ? { background: TYPE_COLORS[t], borderColor: TYPE_COLORS[t], color: 'white' } : {}}
                            onClick={() => setSelectedType(selectedType === t ? null : t)}>
                            {TYPE_LABELS[t]}
                        </button>
                    ))}
                </div>
            </div>

            {/* PRIX — Range slider */}
            <div className={styles.filterBlock}>
                <h4>Prix maximum</h4>
                <div className={styles.priceDisplay}>
                    <span>0 DH</span>
                    <span className={styles.priceValue}>{maxPrice >= 110 ? '110 DH' : `${maxPrice} DH`}</span>
                </div>
                <input type="range" min="0" max="110" step="5" value={maxPrice}
                    onChange={e => setMaxPrice(parseInt(e.target.value))}
                    className={styles.rangeSlider} />
            </div>

            {/* ÉTAT — Checkboxes with color dots */}
            <div className={styles.filterBlock}>
                <h4>État du livre</h4>
                {ETATS.map(e => (
                    <label key={e} className={styles.checkbox}>
                        <input type="checkbox" checked={selectedEtats.includes(e)}
                            onChange={() => toggleEtat(e)} />
                        <span className={styles.checkmark} style={selectedEtats.includes(e) ? { background: ETAT_COLORS[e], borderColor: ETAT_COLORS[e] } : {}}></span>
                        <span className={styles.checkDot} style={{ background: ETAT_COLORS[e] }}></span>
                        <span className={styles.checkLabel}>{ETAT_LABELS[e]}</span>
                        <span className={styles.checkCount}>{ALL_BOOKS.filter(b => b.etat === e).length}</span>
                    </label>
                ))}
            </div>

            {/* FILIÈRE — Searchable list */}
            <div className={styles.filterBlock}>
                <h4>Filière</h4>
                <input type="text" className={styles.filiereInput} placeholder="Chercher une filière..."
                    value={filiereSearch} onChange={e => setFiliereSearch(e.target.value)} />
                <div className={styles.filiereList}>
                    {filteredFilieres.map(f => (
                        <label key={f} className={styles.checkbox}>
                            <input type="checkbox" checked={selectedFilieres.includes(f)}
                                onChange={() => toggleFiliere(f)} />
                            <span className={styles.checkmark}></span>
                            <span className={styles.checkLabel}>{f}</span>
                            <span className={styles.checkCount}>{ALL_BOOKS.filter(b => b.filiere === f).length}</span>
                        </label>
                    ))}
                </div>
            </div>
        </>
    );

    return (
        <div className={styles.page}>

            {/* ====== SEARCH HEADER ====== */}
            <motion.div className={styles.header}
                initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className={styles.searchWrap}>
                    <Search size={20} className={styles.searchIcon} />
                    <input type="text" className={styles.searchInput} value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Rechercher par titre, auteur, ISBN ou filière..." />
                    {query && <button className={styles.clearBtn} onClick={() => setQuery('')}><X size={16} /></button>}
                    <div className={styles.isbnTag}><Hash size={14} /> ISBN</div>
                </div>

                {/* ISBN Auto-detect */}
                <AnimatePresence>
                    {isbnDetected && (
                        <motion.div className={styles.isbnDetected}
                            initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }} exit={{ opacity: 0, height: 0, marginTop: 0 }}>
                            <Sparkles size={16} />
                            <span>Livre détecté : <strong>{isbnDetected}</strong></span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ====== TOOLBAR ====== */}
            <div className={styles.toolbar}>
                <div className={styles.toolLeft}>
                    <button className={styles.filterToggle} onClick={() => { setSidebarOpen(!sidebarOpen); }}>
                        <SlidersHorizontal size={16} /> Filtres
                        {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
                    </button>
                    <span className={styles.resultCount}>
                        {isLoading ? 'Chargement...' : `${results.length} résultat${results.length !== 1 ? 's' : ''} trouvé${results.length !== 1 ? 's' : ''}`}
                    </span>
                </div>
                <div className={styles.toolRight}>
                    {/* Sort */}
                    <div className={styles.sortWrap}>
                        <button className={styles.sortBtn} onClick={() => setShowSortMenu(!showSortMenu)}>
                            Trier : {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                            {showSortMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <AnimatePresence>
                            {showSortMenu && (
                                <motion.div className={styles.sortMenu}
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                                    {SORT_OPTIONS.map(s => (
                                        <button key={s.value}
                                            className={`${styles.sortOption} ${sortBy === s.value ? styles.sortActive : ''}`}
                                            onClick={() => { setSortBy(s.value); setShowSortMenu(false); }}>
                                            {s.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* View toggle */}
                    <div className={styles.viewToggle}>
                        <button className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
                            onClick={() => setViewMode('grid')} title="Vue grille"><LayoutGrid size={16} /></button>
                        <button className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                            onClick={() => setViewMode('list')} title="Vue liste"><List size={16} /></button>
                        <button className={`${styles.viewBtn} ${viewMode === 'map' ? styles.viewActive : ''}`}
                            onClick={() => setViewMode('map')} title="Vue carte géolocalisée"><Map size={16} /></button>
                    </div>
                </div>
            </div>

            {/* ====== TWO-COLUMN BODY ====== */}
            <div className={`${styles.body} ${!sidebarOpen ? styles.bodyFull : ''}`}>

                {/* Desktop sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.aside className={styles.sidebar}
                            initial={{ opacity: 0, width: 0, marginRight: 0 }}
                            animate={{ opacity: 1, width: 280, marginRight: '1.5rem' }}
                            exit={{ opacity: 0, width: 0, marginRight: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
                            {sidebarContent}
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Results */}
                <div className={styles.results}>
                    {isLoading ? (
                        <div className={viewMode === 'grid' ? styles.gridView : styles.listView}>
                            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : results.length === 0 ? (
                        /* ====== EMPTY STATE VIBRANT ====== */
                        <motion.div className={styles.emptyState}
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className={styles.emptyIcon}><AlertCircle size={48} /></div>
                            <h3>Ce livre n'est pas encore là…</h3>
                            <p>Aucun résultat ne correspond à vos critères. Soyez le premier à le demander ou ajustez vos filtres !</p>
                            <div className={styles.emptyActions}>
                                <button className={styles.emptyPrimary} onClick={resetFilters}>
                                    <RotateCcw size={16} /> Réinitialiser les filtres
                                </button>
                                <button className={styles.emptySecondary}>
                                    <Heart size={16} /> Créer une alerte
                                </button>
                            </div>
                        </motion.div>
                    ) : viewMode === 'grid' ? (
                        <div className={styles.gridView}>
                            <AnimatePresence mode="popLayout">
                                {results.map((b, i) => (
                                    <ManualCard key={b.id} annonce={b} index={i}
                                        onCardClick={(ann) => navigate(`/student-dashboard/book/${ann.id}`)} />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className={styles.listView}>
                            <AnimatePresence mode="popLayout">
                                {results.map(b => (
                                    <ListItem key={b.id} annonce={b}
                                        onClick={() => navigate(`/student-dashboard/book/${b.id}`)} />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className={styles.mapView}>
                            <MapView results={results} />
                        </div>
                    )}
                </div>
            </div>

            {/* ====== MOBILE FLOATING FILTER BUTTON ====== */}
            <button className={styles.mobileFilterBtn} onClick={() => setMobileSidebar(true)}>
                <SlidersHorizontal size={20} />
                {activeFilterCount > 0 && <span className={styles.mobileFilterBadge}>{activeFilterCount}</span>}
            </button>

            {/* ====== MOBILE SIDEBAR OVERLAY ====== */}
            <AnimatePresence>
                {mobileSidebar && (
                    <>
                        <motion.div className={styles.mobileOverlay}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMobileSidebar(false)} />
                        <motion.aside className={styles.mobileSidebar}
                            initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
                            <div className={styles.mobileClose}>
                                <button onClick={() => setMobileSidebar(false)}><X size={20} /> Fermer</button>
                            </div>
                            {sidebarContent}
                            <button className={styles.mobileApply} onClick={() => setMobileSidebar(false)}>
                                Voir {results.length} résultat{results.length !== 1 ? 's' : ''}
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
