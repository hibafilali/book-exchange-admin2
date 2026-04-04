/**
 * Helper function to handle image URLs correctly across the app.
 * Resolves paths to either the frontend public assets or the backend server.
 */
const DEFAULT_BOOK_IMAGE = 'https://via.placeholder.com/150x200?text=Pas+d\'image';
const BACKEND_URL = 'http://localhost:5000';
const BASE_PATH = '/admin'; // Matches vite.config.js base path

export const getFullImageUrl = (url) => {
    if (!url) return DEFAULT_BOOK_IMAGE;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    
    // Si l'URL contient '/admin/books/', c'est une image mockée (legacy)
    if (url.includes('/admin/books/')) {
        // On enlève le préfixe /admin/ si nécessaire pour correspondre au nouveau base path
        return url.replace('/admin/books/', '/books/'); 
    }
    
    // Si l'URL commence par /books/, c'est une image dans le dossier public du frontend
    if (url.startsWith('/books/')) {
        return url; // Plus besoin de BASE_PATH car on est à la racine
    }

    // Pour les autres URLs (commençant par /uploads/...), on utilise le serveur backend
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${path}`;
};
