import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authApi } from '../../api/client';

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
                    
                    setUser({
                        ...userData,
                        id: userData.id,
                        role: normalizedRole,
                        name: userData.nom,
                        avatar: userData.avatarUrl || `https://ui-avatars.com/api/?name=${userData.nom}&background=random`
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
        localStorage.setItem('user_avatar', newAvatarUrl);
        setUser(prev => prev ? { ...prev, avatar: newAvatarUrl } : null);
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
            const userObj = {
                ...userData,
                role: normalizedRole,
                name: userData.nom,
                avatar: userData.avatar || `https://ui-avatars.com/api/?name=${userData.nom}&background=random`
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
            const userObj = {
                ...userData,
                role: normalizedRole,
                name: userData.nom,
                avatar: userData.avatarUrl || `https://ui-avatars.com/api/?name=${userData.nom}&background=random`
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
