import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accès refusé. Aucun token fourni.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_ytera');
        req.user = decoded; // { id, role }
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};

export default authMiddleware;
