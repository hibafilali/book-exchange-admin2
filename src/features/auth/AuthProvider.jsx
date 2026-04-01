import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Validation simulée du token au montage avec petit effet de délai visuel
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('user_role');
            const storedAvatar = localStorage.getItem('user_avatar');
            const storedName = localStorage.getItem('user_name');

            await new Promise(r => setTimeout(r, 1000)); // Simuler la latence réseau

            if (token && role) {
                // Normalize role if it's 'ETUDIANT' to 'STUDENT'
                const normalizedRole = role === 'ETUDIANT' ? 'STUDENT' : role;
                // Hydrate the user
                setUser({
                    role: normalizedRole,
                    name: storedName || (normalizedRole === 'ADMIN' ? 'Admin yTera' : 'Hiba Filali'),
                    avatar: storedAvatar || 'https://i.pravatar.cc/150?u=admin'
                });
            }
            setLoading(false);
        };
        verifyToken();
    }, []);

    const updateAvatar = (newAvatarUrl) => {
        localStorage.setItem('user_avatar', newAvatarUrl);
        setUser(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
    };

    const updateName = (newName) => {
        localStorage.setItem('user_name', newName);
        setUser(prev => prev ? { ...prev, name: newName } : null);
    };

    const login = async (email, password, role) => {
        // Simuler latence de login
        await new Promise(r => setTimeout(r, 1200));

        if (role === 'ADMIN' && email === 'admin@ytera.ma' && password === 'admin') {
            localStorage.setItem('token', 'fake-admin-jwt-token');
            localStorage.setItem('user_role', 'ADMIN');
            const avatar = localStorage.getItem('user_avatar') || 'https://i.pravatar.cc/150?u=admin';
            const name = localStorage.getItem('user_name') || 'Admin yTera';
            setUser({ role: 'ADMIN', name, avatar });
            return true;
        }

        // Mock pour authentifier un étudiant
        if (role === 'STUDENT' && email && password) {
            localStorage.setItem('token', 'fake-student-jwt-token');
            localStorage.setItem('user_role', 'STUDENT');
            const avatar = localStorage.getItem('user_avatar') || 'https://i.pravatar.cc/120?u=hiba';
            const name = localStorage.getItem('user_name') || 'Hiba Filali';
            setUser({ role: 'STUDENT', name, avatar });
            return true;
        }

        return false;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateAvatar, updateName, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
