import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Accesso non autorizzato. Token mancante.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token non valido:', error);
        return res.status(401).json({ error: 'Accesso non autorizzato. Token non valido' });
    }
};

export default authMiddleware;
