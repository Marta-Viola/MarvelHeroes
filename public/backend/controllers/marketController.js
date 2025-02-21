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
import Trade from '../models/Trade.js';
// import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

// ***l'utente parte visualizzando le sue figurine***

export const getUsername = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        const username = user.username;
        res.json({username});
    } catch (error) {
        console.error('non trovo l\'username:', error);
        res.status(500).json({ error: 'non trovo l\'username' });
    }
}

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
        // console.log('(baratto): quantità figurine possedute = ', ownedFigurineIds.length);

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
        // console.log('(baratto): figurineIds = ', figurineIds);
        
        const figurineIdsToInt = figurineIds.map(id => parseInt(id));
        if (!figurineIdsToInt || !Array.isArray(figurineIdsToInt) || figurineIdsToInt.length === 0) {
            return res.status(400).json({ error: 'Nessuna figurina selezionata.' });
        }
        // console.log('(baratto): figurine checkate = ', figurineIdsToInt);

        // aggiunge le figurine al mercato
        // per ogni figurina, crea un oggetto Market (con idUtente, idPersonaggio e data) e lo salva nel mercato
        for (const figurineId of figurineIds) {
            const marketItem = new Market({ idUtente: userId, idPersonaggio: figurineId, data: new Date() });
            await marketItem.save();
        }
        // console.log('(baratto): figurine aggiunte al mercato');

        // sposta le figurine da figurinePossedute a figurineInVendita
        const figurineToMove = user.figurinePossedute.filter(figurine => figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        // console.log('figurineToMove: ', figurineToMove);
        user.figurinePossedute = user.figurinePossedute.filter(figurine => !figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        user.figurineInVendita = [...user.figurineInVendita, ...figurineToMove];
        
        // salva le modifiche all'utente
        await user.save();

        // console.log('figurinePossedute dopo spostamento: ', user.figurinePossedute);
        // console.log('figurineInVendita dopo spostamento: ', user.figurineInVendita);

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
        // console.log('(baratto): quantità figurine dell\'utente in vendita = ', figurineInVenditaIds.length);

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
        // console.log('(baratto): figurineIds = ', figurineIds);
            
        const figurineIdsToInt = figurineIds.map(id => parseInt(id));
        if (!figurineIdsToInt || !Array.isArray(figurineIdsToInt) || figurineIdsToInt.length === 0) {
            return res.status(400).json({ error: 'Nessuna figurina selezionata.' });
        }
        // console.log('(baratto): figurine checkate = ', figurineIdsToInt);

        // rimuove le figurine dal mercato
        for (const figurinaId of figurineIds) {
            await Market.findOneAndDelete({ idUtente: userId, idPersonaggio: figurinaId });
        }
        // console.log('(baratto): figurine rimosse dal mercato');

        // sposta le figurine da figurineInVendita a figurinePossedute
        const figurineToMove = user.figurineInVendita.filter(figurine => figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        // console.log('FigurineToMove: ', figurineToMove);
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

// funzione per ottenere i dati da un oggetto mercato!
export const getMarket1Element = async (req, res) => {
    try {
        // ottiene l'user
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato' });
        // console.log('userId: ', userId);

        // ricava l'elemento market da req
        const marketId = req.body.market1Id;
        // console.log('market1Id = ', marketId);
        const marketElement = await Market.findById(marketId);
        if (!marketElement) return res.status(404).json({ error: 'Elemento market non trovato.' });
        // console.log('marketId = ', marketId, 'marketElement = ', marketElement);

        // ricava le informazioni da mandare al frontend
        const userMarket = await User.findById(marketElement.idUtente);
        if (!userMarket) return res.status(404).json({ error: 'Utente dell\'elemento market non trovato.' });
        // console.log('idUtente del market: ', marketElement.idUtente);
        const username = userMarket.username;

        // qua bisogna fare un controllo! non puoi tradare con te stesso!
        if (userId === marketElement.idUtente.toString()) {
            // alert('non puoi barattare con te stesso!');
            return res.status(400).json({ error: 'Non puoi tradare con te stesso!' });
        }

        // ricava la figurina da marketElement
        const figurinaId = [];
        figurinaId.push(marketElement.idPersonaggio);
        const figurina = await getFigurineDetails(figurinaId);
        const figurinaDetails = figurina[0];
        const imageUrl = figurinaDetails.thumbnail.path + '.' + figurinaDetails.thumbnail.extension;
        const figurinaName = figurinaDetails.name;
        const idFigurina = marketElement.idPersonaggio;

        const response = { username, imageUrl, figurinaName, idFigurina, marketId };
        res.json(response);
    } catch (error) {
        console.error('errore durante il recupero dell\'elemento market1 per il trade:', error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'elemento market1 per il trade' });
    }
}

// Market0 va trovato, il frontend ci restituisce l'id user e l'id figurina, noi troviamo l'elemento market corrispondente
export const getMarket0Element = async (req, res) => {
    try {
        // ottiene l'user
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato' });
        const userObjectId = new ObjectId(userId.toString());
        // console.log('userId = ', userId);

        // ottiene l'id figurina
        const figId = parseInt(req.body.fig0Id);
        // console.log('figId = ', figId);

        // cerca l'elemento market
        const marketElement = await Market.findOne({
            idUtente: userObjectId,
            idPersonaggio: figId
        });
        if (!marketElement) {
            return res.status(404).json({ error: 'non trovo l\'elemento market corrispondente' });
        }

        // prepara la risposta
        const username = user.username;
        const figurinaId = [];
        figurinaId.push(marketElement.idPersonaggio);
        const figurina = await getFigurineDetails(figurinaId);
        const figurinaDetails = figurina[0];
        const imageUrl = figurinaDetails.thumbnail.path + '.' + figurinaDetails.thumbnail.extension;
        const figurinaName = figurinaDetails.name;
        const idFigurina = marketElement.idPersonaggio; 
        const marketId = marketElement._id;

        // noi vogliamo {username, imageUrl, figurinaName, idFigurina, marketId}
        const response = {username, imageUrl, figurinaName, idFigurina, marketId};
        res.json(response);
    } catch (error) {
        console.error('errore durante il recupero dell\'elemento market0 per il trade:', error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'elemento market0 per il trade' });
    }
}

// qua arrivano market0Id e market1Id
export const createTrade = async (req, res) => {
    try {
        // ottiene l'user
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        // ottiene i due marketId
        const market0 = new ObjectId(req.body.market0Id); // è object (createTrade) ??? non va bene
        console.log('(createTrade) market0 type: ', typeof market0, '(createTrade) market0: ', market0);
        const market1 = new ObjectId(req.body.market1Id);
        console.log('(createTrade) market1: ', market1);
        // hanno lo stesso tipo (new ObjectId...)
        if (!market0 || !market1) return res.status(400).json({ error: 'Errore nel recupero dei dati market per il trade.' });

        // chiamate a funzioni che ottengono i dati per creare il trade
        // dati = { marketId, idUser, idFig } per entrambe le parti
        const data0 = await getMarketDetails(market0);
        console.log('(createTrade) data0: ', data0);    // restituisce una pending promise {<pending>}??? da risolvere!
        const data1 = await getMarketDetails(market1);
        console.log('(createTrade) data1: ', data1);

        // controllo!!
        // if (!isPropostaValida(market0)) {
        //     throw new Error('Hai già proposto questa figurina a qualcun\'altro!!!');
        // }
        if (!data0 || !data1) {
            throw new Error('non trovo l\'elemento market corrispondente');
        }

        if (data0.idUser === data1.idUser) {
            throw new Error('Non puoi proporre un trade con te stesso!!!');
        }

        if (data0.idFig === data1.idFig) {
            throw new Error('Non puoi proporre un trade con la stessa figurina!!!');
        }

        const isPropostaValida = await Trade.findOne({
            idUser0: data0.idUser,
            idFig0: data0.idFig,
            status: 'pendente'
        });
        if (isPropostaValida) {
            throw new Error('Hai già proposto questa figurina a qualcun\'altro!!!');
        }
        
        // trova un modo di farlo atomicamente => con la session!!!
        await Trade.startSession();
        const session = await Trade.startSession();
        session.startTransaction();

        try {
             // creazione effettiva del trade 
            // con dati: {market0 (id), market1 (id), idUser0(id), idFig0 (number), idFig1(number), idUser1 (id), dataModifica, status}
            const trade = new Trade({
                market0: market0,
                market1: market1,
                idUser0: data0.idUser,
                idFig0: data0.idFig,
                idFig1: data1.idFig,
                idUser1: data1.idUser,
                dataModifica: new Date(),
                status: 'pendente'
            });
            await trade.save({ session });

            // una volta creato il trade, fig0 VA RIMOSSA DAL MERCATO T-T
            await Market.findByIdAndDelete(market0, { session });

            await session.commitTransaction();

            res.json({ message: 'Trade creato con successo', data: trade._id });
            
        } catch (error) {
            await session.abortTransaction();
            throw error;

        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('errore durante la creazione del trade:', error);
        res.status(500).json({ error: 'Errore durante la creazione del trade' });
    }
}

// deve ritornare idUtente e idPersonaggio
async function getMarketDetails (marketId) {
    // marketId di tipo string!!!
    const marketElement = await Market.findById(marketId);
    if (!marketElement) {
        throw new Error('non trovo l\'elemento mercato.');    
    }
    console.log('(getMarketDetails) marketElement: ', marketElement);

    const idUser = marketElement.idUtente;      // objecId... forse la sto facendo troppo semplice??
    // console.log('(getMarketDetails) idUtente: ', idUser);
    const idFig = marketElement.idPersonaggio;  // numero
    // console.log('(getMarketDetails) idPersonaggio: ', idFig);

    return { idUser, idFig };
}

// funzione per ottenere i dettagli dei trade in uscita dell'utente
async function getTradeDetails (tradeIds) {
    // vogliamo mandare:
    // { username0, fig0img, fig0name, fig1img, fig1name, username1, status }
    const trades = await Trade.find({ _id: { $in: tradeIds } }).exec();

    const tradeDetails = await Promise.all(trades.map(async trade => {
        const user0 = await User.findById(trade.idUser0);
        const username0 = user0.username;
        const user1 = await User.findById(trade.idUser1);
        const username1 = user1.username;

        // const figurinaDetails = figurine.find(fig => fig.id === element.idPersonaggio);
        const figurineDetails = await getFigurineDetails([trade.idFig0, trade.idFig1]);
        const fig0 = figurineDetails.find(fig => fig.id === trade.idFig0);
        const fig1 = figurineDetails.find(fig => fig.id === trade.idFig1);
        const fig0img = fig0.thumbnail.path + '.' + fig0.thumbnail.extension;
        const fig0name = fig0.name;
        const fig1img = fig1.thumbnail.path + '.' + fig1.thumbnail.extension;
        const fig1name = fig1.name;
        
        return {
            username0: username0,
            fig0img: fig0img,
            fig0name: fig0name,
            fig1img: fig1img,
            fig1name: fig1name,
            username1: username1,
            status: trade.status
        };  // sta roba è tradeDetails
    }));

    return tradeDetails;
}

// funzione che invia i dati dei trade al frontend
export const getTradeUscita = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        const trades = await Trade.find({ idUser0: userId });
        console.log('(getTradeUscita) trades: ', trades);
        const tradeDetails = await getTradeDetails(trades);
        console.log('(getTradeUscita) tradeDetails: ', tradeDetails);
        res.json({ tradeDetails });

    } catch (error) {
        console.error('errore durante la ricerca dei trade in uscita:', error);
        res.status(500).json({ error: 'Errore durante la ricerca dei trade in uscita' });
    }
}

// funzione per valutare se un trade sia fattibile
//  => valida se non c'è altro trade con idUser === idUser0 && idFig === idFig0 && status === 'pendente'
// oppure la eliminiamo e facciamo questo controllo in createTrade
// async function isPropostaValida(market0Id) {
//     const marketDetails = getMarketDetails(market0Id);
//     if (!marketDetails) {
//         // throw new Error('non trovo l\'elemento mercato?');
//         return false;
//     }

//     const response = await Trade.findOne({ 
//         idUser0: marketDetails.idUser, 
//         idFig0: marketDetails.idPersonaggio,
//         status: 'pendente'
//     });

//     if (response) {
//         // throw new Error('Hai già promesso questa figurina a qualcun\'altro!!!');
//         return false;
//     } else {
//         return true;
//     }

// }

// TODO:    funzione per creare il trade => prende le info dal frontend
//              frontend deve mandare: {market0, market1} e qui ricaviamo tutto
//              trade vuole: {market0 (id), market1 (id), idUser0(id), idFig0 (number), idFig1(number), idUser1 (id), dataModifica, status}
//          il bottone nel frontend fetcherà una chiamata a funzione che crea il trade => questa fetch deve mandare i due marketId
//              qui si ricava tutto e si crea il trade => funzione che dato marketId ritorna idUser e idFig

//      POI: funzione che invia i dati dei trade in uscita al frontend => fetch e render 