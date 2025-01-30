import User from '../models/User.js';
import fetch from 'node-fetch';
import authMiddleware from '../middlewares/auth.js';
import { getHash } from '../utils/hashUtils.js';

// funzone per ottenere 5 figurine casuali dalle API marvel
export const getRandomMarvelCharacters = async () => {
    try {
        const marvel_ts = process.env.MARVEL_TS || '1';
        const marvel_private = process.env.MARVEL_PRIVATE;
        const marvel_public = process.env.MARVEL_PUBLIC;
        const marvel_url = process.env.MARVEL_URL || 'https://gateway.marvel.com/v1/public/characters';

        if (!marvel_private || !marvel_public) {
            throw new Error('Chiavi API mancanti');
        }

        // Genera l'hash per l'autenticazione
        const marvel_hash = getHash(marvel_ts, marvel_public, marvel_private);

        // Definisce il numero di personaggi da estrarre
        const limit = 5;

        // Genera un offset casuale per ottenere 5 personaggi casuali
        const maxCharacters = 1564; // Numero di perssonaggi nell'API Marvel
        const randomOffset = Math.floor(Math.random() * (maxCharacters - limit));

        // Costruisce l'URL della richiesta
        const url = `${marvel_url}?ts=${marvel_ts}&apikey=${marvel_public}&hash=${marvel_hash}&limit=${limit}&offset=${randomOffset}`;

        // Esegue la richiesta all'API Marvel
        const response = fetch(url);
        if (!response.ok) {
            throw new Error(`Errore API: ${response.statusText}`);
        }

        const data = await response.json();

        // Estrae i personaggi ricevuti
        const characters = data.data.results.map(character => ({
            idPersonaggio: character.id,
            nome: character.name
        }));

        return characters;
    } catch (error) {
        console.error('Errore durante il recupero delle figurine:', error);
        throw new Error('Errore durante il recupero delle figurine');
    }
};

// Funzione per acquistare un pacchetto di figurine
export const buyPack = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato.' });
        }

        if (user.credits < 1) {
            return res.status(400).json({ error: 'Crediti insufficienti per acquistare un pacchetto.' });
        }

        // Log per debugging
        console.log("Acquisto pacchetto iniziato per l'utente:", user._id);

        // Ottiene 5 figurine casuali
        const newFigurine = await getRandomMarvelCharacters();

        console.log("Figurine generate:", newFigurine);

        // Sottrae 1 credito
        user.credits -= 1;

        // Aggiunge le nuove figurine all'inventario
        user.figurinePossedute = [...user.figurinePossedute, ...newFigurine];
        // Operatore Spread (...) serve per espandere gli elementi di un array
        // o oggetto => crea un nuovo array che contiene tutte le figurine
        // precedenti + le nuove acquistate
        // questo perché MongoDB non aggiorna gli array direttamente, quindi
        // bisogna creare un nuovo array con i vecchi e i nuovi elementi insieme 

        // Salva nel database
        await user.save();

        res.json({
            message: 'Pacchetto acquistato con successo!',
            credits: user.credits,
            newFigurine
        });
    } catch (error) {
        console.error('Errore durante l\'acquisto del pacchetto:', error);
        res.status(500).json({ error: 'Errore durante l\'acquisto del pacchetto' });
    }
}; 