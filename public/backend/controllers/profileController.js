import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Ottiene il profilo utente
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato.' });
        }
        res.json({
            username: user.username,
            email: user.email,
            hero: user.hero || 'Non specificato',
            credits: user.credits
        });
    } catch (error) {
        console.error('Errore nel recupero del profilo:', error);
        res.status(500).json({ message: 'Errore nel recupero del profilo' });
    }
};

// Aggiorna il profilo utente
export const updateProfile = async (req, res) => {
    try {
        const { username, email, hero, oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Se viene fornita una vecchia password, verificarla prima di cambiarla
        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Vecchia password non corretta' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        // Aggiorna gli altri campi solo se forniti
        if (username) user.username = username;
        //if (email) user.email = email;
        if (hero) user.hero = hero;

        await user.save();
        res.json({ message: 'Profilo aggiornato con successo' });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del profilo:', error);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo' });
    }
};