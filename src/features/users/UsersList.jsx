import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import styles from './UsersList.module.css';
import Modal from '../../components/ui/Modal';
import AdminForm from './AdminForm';

// Fake Data API
const MOCK_USERS = [
    { id: 1, nom: 'El Amrani', prenom: 'Amine', email: 'a.elamrani@ytera.ma', role: 'ADMIN', actif: true, date: '01/03/2026', avatar: 'https://i.pravatar.cc/150?u=amine' },
    { id: 2, nom: 'Fassi', prenom: 'Fatima Zahra', email: 'f.fassi@u-maroc.ac.ma', role: 'ETUDIANT', actif: true, date: '15/02/2026', avatar: 'https://i.pravatar.cc/150?u=fatima' },
    { id: 3, nom: 'Benjelloun', prenom: 'Youssef', email: 'y.benjelloun@univ.ma', role: 'ETUDIANT', actif: false, date: '28/02/2026', avatar: 'https://i.pravatar.cc/150?u=youssef' },
    { id: 4, nom: 'Bennani', prenom: 'Khadija', email: 'k.bennani@ytera.ma', role: 'ETUDIANT', actif: true, date: '04/03/2026', avatar: 'https://i.pravatar.cc/150?u=khadija' },
    { id: 5, nom: 'Tazi', prenom: 'Mehdi', email: 'm.tazi@ecole.ma', role: 'ETUDIANT', actif: true, date: '02/03/2026', avatar: 'https://i.pravatar.cc/150?u=mehdi' },
    { id: 6, nom: 'Alaoui', prenom: 'Laila', email: 'l.alaoui@ytera.ma', role: 'ADMIN', actif: true, date: '10/01/2026', avatar: 'https://i.pravatar.cc/150?u=laila' },
    { id: 7, nom: 'Mansouri', prenom: 'Hassan', email: 'h.mansouri@univ.ma', role: 'ETUDIANT', actif: true, date: '20/02/2026', avatar: 'https://i.pravatar.cc/150?u=hassan' },
    { id: 8, nom: 'Zouhairi', prenom: 'Sara', email: 's.zouhairi@ytera.ma', role: 'ETUDIANT', actif: true, date: '05/03/2026', avatar: 'https://i.pravatar.cc/150?u=sara' },
    { id: 9, nom: 'Berrada', prenom: 'Omar', email: 'o.berrada@ytera.ma', role: 'ETUDIANT', actif: true, date: '06/03/2026', avatar: 'https://i.pravatar.cc/150?u=omar' },
    { id: 10, nom: 'Cherkaoui', prenom: 'Zineb', email: 'z.cherkaoui@univ.ma', role: 'ETUDIANT', actif: true, date: '07/03/2026', avatar: 'https://i.pravatar.cc/150?u=zineb' },
    { id: 11, nom: 'Filali', prenom: 'Issam', email: 'i.filali@ecole.ma', role: 'ADMIN', actif: true, date: '08/03/2026', avatar: 'https://i.pravatar.cc/150?u=issam' },
    { id: 12, nom: 'Amal', prenom: 'Sofia', email: 's.amal@ytera.ma', role: 'ETUDIANT', actif: false, date: '09/03/2026', avatar: 'https://i.pravatar.cc/150?u=sofia' },
    { id: 13, nom: 'Idrissi', prenom: 'Anas', email: 'a.idrissi@univ.ma', role: 'ETUDIANT', actif: true, date: '10/03/2026', avatar: 'https://i.pravatar.cc/150?u=anas' },
    { id: 14, nom: 'Moussaoui', prenom: 'Kenza', email: 'k.moussaoui@ytera.ma', role: 'ETUDIANT', actif: true, date: '11/03/2026', avatar: 'https://i.pravatar.cc/150?u=kenza' },
    { id: 15, nom: 'Lahlou', prenom: 'Rachid', email: 'r.lahlou@ecole.ma', role: 'ADMIN', actif: true, date: '12/03/2026', avatar: 'https://i.pravatar.cc/150?u=rachid' },
];

export default function UsersList() {
    const [users, setUsers] = useState(MOCK_USERS);
    const [openMenu, setOpenMenu] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filterRole, setFilterRole] = useState('ALL');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const toggleStatus = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, actif: !u.actif } : u));
        setOpenMenu(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            setUsers(users.filter(u => u.id !== id));
            setOpenMenu(null);
            // Adjust page if empty after delete
            if (paginatedUsers.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setOpenMenu(null);
    };

    const handleCreateAdmin = (data) => {
        const newUser = {
            id: users.length + 1,
            ...data,
            role: 'ADMIN',
            actif: true,
            date: new Date().toLocaleDateString('fr-FR')
        };
        setUsers([newUser, ...users]);
        setIsModalOpen(false);
    };

    const handleUpdateUser = (data) => {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
        setEditingUser(null);
    };

    const handleFilterChange = (role) => {
        setFilterRole(role);
        setIsFilterOpen(false);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const filteredUsers = filterRole === 'ALL'
        ? users
        : users.filter(user => user.role === filterRole);

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
                                <MoreVertical size={16} className={isFilterOpen ? styles.rotate : ''} />
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
