import User from "../models/User.js";
import fetch from "node-fetch";
import { getHash } from "../utils/hashUtils.js";

// ottiene le figurine possedute dall'utente con paginazione e ricerca
export async function getUserAlbum(req, res) {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 12, name} = req.query;
        const offset = (page - 1) * limit;

        // recupera l'utente dal database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // ottiene l'array di ID delle figurine possedute
        const ownedFigurineIds = user.figurinePossedute.idPersonaggio;
        console.log('figurine possedute: ', ownedFigurineIds);
        if (!ownedFigurineIds || ownedFigurineIds === 0) {
            console.log('NON HAI FIGURINE');
            return res.json({ data: { results: [], total: 0 }, page, totalPages: 0 });
        } 

        // configurazione API Marvel
        const marvel_ts = process.env.MARVEL_TS || '1';
        const marvel_private = process.env.MARVEL_PRIVATE;
        const marvel_public = process.env.MARVEL_PUBLIC;
        if (!marvel_private || !marvel_public) {
            return res.status(500).json({ error: 'Chiavi API mancanti' });
        }
        const marvel_hash = getHash(marvel_ts, marvel_public, marvel_private);
        const marvel_url = process.env.MARVEL_URL || 'http://gateway.marvel.com/v1/public/characters';

        // filtra solo gli ID richiesti nella pagina corrente
        const figurineDaMostrare = ownedFigurineIds.slice(offset, offset + parseInt(limit));

        // effettua richieste API per ottenere i dettagli delle figurine
        const promises = figurineDaMostrare.map(id =>
            fetch(`${marvel_url}/${id}?ts=${marvel_ts}&apikey=${marvel_public}&hash=${marvel_hash}`)
            .then(response => response.json())
        );

        // attende tutte le risposte
        const responses = await Promise.all(promises);
        const results = responses
            .filter(res => res && res.data && Array.isArray(res.data.results) && res.data.results.length > 0)
            .map(res => res.data.results[0]);   //qui dovremmo essere sicuri che results[0] esista...
        console.log('results: ', results);

        // applica filtro per nome se presente
        const filteredResults = name
            ? results.filter(f => f.name.toLowerCase().includes(name.toLowerCase()))
            : results;
        console.log('filteredResults: ', filteredResults);

        res.json({
            data: {
                figurine: filteredResults,
                total: ownedFigurineIds.length
            },
            page,
            totalPages: Math.ceil(ownedFigurineIds.length / limit)
        });

    } catch (error) {
        console.error('Errore durante il recupero dell\'album:', error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'album' });
    }
}