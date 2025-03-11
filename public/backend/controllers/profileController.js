import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Market from '../models/Market.js';
import { comparePassword } from '../utils/authUtils.js';

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
        if (hero) user.hero = hero;

        await user.save();
        res.json({ message: 'Profilo aggiornato con successo' });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del profilo:', error);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo' });
    }
};

// cancella il profilo utente
export const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const confirmPassword = req.body.confirmPassword;

        // trova l'user tramite l'id e controlla che la password sia giusta
        const user = await User.findById(userId);
        const userPassword = user.password;
        if (!user || !comparePassword(confirmPassword, userPassword)) {
            return res.status(401).json({ error: 'password non valida.' });
        }

        // cancella tutti gli elementi a mercato dell'utente
        await Market.deleteMany({ idUtente: userId });

        // cancella il profilo
        await User.findByIdAndDelete(userId);

        // // logout
        // req.logout();

        res.json({ message: 'Profilo cancellato correttamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'cancellazione profilo fallita.' });
    }
};