import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.post('/addCredits', authMiddleware, async (requestAnimationFrame, res) => {
    const { creditsToAdd } = req.body;

    if (!creditsToAdd || !Number.isInteger(creditsToAdd) || creditsToAdd <= 0) {
        return res.status(400).json({ error: 'Numero di crediti nnon valido.' });
    }

    try {
        // Trova l'utente loggato
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        //Aggiungi i crediti
        user.credits += creditsToAdd;

        //Salva le modifiche
        await user.save();

        // Invia la risposta
        res.json({ message: 'Crediti aggiunti con successo.', newBalance: user.credits });
    } catch (error) {
        console.error('Errore durante l\'aggiunta dei crediti:', error);
        res.status(500).json({ error: 'Errore durante l\'aggiunta dei crediti.' });
    }
});

export default router;