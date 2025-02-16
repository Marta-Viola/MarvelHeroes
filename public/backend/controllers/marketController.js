// qui la logica backend per le funzioni passive della pagina baratto.html
// sezione 1:
//      - mostrare tutte le figurine messe a mercato
// sezione 2:
//      - mostrare tutte le figurine dell'utente
//      - mostrare le figurine dell'utente a mercato
// sezione 3:
//      - mostrare le proposte in entrata
//      - anteprima scambio se si accetta una proposta
//      - mostrare le proposte in uscita pendenti
//      - creare le proposta in uscita

import fetch from 'node-fetch';
import { getHash } from '../utils/hashUtils.js';
import User from '../models/User.js';
import Market from '../models/Market.js';

// ***l'utente parte visualizzando le sue figurine***

// funzione per ottenere i dettagli di una figurina da API
async function getFigurineDetails(ids) {
    const url = process.env.MARVEL_URL;
    const ts = process.env.MARVEL_TS;
    const public_key = process.env.MARVEL_PUBLIC;
    const private_key = process.env.MARVEL_PRIVATE;
    const hash = getHash(ts, public_key, private_key);

    const requests = ids.map(id =>
        fetch(`${url}/${id}?ts=${ts}&apikey=${public_key}&hash=${hash}`)
    );
    const responses = await Promise.all(requests);

    // estraiamo id personaggio immagine e nome
    const results = await Promise.all(responses.map(res => res.json()));

    //console.log('results: ', results.map(res => res.data.results[0]));
    return results.map(res => res.data.results[0]);
}

// funzione per ottenere le figurine possedute dall'utente
export const getUserFigurine = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        const ownedFigurineIds = user.figurinePossedute.map(figurine => figurine.idPersonaggio);
        if (ownedFigurineIds.length === 0) return res.json({ data: [] });
        console.log('(baratto): quantità figurine possedute = ', ownedFigurineIds.length);

        //array di figurine copia di ownedFigurineIds
        const figurineIds = [...ownedFigurineIds];

        // restituiamo una risposta con le figurine da mostrare
        const figurineDetails = await getFigurineDetails(figurineIds);
        res.json({ data: figurineDetails});

    } catch (error) {
        console.error('(baratto): Errore durante il recupero delle figurine:', error);
        res.status(500).json({ error: '(baratto): Errore durante il recupero delle figurine' });
    }
}

// ***l'utente poi vorrà aggiungere una sua figurina al mercato***

// funzione per aggiungere una figurina al mercato
export const addToMarket = async (req, res) => {
    try {
        // ottiene l'userId
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        // ottiene le figurine checkate dal frontend
        const { figurineIds } = req.body;
        if (!figurineIds || !Array.isArray(figurineIds) || figurineIds.length === 0) {
            return res.status(400).json({ error: 'Nessuna figurina selezionata.' });
        }
        console.log('(baratto): figurine checkate = ', figurineIds.length);

        // aggiunge le figurine al mercato
        // per ogni figurina, crea un oggetto Market (con idUtente, idPersonaggio e data) e lo salva nel mercato
        for (const figurineId of figurineIds) {
            const marketItem = new Market({ idUtente: userId, idPersonaggio: figurineId, data: new Date() });
            await marketItem.save();
        }

        // sposta le figurine da figurinePossedute a figurineInVendita
        user.figurinePossedute = user.figurinePossedute.filter(figurine => !figurineIds.includes(figurine.idPersonaggio));
        console.log('figurinePossedute dopo spostamento: ', user.figurinePossedute);
        user.figurineInVendita = [...user.figurineInVendita, ...figurineIds];
        console.log('figurineInVendita dopo spostamento: ', user.figurineInVendita);

        // salva le modifiche all'utente
        await user.save();

        // chiamate a funzioni per aggiornare le figurinePossedute e le figurineInVendita e il mercato
        await getUserFigurine();
        await getUserFigurineInVendita();
        // await getMarket();

        // restituisce una risposta (Market)
        res.json({ data: user.figurineInVendita });

    } catch (error) {
        console.error('(baratto): Errore durante l\'aggiunta delle figurine al mercato:', error);
        res.status(500).json({ error: '(baratto): Errore durante l\'aggiunta delle figurine al mercato' });
    }
}

// funzione per ottenere le figurine in vendita dall'utente
export const getUserFigurineInVendita = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        const figurineInVenditaIds = user.figurineInVendita.map(figurine => figurine.idPersonaggio);
        if (figurineInVenditaIds.length === 0) return res.json({ data: [] });
        console.log('(baratto): quantità figurine dell\'utente in vendita = ', figurineInVenditaIds.length);

        //array di figurine copia di figurineInVenditaIds
        const figurineIds = [...figurineInVenditaIds];

        // restituiamo una risposta con le figurine da mostrare
        const figurineDetails = await getFigurineDetails(figurineIds);
        res.json({ data: figurineDetails});

    } catch (error) {
        console.error('(baratto): Errore durante il recupero delle figurine in vendita:', error);
        res.status(500).json({ error: '(baratto): Errore durante il recupero delle figurine in vendita' });
    }
}

// funzione per rimuovere una figurina dal mercato
