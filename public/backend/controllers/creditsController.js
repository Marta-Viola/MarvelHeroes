import User from '../models/User.js';

// Aggiunge crediti all'utente loggato
export const buyCredits = async (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body;

    // Controlla se il valore di amount è valido
    if (!amount || !Number.isInteger(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Numero di crediti non valido' });
    }

    try {
        //Trova l'utente nel database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        // Aggiungi i crediti all'utente
        console.log('crediti: ', user.credits);
        user.credits += amount;
        console.log('dopo aggiunta: ', user.credits);
        await user.save();

        // Risponde con il numero aggiornato di crediti
        res.json({ message: 'Crediti aggiunti con successo.', credits: user.credits });
    } catch (error) {
        console.error('Errore durante l\'aggiunta dei crediti:', error);
        res.status(500).json({ error: 'Errore durante l\'aggiunta dei crediti'});
    }
};