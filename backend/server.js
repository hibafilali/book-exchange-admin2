import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import annonceRoutes from './src/routes/annonceRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import plainteRoutes from './src/routes/plainteRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import conversationRoutes from './src/routes/conversationRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import exemplaireRoutes from './src/routes/exemplaireRoutes.js';
import platformReviewRoutes from './src/routes/platformReviewRoutes.js';
import favorisRoutes from './src/routes/favorisRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/annonces', annonceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plaintes', plainteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/exemplaires', exemplaireRoutes);
app.use('/api/platform-reviews', platformReviewRoutes);
app.use('/api/favoris', favorisRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('yTera Backend API is running...');
});

app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR HANDLER:', err);
    import('fs').then(fs => {
        fs.appendFileSync('debug_log.txt', `[${new Date().toISOString()}] GLOBAL ERROR: ${err.message}\n${err.stack}\n`);
    });
    res.status(500).json({ error: 'Erreur serveur interne', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
