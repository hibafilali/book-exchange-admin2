import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { favorisApi } from '../api/client';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const [favoritedIds, setFavoritedIds] = useState(() => {
        const saved = localStorage.getItem('user_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    // Sync from backend on login
    useEffect(() => {
        const fetchFavorites = async () => {
            if (isAuthenticated && user) {
                try {
                    const response = await favorisApi.get();
                    // Merge or replace? Let's replace for now to ensure consistency with DB
                    setFavoritedIds(response.data);
                } catch (error) {
                    console.error('Error fetching favorites:', error);
                }
            }
        };
        fetchFavorites();
    }, [isAuthenticated, user]);

    useEffect(() => {
        localStorage.setItem('user_favorites', JSON.stringify(favoritedIds));
    }, [favoritedIds]);

    const toggleFavorite = async (id) => {
        const isCurrentlyFav = favoritedIds.includes(id);
        
        // Optimistic update
        setFavoritedIds(prev => 
            prev.includes(id) 
                ? prev.filter(fid => fid !== id) 
                : [...prev, id]
        );

        if (isAuthenticated) {
            try {
                if (isCurrentlyFav) {
                    await favorisApi.remove(id);
                } else {
                    await favorisApi.add(id);
                }
            } catch (error) {
                console.error('Error updating favorite in backend:', error);
                // Rollback optimistic update on error? Maybe not for a simple like
            }
        }
    };

    const isFavorited = (id) => favoritedIds.includes(id);

    return (
        <FavoritesContext.Provider value={{ favoritedIds, toggleFavorite, isFavorited }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
