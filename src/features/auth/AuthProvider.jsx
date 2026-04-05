import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authApi } from '../../api/client';
import { getFullImageUrl } from '../../utils/imageHandler';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authApi.getMe();
                    const userData = response.data;
                    const normalizedRole = userData.role === 'ETUDIANT' ? 'STUDENT' : userData.role;
                    const name = userData.nom || userData.prenom || 'Étudiant';
                    
                    setUser({
                        ...userData,
                        id: userData.id,
                        role: normalizedRole,
                        name: name,
                        avatar: getFullImageUrl(userData.avatarUrl) || `https://ui-avatars.com/api/?name=${name}&background=random`
                    });
                } catch (error) {
                    console.error('Verify token error:', error);
                    logout();
                }
            }
            setLoading(false);
        };
        verifyToken();
    }, []);

    const updateAvatar = (newAvatarUrl) => {
        // Enregistre l'URL complète dans le state
        const fullUrl = getFullImageUrl(newAvatarUrl);
        localStorage.setItem('user_avatar', fullUrl);
        setUser(prev => prev ? { ...prev, avatar: fullUrl } : null);
    };

    const updateName = (newName) => {
        localStorage.setItem('user_name', newName);
        setUser(prev => prev ? { ...prev, name: newName } : null);
    };

    const login = async (email, password) => {
        try {
            const response = await authApi.login({ email, password });
            const { token, user: userData } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user_role', userData.role);
            
            const normalizedRole = userData.role === 'ETUDIANT' ? 'STUDENT' : userData.role;
            const name = userData.nom || userData.prenom || 'Étudiant';
            const userObj = {
                ...userData,
                role: normalizedRole,
                name: name,
                avatar: getFullImageUrl(userData.avatarUrl || userData.avatar) || `https://ui-avatars.com/api/?name=${name}&background=random`
            };
            
            setUser(userObj);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (formData) => {
        try {
            const response = await authApi.register(formData);
            const { token, user: userData } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user_role', userData.role);
            
            const normalizedRole = userData.role === 'ETUDIANT' ? 'STUDENT' : userData.role;
            const name = userData.nom || userData.prenom || 'Étudiant';
            const userObj = {
                ...userData,
                role: normalizedRole,
                name: name,
                avatar: getFullImageUrl(userData.avatarUrl) || `https://ui-avatars.com/api/?name=${name}&background=random`
            };
            
            setUser(userObj);
            return true;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateAvatar, updateName, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
