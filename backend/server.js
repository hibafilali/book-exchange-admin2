import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import annonceRoutes from './src/routes/annonceRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import plainteRoutes from './src/routes/plainteRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/annonces', annonceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plaintes', plainteRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('yTera Backend API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
