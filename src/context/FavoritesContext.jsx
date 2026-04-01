import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
    const [favoritedIds, setFavoritedIds] = useState(() => {
        const saved = localStorage.getItem('user_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('user_favorites', JSON.stringify(favoritedIds));
    }, [favoritedIds]);

    const toggleFavorite = (id) => {
        setFavoritedIds(prev => 
            prev.includes(id) 
                ? prev.filter(fid => fid !== id) 
                : [...prev, id]
        );
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
