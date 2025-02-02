import fetch from 'node-fetch';
import { getHash } from '../utils/hashUtils.js';

export const getFigurine = async (req, res) => {
    try {
        // estrae i parametri dalla query string con valori predefiniti
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const name = req.query.name || '';

        // calcola l'offset corretto per la paginazione
        const offset = (page - 1) * limit;

        // recupera le chiavi API Marvel
        const marvel_ts = process.env.MARVEL_TS || '1';
        const marvel_private = process.env.MARVEL_PRIVATE;
        const marvel_public = process.env.MARVEL_PUBLIC;
        const marvel_url = process.env.MARVEL_URL || 'http://gateway.marvel.com/v1/public/characters';

        if (!marvel_private || !marvel_public) {
            return res.status(500).json({ error: 'Chiavi API mancanti' });
        }

        // genera l'hash per la richiesta
        const marvel_hash = getHash(marvel_ts, marvel_public, marvel_private);

        // costruisce l'URL dell'API con i parametri di paginazione e ricerca
        let url = `${marvel_url}?ts=${marvel_ts}&apikey=${marvel_public}&hash=${marvel_hash}&limit=${limit}&offset=${offset}`;
        if (name) {
            url += `&nameStartsWith=${encodeURIComponent(name)}`;
        }

        // effettua la richiesta all'API Marvel
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Errore API: ${response.statusText}`);
        }

        const data = await response.json();

        // invia i dati della risposta
        res.json({
            results: data.data.results,
            totalResults: data.data.total,
            page: page,
            totalPages: Math.ceil(data.data.total / limit),
            limit: limit
        });

    } catch (error) {
        console.error('Errore durante il recupero delle figurine:', error);
        res.status(500).json({ error: 'Errore durante il recupero delle figurine' });
    }
};