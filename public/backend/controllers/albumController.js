import fetch from 'node-fetch';
import { getHash } from '../utils/hashUtils.js';
import User from '../models/User.js';

// funzione per ricavare i dettagli di una figurina da API
async function getFigurineDetails(ids) {
    // genera credenziali Marvel API
    const ts = process.env.MARVEL_TS;
    const publicKey = process.env.MARVEL_PUBLIC;
    const privateKey = process.env.MARVEL_PRIVATE;
    const hash = getHash(ts, publicKey, privateKey);

    const requests = ids.map(id =>
        fetch(`${process.env.MARVEL_URL}/${id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`)
    );
    const responses = await Promise.all(requests);
    const results = await Promise.all(responses.map(res => res.json()));
    return results.map(res => res.data?.results?.[0]).filter(Boolean);
}

// funzione per filtrare le figurine per il nome (se c'è searchQuery)
function filterFigurineBySearchQuery(figurine, searchQuery) {
    if (searchQuery) {
        return figurine.filter(figurina => figurina.name.toLowerCase().includes(searchQuery));;
    }
    return figurine;
}

// funzione per paginare le figurine
// async function displayUserFigurine(page, limit, searchQuery, filteredFigurineIds) {
//     const paginatedFigurine = filteredFigurineIds.slice((page - 1) * limit, page * limit);
//     const FigurineDetails = await getFigurineDetails(paginatedFigurine);
//     const filteredFigurine = filterFigurineBySearchQuery(FigurineDetails, searchQuery);
    
//     return filteredFigurine;
// }

// funzione per ottenere l'album dall'utente
export const getUserAlbum = async (req, res) => {
    try {
        const userId = req.user.id; // estrae ID utente, lo fornisce authMiddleware

        const user = await User.findById(userId);   //recupera l'utente dal database
        if (!user) {
            return res.status(404).json({ error: "Utente non trovato" });
        }

        const ownedFigurineIds = user.figurinePossedute.map(figurine => figurine.idPersonaggio);    // array di ID delle figurine possedute
        if (ownedFigurineIds.length === 0) {
            return res.json({ data: [], page: 1, totalPages: 1 });
        }
        console.log('ownedFigurineIds check', ownedFigurineIds.length);

        // estrae i parametri dalla query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const searchQuery = req.query.name?.toLowerCase() || '';    //nome per la ricerca se presente
        console.log('parametri query string check', page, limit, searchQuery);

        // filtra tutto ownedFigurineIds basandosi su searchQuery
        const filteredFigurineIds = searchQuery
            ? await Promise.all(ownedFigurineIds.map(async id => {
                const figurine = await getFigurineDetails([id]);
                return filterFigurineBySearchQuery(figurine, searchQuery).length > 0 ? id : null;
            }))
            .then(filteredIds => filteredIds.filter(Boolean))
            : ownedFigurineIds;

        // paginare l'array filteredFigurineIds
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedFigurineIds = filteredFigurineIds.slice(startIndex, endIndex);
        
        const FigurineDetails = await getFigurineDetails(paginatedFigurineIds);
        const totalCount = Math.ceil(filteredFigurineIds.length / limit);
        
        console.log('quante figurine:', filteredFigurineIds.length);

        res.json({
            data: FigurineDetails,
            page: page,
            totalPages: totalCount,
            searchQuery: searchQuery,
        });

    } catch (error) {
        console.error("Errore nel recupero dell\'album:", error);
        res.status(500).json({ error: "Errore durante il recupero dell\'album" });
    }
};