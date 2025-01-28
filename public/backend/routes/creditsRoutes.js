import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Rotta POST per acquistare crediti
// Endpoint: /api/user/credits
router.post('/credits', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || !Number.isInteger(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Numero di crediti nnon valido.' });
    }

    // aggiorna i crediti dell'utente nel database
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        //Aggiungi i crediti
        user.credits += amount;

        //Salva le modifiche
        await user.save();

        // Invia la risposta
        res.json({ message: 'Crediti aggiunti con successo.', credits: user.credits });
    } catch (error) {
        console.error('Errore durante l\'aggiunta dei crediti:', error);
        res.status(500).json({ error: 'Errore durante l\'aggiunta dei crediti.' });
    }
});

export default router;