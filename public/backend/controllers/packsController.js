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

        const maxCharacters = 1564; // Numero di perssonaggi nell'API Marvel
        const promises = [];

        for (let i = 0; i < 5; i++) {
            // genera un offset casuale per ogni richiesta
            const randomOffset = Math.floor(Math.random() * maxCharacters);

            // costruisce l'URL con un offset casuale
            const url = `${marvel_url}?ts=${marvel_ts}&apikey=${marvel_public}&hash=${marvel_hash}&limit=1&offset=${randomOffset}`;

            // aggiunge la promessa della fetch alla lista
            promises.push(fetch(url).then(res => res.json()));
        }

        // Esegue tutte le richieste in parallelo
        const results = await Promise.all(promises);

        // estrae i dati utili dai risultati
        const characters = results
            .map(response => response.data.results[0])  // primo risultato di ogni richiesta
            .filter(character => character)             //filtra eventuali null o undefined
            .map(character => ({
                idPersonaggio: character.id,
                nome: character.name,
                immagine: character.thumbnail ? `${character.thumbnail.path}.${character.thumbnail.extension}` : null,
                descrizione: character.description
            }));

        return characters;

        // // Esegue la richiesta all'API Marvel
        // //const response = await fetch(url);
        // console.log("Status della risposta:", response.status); // debug Status

        // if (!response.ok) {
        //     throw new Error(`Errore API: ${response.statusText} - ${response.statusText}`);
        // }

        // const data = await response.json();
        // //console.log("Risultato JSON ricevuto:", JSON.stringify(data, null, 2)); // debug JSON

        // if (!data || !data.data || !data.data.results) {
        //     throw new Error('Risposta API non valida');
        // }

        // // Estrae i personaggi ricevuti
        // const characters = data.data.results.map(character => ({
        //     idPersonaggio: character.id,
        //     nome: character.name
        // }));

        // return characters;
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
            updatedCredits: user.credits,
            cards: newFigurine
        });
    } catch (error) {
        console.error('Errore durante l\'acquisto del pacchetto:', error);
        res.status(500).json({ error: 'Errore durante l\'acquisto del pacchetto' });
    }
}; 