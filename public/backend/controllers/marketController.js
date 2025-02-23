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
        res.json({ username });
    } catch (error) {
        console.error('non trovo l\'username:', error);
        res.status(500).json({ error: 'non trovo l\'username' });
    }
}

// funzione per ottenere i dettagli di una figurina da API
// VUOLE L'ID DEL PERSONAGGIO NON DELLA FIGURINAAAAAA OKKK????
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
        console.log('(baratto): quantità figurine possedute = ', ownedFigurineIds.length);

        //array di figurine copia di ownedFigurineIds
        // const figurineIds = [...ownedFigurineIds];

        // restituiamo una risposta con le figurine da mostrare
        const figurineDetails = await getFigurineDetails(ownedFigurineIds);
        res.json({ data: figurineDetails });

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
        // per ogni figurina, crea un oggetto Market (con idUtente, idPersonaggio e data, idFigurinaObj) e lo salva nel mercato
        for (const figurineId of figurineIdsToInt) {
            // ricava l'idObject dal database user.figurinePossedute
            const objId = user.figurinePossedute.find(figurine => figurine.idPersonaggio === figurineId);
            console.log('(baratto): objId = ', objId);  // VA! => ora gli elementi market hanno idFigurinaObj!!!
            const marketItem = new Market({
                idUtente: userId,
                idPersonaggio: figurineId,
                data: new Date(),
                idFigurinaObj: objId._id
            });
            await marketItem.save();

            // proviamo a fare qui lo spostamento
            user.figurinePossedute = user.figurinePossedute.filter(figurine => figurine._id !== objId._id);
            // console.log('(user.figurinePossedute) dopo spostamento: ', user.figurinePossedute);
            user.figurineInVendita = [...user.figurineInVendita, objId];
            // console.log('(user.figurineInVendita) dopo spostamento: ', user.figurineInVendita);

            // salva le modifiche all'utente
            await user.save();
        }
        // console.log('(baratto): figurine aggiunte al mercato');

        // tutto sto popo' allora funziona male....
        // sposta le figurine da figurinePossedute a figurineInVendita
        // sposta le figurine il cui id compare in figurinePossedute
        // const figurineToMove = user.figurinePossedute.filter(figurine => figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        // console.log('figurineToMove: ', figurineToMove);
        // user.figurinePossedute = user.figurinePossedute.filter(figurine => !figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        // user.figurineInVendita = [...user.figurineInVendita, ...figurineToMove];

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
        res.json({ data: figurineDetails });

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
        for (const figurinaId of figurineIdsToInt) {
            const objId = user.figurineInVendita.find(figurina => figurina.idPersonaggio === figurinaId);
            console.log('figurina da rimuovere: ', objId._id);
            await Market.findOneAndDelete({ idFigurinaObj: objId });

            // rimuove la figurina dall'array figurineInVendita
            user.figurineInVendita = user.figurineInVendita.filter(figurina => figurina._id !== objId._id);
            user.figurinePossedute = [...user.figurinePossedute, objId];

            // salva le modifiche
            await user.save();
        }

        // // sposta le figurine da figurineInVendita a figurinePossedute
        // const figurineToMove = user.figurineInVendita.filter(figurine => figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        // // console.log('FigurineToMove: ', figurineToMove);
        // user.figurineInVendita = user.figurineInVendita.filter(figurine => !figurineIdsToInt.includes(parseInt(figurine.idPersonaggio)));
        // user.figurinePossedute = [...user.figurinePossedute, ...figurineToMove];


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
        res.status(500).json({ error: 'Errore durante la raccolta dei dati del mercato' });
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
        const response = { username, imageUrl, figurinaName, idFigurina, marketId };
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
                status: 'pendente',
                idFig0Obj: data0.idFigurinaObj,
                idFig1Obj: data1.idFigurinaObj
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
async function getMarketDetails(marketId) {
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
    const idFigurinaObj = marketElement.idFigurinaObj;
    // console.log('(getMarketDetails) idFigurinaObj: ', idFigurinaObj);

    return { idUser, idFig, idFigurinaObj };
}

// funzione per ottenere i dettagli dei trade in uscita dell'utente
async function getTradeDetails(tradeIds) {
    // vogliamo mandare:
    // { username0, fig0img, fig0name, fig1img, fig1name, username1, status }
    // ANCHE TRADEID
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
            tradeId: trade._id,
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

export const getTradeEntrata = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        const trades = await Trade.find({ idUser1: userId });
        // console.log('(getTradeEntrata) trades: ', trades);
        const tradeDetails = await getTradeDetails(trades);
        // console.log('(getTradeEntrata) tradeDetails: ', tradeDetails);
        res.json({ tradeDetails });

    } catch (error) {
        console.error('errore durante la ricerca dei trade in entrata:', error);
        res.status(500).json({ error: 'Errore durante la ricerca dei trade in entrata' });
    }
}

// funzione per rifiutare un trade
export const rejectTrade = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'Utente non trovato.' });

        // deve ricevere dal frontend l'id del trade
        const tradeId = req.body.tradeId;
        console.log('(rejectTrade) tradeId: ', tradeId);    // stringa hex
        const trade = await Trade.findById(tradeId);
        console.log('(rejectTrade) trade: ', trade);        // oggetto trade
        if (!trade) return res.status(404).json({ error: 'Trade non trovato.' });

        const user0 = await User.findById(trade.idUser0.toString());

        // operazioni da fare in modo atomico:
        const sessionReject = await mongoose.startSession();
        try {
            await sessionReject.withTransaction(async () => {
                if (trade.idUser1.toString() === userId.toString()) {
                    const figToMove = user0.figurineInVendita.id(trade.idFig0Obj);
                    console.log('(rejectTrade) figToMove: ', figToMove);

                    // io sono user1 e ho rifiutato il trade
                    // fig0 torna tra i posseduti di user0
                    // fig0 non è più in vendita per user0

                    // aggiungi a figurinePossedute;    
                    user0.figurinePossedute.push(figToMove);

                    // togli da figurineInVendita
                    const index = user0.figurineInVendita.findIndex(figurina => figurina._id === figToMove._id);
                    console.log('(rejectTrade) index: ', index);
                    if (index !== -1) {
                        user0.figurineInVendita.splice(index, 1);
                    } else {
                        throw new Error('figurina non trovata in figurineInVendita');
                    }

                    user0.markModified('figurineInVendita');
                    user0.markModified('figurinePossedute');

                    await user0.save();

                    // cambiare lo stato in 'rifiutato'
                    trade.status = 'rifiutato';
                    await trade.save();

                } else {
                    throw new Error('non sta a te rifiutare questo trade...');
                }
            });

        } catch (error) {
            throw error;

        } finally {
            await sessionReject.endSession();
        }

        res.json({ message: 'Trade rifiutato con successo.' });
    } catch (error) {
        console.error('errore durante il rifiuto del trade:', error);
        res.status(500).json({ error: 'Errore durante il rifiuto del trade' });
    }
}

// funzione per accettare un trade => esegue lo scambio
// user0 da fig0 da user0.figurineInVendita a user1.figurinePossedute
//      aggiungi a user1.figurinePossedute e rimuovi da user0.figurineInVendita
// user1 da fig1 da user1.figurineInVendita a user0.figurinePossedute
//      aggiungi a user0.figurinePossedute e rimuovi da user1.figurineInVendita
// stato 'accettato'
export const acceptTrade = async (req, res) => {
    try {
        const userId = req.user.id;
        const user1 = await User.findById(userId);
        if (!user1) return res.status(404).json({ error: 'Utente non trovato.' });

        // riceve tradeId dal frontend
        const tradeId = req.body.tradeId;
        console.log('(acceptTrade) tradeId: ', tradeId);
        const trade = await Trade.findById(tradeId);
        console.log('(acceptTrade) trade: ', trade);
        if (!trade) return res.status(404).json({ error: 'Trade non trovato.' });

        const user0 = await User.findById(trade.idUser0.toString());

        const sessionAccept = await mongoose.startSession();
        try {
            await sessionAccept.withTransaction(async () => {
                if (trade.idUser1.toString() === userId.toString()) {
                    // io sono user1 e ho accettato il trade
                    // fig0 va da figurineInVendita di user0 a figurinePossedute di user1
                    const fig0ToMove = user0.figurineInVendita.id(trade.idFig0Obj);
                    console.log('(acceptTrade) fig0ToMove: ', fig0ToMove);

                    // aggiungi a figurinePossedute di user1
                    user1.figurinePossedute.push(fig0ToMove);

                    // rimuovi da figurineInVendita di user0
                    const index0 = user0.figurineInVendita.findIndex(figurina => figurina._id === fig0ToMove._id);
                    console.log('(acceptTrade) index0: ', index0);
                    if (index0 !== -1) {
                        user0.figurineInVendita.splice(index0, 1);
                    } else {
                        throw new Error('figurina non trovata in figurineInVendita di user0');
                    }

                    user1.markModified('figurinePossedute');
                    user0.markModified('figurineInVendita');

                    // user0 riceve fig1 da figurineInVendita di user1
                    const fig1ToMove = user1.figurineInVendita.id(trade.idFig1Obj);
                    console.log('(acceptTrade) fig1ToMove: ', fig1ToMove);

                    // aggiungi a figurinePossedute di user0
                    user0.figurinePossedute.push(fig1ToMove);

                    // rimuovi da figurineInVendita di user1
                    const index1 = user1.figurineInVendita.findIndex(figurina => figurina._id === fig1ToMove._id);
                    console.log('(acceptTrade) index1: ', index1);
                    if (index1 !== -1) {
                        user1.figurineInVendita.splice(index1, 1);
                    } else {
                        throw new Error('figurina non trovata in figurineInVendita di user1');
                    }

                    user0.markModified('figurinePossedute');
                    user1.markModified('figurineInVendita');

                    await user0.save({ session });
                    await user1.save({ session });

                    // cambiare lo stato in 'accettato'
                    trade.status = 'accettato';
                    await trade.save({ session });

                    // // mandare una risposta al frontend (i dettagli delle figurine e dell'utente coinvolti)
                    // const response = {
                    //     fig0: fig0ToMove,
                    //     fig1: fig1ToMove,
                    //     tradeId: tradeId
                    // };
                    // res.json({ response });

                    // l'effettivo scambio avviene correttamente
                    // MA LE FIG COINVOLTE RIMANGONO SUL MERCATOOOOOOOOOOOOOOOOOOO
                    // fig0 va a user1 e fig1 va a user0
                    // fig0 non è già sul mercato
                    // VA TOLTA FIG1 DAL MERCATO
                    const deletedMarket1 = await Market.findByIdAndDelete(trade.market1, { session }); // SI MA NON LO CANCELLA
                    if (!deletedMarket1) {
                        console.error('non ho cancellato l\'elemento market1: ', trade.market1, ' ', deletedMarket1);
                    }
                }                   // 67bb65970dd6b93014a835ac
            });

        } catch (error) {
            throw error;

        } finally {
            await sessionAccept.endSession();

        }
        // manda una risposta al frontend con getTradeDetails

        const [tradeDetails] = await getTradeDetails(trade);
        console.log('(acceptTrade): response = ', tradeDetails);
        res.json({ tradeDetails });

        console.log('trade accettato: ', trade);

        // non rimuove dal mercato fig1
    } catch (error) {
        console.error('errore durante l\'accettazione del trade:', error);
        res.status(500).json({ error: 'Errore durante l\'accettazione del trade' });
    }
}

// TODO:    funzione per accettare un trade
//          funzione per rifiutare un trade
//              devono: trovare il trade e gli utenti coinvolti
//                      se si rifiuta:  rimettere la fig0 in figurinePossedute di user0
//                                      cambiare lo stato in 'rifiutato'
//                                      mandare una risposta al frontend (ok)
//                      se si accetta:  effettuare lo scambio (atomicamente) =>
//                                          rimuovere la fig0 da figurineInVendita di user0
//                                          aggiungere la fig0 a figurinePossedute di user1
//                                          rimuovere la fig1 da figurineInVendita di user1 eliminando l'elemento market relativo
//                                          aggiungere la fig1 a figurinePossedute di user0
//                                          cambiare lo stato in 'accettato'
//                                          mandare una risposta al frontend (i dettagli delle figurine e dell'utente coinvolti)

// VADO A MODIFICARE LA STRUTTURA DI TRADE, SI SALVI CHI PUò
// voglio aggiungere gli objectId presi dalle figurineInVendita al tradeSchema...