import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Intercepteur pour injecter le token JWT automatiquement
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const bookApi = {
    getAll: (params) => api.get('/annonces', { params }),
    getCatalog: () => api.get('/annonces/catalog'),
    getMy: () => api.get('/annonces/my'),
    getById: (id) => api.get(`/annonces/${id}`),
    getMaxPrice: () => api.get('/annonces/max-price'),
    create: (data) => {
        // If data is FormData, axios handles the Content-Type automatically
        return api.post('/annonces', data);
    },
    updateStatus: (id, status) => api.put(`/annonces/${id}/status`, { status })
};

export const dashboardApi = {
    getStats: (userId = 1) => api.get(`/dashboard/${userId}`)
};

export const userApi = {
    getAll: () => api.get('/users'),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`)
};

export const notificationApi = {
    getByUserId: (userId) => api.get(`/notifications/${userId}`),
    getUnreadCount: (userId) => api.get(`/notifications/${userId}/unread-count`),
    markAllAsRead: (userId) => api.put(`/notifications/${userId}/read-all`),
    markRead: (id) => api.put(`/notifications/${id}/read`)
};

export const plainteApi = {
    create: (data) => api.post('/plaintes', data),
    getByUserId: (userId) => api.get(`/plaintes/user/${userId}`),
    getAll: () => api.get('/plaintes'),
    updateStatus: (id, status) => api.put(`/plaintes/${id}/status`, { status })
};

export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
};

export const conversationApi = {
    getConversations: () => api.get('/conversations'),
    getMessages: (id) => api.get(`/conversations/${id}/messages`),
    sendMessage: (id, data) => api.post(`/conversations/${id}/messages`, data),
    startConversation: (recepteurId) => api.post('/conversations/start', { recepteurId })
};

export const transactionApi = {
    create: (data) => api.post('/transactions', data),
    getPurchases: () => api.get('/transactions/purchases'),
    getSales: () => api.get('/transactions/sales'),
    accept: (id) => api.patch(`/transactions/${id}/accept`),
    schedule: (id, data) => api.patch(`/transactions/${id}/schedule`, data),
    complete: (id) => api.patch(`/transactions/${id}/complete`),
    cancel: (id) => api.patch(`/transactions/${id}/cancel`),
    getAdminTransactions: () => api.get('/transactions/admin')
};

export const exemplaireApi = {
    getMyLibrary: () => api.get('/exemplaires/my'),
    getAvailable: () => api.get('/exemplaires/available'),
    add: (data) => api.post('/exemplaires', data),
    update: (id, data) => api.put(`/exemplaires/${id}`, data),
    delete: (id) => api.delete(`/exemplaires/${id}`)
};

export default api;
