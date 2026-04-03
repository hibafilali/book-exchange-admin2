import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_ytera';

class AuthController {
    // Inscription (Register)
    async register(req, res) {
        try {
            const { nom, email, password, role = 'ETUDIANT', filiere, etablissement, ville } = req.body;
            
            if (!email || !password || !nom) {
                return res.status(400).json({ error: 'Champs obligatoires manquants.' });
            }

            // Vérifier si l'utilisateur existe déjà
            const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
            }

            // Hacher le mot de passe
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insérer l'utilisateur
            const [result] = await pool.query(
                'INSERT INTO users (nom, email, password_hash, role, filiere, etablissement, ville, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [nom, email, hashedPassword, role, filiere, etablissement, ville, 'ACTIF']
            );

            // Générer le token JWT
            const token = jwt.sign(
                { id: result.insertId, role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'Utilisateur créé avec succès.',
                token,
                user: { id: result.insertId, nom, email, role }
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Connexion (Login)
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Identifiants requis.' });
            }

            // Chercher l'utilisateur par email
            const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
            }

            const user = users[0];

            // Comparer avec le mdp haché
            let isMatch = false;

            if (user.password_hash) {
                // If it looks like a bcrypt hash
                if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
                    isMatch = await bcrypt.compare(password, user.password_hash);
                } else {
                    isMatch = (password === user.password_hash);
                }
            }
            
            if (!isMatch) {
                // Pour les anciens comptes de test sans password_hash, vérifier password direct
                if (user.password && user.password === password) {
                     isMatch = true;
                } else {
                     return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
                }
            }

            if (user.status === 'BLOQUE') {
                return res.status(403).json({ error: 'Votre compte a été bloqué par l\'administration.' });
            }

            // Générer le token JWT
            const token = jwt.sign(
                { id: user.id, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Connexion réussie.',
                token,
                user: {
                    id: user.id,
                    nom: user.nom,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatarUrl
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Récupérer les infos de l'utilisateur connecté via token
    async getMe(req, res) {
        try {
            const [users] = await pool.query(
                'SELECT id, nom, email, role, filiere, etablissement, ville, nbEchanges, avatarUrl, created_at FROM users WHERE id = ?',
                [req.user.id]
            );
            
            if (users.length === 0) {
                return res.status(404).json({ error: 'Utilisateur non trouvé.' });
            }

            res.json(users[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new AuthController();
