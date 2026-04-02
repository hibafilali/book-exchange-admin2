import { useState, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import styles from './UsersList.module.css';
import Modal from '../../components/ui/Modal';
import AdminForm from './AdminForm';
import { userApi } from '../../api/client';

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filterRole, setFilterRole] = useState('ALL');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchUsers = async () => {
        try {
            const { data } = await userApi.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (id) => {
        const user = users.find(u => u.id === id);
        try {
            await userApi.update(id, { actif: !user.actif });
            setUsers(users.map(u => u.id === id ? { ...u, actif: !u.actif } : u));
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
        setOpenMenu(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await userApi.delete(id);
                setUsers(users.filter(u => u.id !== id));
                if (paginatedUsers.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
            setOpenMenu(null);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setOpenMenu(null);
    };

    const handleCreateAdmin = async (data) => {
        try {
            const response = await userApi.create({ ...data, role: 'ADMIN' });
            setUsers([response.data, ...users]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to create admin:', error);
        }
    };

    const handleUpdateUser = async (data) => {
        try {
            await userApi.update(editingUser.id, data);
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
            setEditingUser(null);
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleFilterChange = (role) => {
        setFilterRole(role);
        setIsFilterOpen(false);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'ALL' || user.role === filterRole;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            user.nom?.toLowerCase().includes(searchLower) ||
            user.prenom?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower);
        return matchesRole && matchesSearch;
    });

    // Calc pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Gestion des Utilisateurs</h1>
                    <p className={styles.subtitle}>Consultez, modifiez et modérez les comptes de la plateforme.</p>
                </div>
                <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                    + Nouvel Administrateur
                </button>
            </header>

            {/* Create Admin Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Créer un nouveau compte Administrateur"
            >
                <AdminForm
                    onSubmit={handleCreateAdmin}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title={`Modifier l'utilisateur: ${editingUser?.prenom} ${editingUser?.nom}`}
            >
                <AdminForm
                    initialData={editingUser}
                    onSubmit={handleUpdateUser}
                    onCancel={() => setEditingUser(null)}
                    isEdit={true}
                />
            </Modal>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <div className={styles.tableHeader}>
                    <h3>Liste des inscrits</h3>
                    <div className={styles.tableActions}>
                        <div className={styles.searchWrapper}>
                            <input 
                                type="text" 
                                placeholder="Rechercher un utilisateur..." 
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div className={styles.filters}>
                            <div className={styles.customSelectWrapper}>
                                <button
                                    className={styles.customSelectTrigger}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <span>
                                        {filterRole === 'ALL' ? 'Tous les rôles' :
                                            filterRole === 'ETUDIANT' ? 'Étudiants' : 'Administrateurs'}
                                    </span>
                                    < MoreVertical size={16} className={isFilterOpen ? styles.rotate : ''} />
                                </button>
                                {isFilterOpen && (
                                    <div className={styles.customSelectDropdown}>
                                        <button onClick={() => handleFilterChange('ALL')} className={filterRole === 'ALL' ? styles.activeOption : ''}>Tous les rôles</button>
                                        <button onClick={() => handleFilterChange('ETUDIANT')} className={filterRole === 'ETUDIANT' ? styles.activeOption : ''}>Étudiants</button>
                                        <button onClick={() => handleFilterChange('ADMIN')} className={filterRole === 'ADMIN' ? styles.activeOption : ''}>Administrateurs</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            <th>Statut</th>
                            <th>Inscription</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.map((user) => (
                            <tr key={user.id}>
                                <td>#{user.id}</td>
                                <td>
                                    <div className={styles.userCell}>
                                        <div className={styles.userAvatar}>
                                            <img src={user.avatar} alt={user.nom} />
                                        </div>
                                        <span className={styles.userName}>{user.prenom} {user.nom}</span>
                                    </div>
                                </td>
                                <td className={styles.emailCol}>{user.email}</td>
                                <td>
                                    <span className={`${styles.roleBadge} ${user.role === 'ADMIN' ? styles.roleAdmin : styles.roleStudent}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${user.actif ? styles.statusActive : styles.statusBlocked}`}>
                                        {user.actif ? 'Actif' : 'Bloqué'}
                                    </span>
                                </td>
                                <td>{user.date}</td>
                                <td className={styles.actionsCol}>
                                    <div className={styles.actionMenuWrapper}>
                                        <button
                                            className={styles.iconBtn}
                                            onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        {openMenu === user.id && (
                                            <div className={styles.dropdownMenu}>
                                                <button className={styles.menuItem} onClick={() => handleEdit(user)}>
                                                    <Edit2 size={14} /> Éditer
                                                </button>
                                                <button className={styles.menuItem} onClick={() => toggleStatus(user.id)}>
                                                    <ShieldAlert size={14} /> {user.actif ? 'Bloquer' : 'Débloquer'}
                                                </button>
                                                <div className={styles.menuDivider}></div>
                                                <button
                                                    className={`${styles.menuItem} ${styles.dangerItem}`}
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 size={14} /> Supprimer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className={styles.pagination}>
                    <div className={styles.pageInfo}>
                        Affichage de <b>{indexOfFirstItem + 1}</b> à <b>{Math.min(indexOfLastItem, filteredUsers.length)}</b> sur <b>{filteredUsers.length}</b> utilisateurs
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
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
