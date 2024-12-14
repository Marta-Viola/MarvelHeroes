import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Rotta per ottenere il profilo utente
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json({
            username: user.username,
            email: user.email,
            hero: user.hero || 'Non specificato',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero del profilo' });
    }
});

// Rotta per aggiornare il profilo utente
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { username, email, hero, oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Verifica vecchia password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Vecchia password non corretta' });
        }

        // Aggiorna i campi
        if (username) user.username = username;
        if (email) user.email = email;
        if (hero) user.hero = hero;

        // Aggiorna la password se fornita
        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        res.json({ message: 'Profilo aggiornato con successo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo' });
    }
});

export default router;
