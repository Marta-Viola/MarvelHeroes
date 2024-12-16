import express from 'express';
import fetch from 'node-fetch';
import { getHash } from '../utils/hashUtils.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Rotta per ottenere le figurine con paginazione e ricerca
router.get('/', authMiddleware, async (req, res) => {
    try{
        //Parametri di query per paginazione
        // const page = parseInt(req.query.page) || 1; //Pagina richiesta (default: 1)
        // const limit = parseInt(req.query.limit) || 10;  //Elementi per pagina (default: 10)
        //const name = req.query.name || ''; //Ricerca per nome
        
        const { page = 1, limit = 10, name } = req.query;
        const offset = (page - 1) * limit;  //Calcola l'offset

        //fai una richiesta alle API Marvel
        const marvel_ts = process.env.MARVEL_TS || '1';
        const marvel_private = process.env.MARVEL_PRIVATE;
        const marvel_public = process.env.MARVEL_PUBLIC;
        
        if (!marvel_private || !marvel_public) {
            return res.status(500).json({ error: 'Chiavi API mancanti' });
        }
        
        //genera l'hash
        const marvel_hash = getHash(marvel_ts, marvel_public, marvel_private);
        
        //costruisce l'URL dell'API con limit e offset e filtro per nome
        let url = `${process.env.MARVEL_URL || 'http://gateway.marvel.com/v1/public/characters'}?ts=${marvel_ts}&apikey=${marvel_public}&hash=${marvel_hash}&limit=${limit}&offset=${offset}`;
        if (name) {
            url += `&nameStartsWith=${encodeURIComponent(name)}`;
        }

        //esegue la richiesta dell'API Marvel
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Errore API: ${response.statusText}');
        }

        const data = await response.json();

        //invia i dati al client
        res.json({
            data: {
                results: data.data.results,
                total: data.data.total, //numero totale di personaggi
            },
            page,
            totalPages: Math.ceil(data.data.total / limit), //numero totale di pagine
        });
    } catch (error) {
        console.error('Errore durante il recupero delle figurine:', error);
        res.status(500).json({ error: 'Errore durante il recupero delle figurine' });
    }
});

export default router;

//app.use('/api/user', profileRoutes);    //prefisso per le rotte profilo