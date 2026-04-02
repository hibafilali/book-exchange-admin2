/**
 * Helper function to handle image URLs correctly across the app.
 * Resolves paths to either the frontend public assets or the backend server.
 */
const DEFAULT_BOOK_IMAGE = 'https://via.placeholder.com/150x200?text=Pas+d\'image';
const BACKEND_URL = 'http://localhost:5000';
const BASE_PATH = '/admin'; // Matches vite.config.js base path

export const getFullImageUrl = (url) => {
    if (!url) return DEFAULT_BOOK_IMAGE;
    if (url.startsWith('http')) return url;
    
    // Si l'URL contient '/admin/books/', c'est une image mockée (legacy)
    if (url.includes('/admin/books/')) {
        // Déjà préfixé par /admin, on s'assure juste du bon format
        return url; 
    }
    
    // Si l'URL commence par /books/, c'est une image dans le dossier public du frontend
    // On doit ajouter le préfixe BASE_PATH si le projet est configuré avec base: '/admin/'
    if (url.startsWith('/books/')) {
        return `${BASE_PATH}${url}`;
    }

    // Pour les autres URLs (commençant par /uploads/...), on utilise le serveur backend
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${path}`;
};
