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
        // const figurineIds = [...ownedFigurineIds];

        // restituiamo una risposta con le figurine da mostrare
        const figurineDetails = await getFigurineDetails(ownedFigurineIds);
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
        console.log('(baratto): figurineIds = ', figurineIds);
        
        const figurineIdsToInt = figurineIds.map(id => parseInt(id));
        if (!figurineIdsToInt || !Array.isArray(figurineIdsToInt) || figurineIdsToInt.length === 0) {
            return res.status(400).json({ error: 'Nessuna figurina selezionata.' });
        }
        console.log('(baratto): figurine checkate = ', figurineIdsToInt);

        // aggiunge le figurine al mercato
        // per ogni figurina, crea un oggetto Market (con idUtente, idPersonaggio e data) e lo salva nel mercato
        for (const figurineId of figurineIds) {
            const marketItem = new Market({ idUtente: userId, idPersonaggio: figurineId, data: new Date() });
            await marketItem.save();
        }
        console.log('(baratto): figurine aggiunte al mercato');

        // sposta le figurine da figurinePossedute a figurineInVendita
        const figurineToMove = user.figurinePossedute.filter(figurine => figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        console.log('figurineToMove: ', figurineToMove);
        user.figurinePossedute = user.figurinePossedute.filter(figurine => !figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        user.figurineInVendita = [...user.figurineInVendita, ...figurineToMove];
        
        // salva le modifiche all'utente
        await user.save();

        console.log('figurinePossedute dopo spostamento: ', user.figurinePossedute);
        console.log('figurineInVendita dopo spostamento: ', user.figurineInVendita);

        // qui dovrebbe aggiungere effettivamente le figurine al mercato (?)

        // restituisce una risposta
        const updatedFigurinePossedute = user.figurinePossedute;
        const updatedFigurineInVendita = user.figurineInVendita;
        res.json({ updatedFigurinePossedute, updatedFigurineInVendita });

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
export const removeFromMarket = async (req, res) => {
    try {
        // ottiene l'user
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        // ottiene le figurine checkate dal frontend
        const { figurineIds } = req.body;
        console.log('(baratto): figurineIds = ', figurineIds);
            
        const figurineIdsToInt = figurineIds.map(id => parseInt(id));
        if (!figurineIdsToInt || !Array.isArray(figurineIdsToInt) || figurineIdsToInt.length === 0) {
            return res.status(400).json({ error: 'Nessuna figurina selezionata.' });
        }
        console.log('(baratto): figurine checkate = ', figurineIdsToInt);

        // rimuove le figurine dal mercato
        for (const figurinaId of figurineIds) {
            await Market.findOneAndDelete({ idUtente: userId, idPersonaggio: figurinaId });
        }
        console.log('(baratto): figurine rimosse dal mercato');

        // sposta le figurine da figurineInVendita a figurinePossedute
        const figurineToMove = user.figurineInVendita.filter(figurine => figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        console.log('FigurineToMove: ', figurineToMove);
        user.figurineInVendita = user.figurineInVendita.filter(figurine => !figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        user.figurinePossedute = [...user.figurinePossedute, ...figurineToMove];

        // salva le modifiche
        await user.save();

        // risponde
        const updatedFigurinePossedute = user.figurinePossedute;
        const updatedFigurineInVendita = user.figurineInVendita;
        res.json({ updatedFigurinePossedute, updatedFigurineInVendita });

    } catch (error) {
        console.error('(baratto): Errore durante la rimozione delle figurine dal mercato:', error);
        res.status(500).json({ error: '(baratto): Errore durante la rimozione delle figurine dal mercato' });
    }
}

// *** l'utente guarda il mercato ***

// funzione per ottenere le figurine sul mercato globale
export const getMarket = async (req, res) => {
    try {
        // ottiene l'user
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        // mette in un array ogni elemento di Market
        const marketElements = await Market.find().sort({ data: -1 });

        // ricava un array (figurineIds) di id personaggi da mandare a getFigurineDetails (figurine)
        const figurineIds = marketElements.map(element => element.idPersonaggio);
        const figurine = await getFigurineDetails(figurineIds); // contiene tutte le info delle figurine sul mercato

        // dovrà rispondere con un array di: nomeUtente, imgFigurina, nomePersonaggio
        // forEach marketElements: findUser, figurine.img, figurine.nome (?)
        const marketElementsWithDetails = marketElements.map(async (element) => {
            // ricava l'user dell'elemento corrente
            const userMarket = await User.findById(element.idUtente);
            // ricava l'username
            const username = userMarket.username;

            // ricava le informazioni della figurina dall'array figurine
            const figurinaDetails = figurine.find(fig => fig.id === element.idPersonaggio);
            const imageUrl = figurinaDetails.thumbnail.path + '.' + figurinaDetails.thumbnail.extension;
            const figurinaName = figurinaDetails.name;
            const idFigurina = element.idPersonaggio;

            // voglio passare anche l'id dell'elemento sul mercato
            const marketId = element._id;

            return { username, imageUrl, figurinaName, idFigurina, marketId };
        });

        const marketResponse = await Promise.all(marketElementsWithDetails);
        res.json(marketResponse);

    } catch (error) {
        console.error('(baratto): Errore durante la raccolta dei dati del mercato:', error);
        res.status(500).json({ error: 'Errore durante la raccolta dei dati del mercato'});
    }
}

// *** l'utente vuole proporre un trade ***
// vede una figurina sul mercato che vuole ottenere => controllo che quell'elemento non l'abbia messo lui a mercato
// seleziona una sua figurina con cui scambiarla => controllo che non l'abbia già promessa a qualcun'altro (tipo bloccata)
// crea il trade, con stato pendente e tutti i dati
// // ottiene i parametri del trade tramite req
// export const createTrade = async (req, res) => {
//     try {
//         // user0, cotnrolla che esista
//         const idUser0 = req.idUser0;
//         const user0 = await User.findById(idUser0);
//         if (!user0) return res.status(404).json({ error: 'User0 non trovato. '});

//         // fig0, controlla che user0 ce l'abbia
//         const idFig0 = req.idFig0;
//         // ...

//         // user1
//         const idUser1 = req.idUser1;
//         const user1 = await User.findById(idUser1);
//         if (!user1) return res.status(404).json({ error: 'User1 non trovato. '});

        

//     }
// }

