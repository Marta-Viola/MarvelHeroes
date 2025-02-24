import fetch from 'node-fetch';
import { getHash } from '../utils/hashUtils.js';
import User from '../models/User.js';
import Market from '../models/Market.js';
import Trade from '../models/Trade.js';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

// ***l'utente inizia visualizzando le sue figurine***

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

    // estrae id personaggio immagine e nome
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

        // restituisce una risposta con le figurine da mostrare
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

        const figurineIdsToInt = figurineIds.map(id => parseInt(id));
        if (!figurineIdsToInt || !Array.isArray(figurineIdsToInt) || figurineIdsToInt.length === 0) {
            return res.status(400).json({ error: 'Nessuna figurina selezionata.' });
        }

        // aggiunge le figurine al mercato
        // per ogni figurina, crea un oggetto Market (con idUtente, idPersonaggio e data, idFigurinaObj) e lo salva nel mercato
        for (const figurineId of figurineIdsToInt) {
            // ricava l'idObject dal database user.figurinePossedute
            const objId = user.figurinePossedute.find(figurine => figurine.idPersonaggio === figurineId);
            console.log('(baratto): objId = ', objId);
            const marketItem = new Market({
                idUtente: userId,
                idPersonaggio: figurineId,
                data: new Date(),
                idFigurinaObj: objId._id
            });
            await marketItem.save();

            user.figurinePossedute = user.figurinePossedute.filter(figurine => figurine._id !== objId._id);
            user.figurineInVendita = [...user.figurineInVendita, objId];

            // salva le modifiche all'utente
            await user.save();
        }

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

        //array di figurine copia di figurineInVenditaIds
        const figurineIds = [...figurineInVenditaIds];

        // restituisce una risposta con le figurine da mostrare
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

        const figurineIdsToInt = figurineIds.map(id => parseInt(id));
        if (!figurineIdsToInt || !Array.isArray(figurineIdsToInt) || figurineIdsToInt.length === 0) {
            return res.status(400).json({ error: 'Nessuna figurina selezionata.' });
        }

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
        const marketElementsWithDetails = marketElements.map(async (element) => {
            // ricava l'user dell'elemento corrente
            const userMarket = await User.findById(element.idUtente);
            const username = userMarket.username;

            // ricava le informazioni della figurina dall'array figurine
            const figurinaDetails = figurine.find(fig => fig.id === element.idPersonaggio);
            const imageUrl = figurinaDetails.thumbnail.path + '.' + figurinaDetails.thumbnail.extension;
            const figurinaName = figurinaDetails.name;
            const idFigurina = element.idPersonaggio;

            // passa l'id dell'elemento sul mercato
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

        // ricava l'elemento market da req
        const marketId = req.body.market1Id;
        const marketElement = await Market.findById(marketId);
        if (!marketElement) return res.status(404).json({ error: 'Elemento market non trovato.' });

        // ricava le informazioni da mandare al frontend
        const userMarket = await User.findById(marketElement.idUtente);
        if (!userMarket) return res.status(404).json({ error: 'Utente dell\'elemento market non trovato.' });
        const username = userMarket.username;

        // controllo => non puoi tradare con te stesso
        if (userId === marketElement.idUtente.toString()) {
            alert('non puoi barattare con te stesso!');
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

        // ottiene l'id figurina
        const figId = parseInt(req.body.fig0Id);

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
        const market0 = new ObjectId(req.body.market0Id);
        const market1 = new ObjectId(req.body.market1Id);
        if (!market0 || !market1) 
            return res.status(400).json({ error: 'Errore nel recupero dei dati market per il trade.' });

        // chiamate a funzioni che ottengono i dati per creare il trade
        // dati = { marketId, idUser, idFig } per entrambe le parti
        const data0 = await getMarketDetails(market0);
        console.log('(createTrade) data0: ', data0);
        const data1 = await getMarketDetails(market1);
        console.log('(createTrade) data1: ', data1);

        // controlli
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
            idFig0Obj: data0.idFigurinaObj,
            status: 'pendente'
        });
        if (isPropostaValida) {
            throw new Error('Hai già proposto questa figurina a qualcun\'altro!!!');
        }

        // operazione di creazione del trade eseguita in modo atomico
        await Trade.startSession();
        const session = await Trade.startSession();
        session.startTransaction();

        try {
            // creazione effettiva del trade 
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

            // una volta creato il trade, fig0 va rimossa dal mercato
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

// funzione che ritorna i dettagli utili dell'elemento mercato
async function getMarketDetails(marketId) {
    const marketElement = await Market.findById(marketId);
    if (!marketElement) {
        throw new Error('non trovo l\'elemento mercato.');
    }

    const idUser = marketElement.idUtente;
    const idFig = marketElement.idPersonaggio;
    const idFigurinaObj = marketElement.idFigurinaObj;

    return { idUser, idFig, idFigurinaObj };
}

// funzione per ottenere i dettagli dei trade in uscita dell'utente
async function getTradeDetails(tradeIds) {
    const trades = await Trade.find({ _id: { $in: tradeIds } }).exec();

    const tradeDetails = await Promise.all(trades.map(async trade => {
        const user0 = await User.findById(trade.idUser0);
        const username0 = user0.username;
        const user1 = await User.findById(trade.idUser1);
        const username1 = user1.username;

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
        };
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
        const tradeDetails = await getTradeDetails(trades);
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
        const tradeDetails = await getTradeDetails(trades);
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

        // riceve dal frontend l'id del trade
        const tradeId = req.body.tradeId;
        const trade = await Trade.findById(tradeId);
        if (!trade) return res.status(404).json({ error: 'Trade non trovato.' });

        const user0 = await User.findById(trade.idUser0.toString());

        // operazioni da fare in modo atomico:
        const sessionReject = await mongoose.startSession();
        try {
            await sessionReject.withTransaction(async () => {
                if (trade.idUser1.toString() === userId.toString()) {
                    const figToMove = user0.figurineInVendita.id(trade.idFig0Obj);
                    console.log('(rejectTrade) figToMove: ', figToMove);

                    // user1 ha rifiutato il trade
                    // fig0 torna tra i posseduti di user0
                    // fig0 non è più in vendita per user0

                    // aggiunge a figurinePossedute;    
                    user0.figurinePossedute.push(figToMove);

                    // toglie da figurineInVendita
                    const index = user0.figurineInVendita.findIndex(figurina => figurina._id === figToMove._id);
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
                    throw new Error('errore durante il rifiuto del trade.');
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
export const acceptTrade = async (req, res) => {
    try {
        const userId = req.user.id;
        const user1 = await User.findById(userId);
        if (!user1) return res.status(404).json({ error: 'Utente non trovato.' });

        // riceve tradeId dal frontend
        const tradeId = req.body.tradeId;
        const trade = await Trade.findById(tradeId);
        if (!trade) return res.status(404).json({ error: 'Trade non trovato.' });

        const user0 = await User.findById(trade.idUser0.toString());

        const sessionAccept = await mongoose.startSession();
        try {
            await sessionAccept.withTransaction(async () => {
                if (trade.idUser1.toString() === userId.toString()) {
                    //user1 ha accettato il trade
                    // fig0 va da figurineInVendita di user0 a figurinePossedute di user1
                    const fig0ToMove = user0.figurineInVendita.id(trade.idFig0Obj);

                    // aggiunge a figurinePossedute di user1
                    user1.figurinePossedute.push(fig0ToMove);

                    // rimuove da figurineInVendita di user0
                    const index0 = user0.figurineInVendita.findIndex(figurina => figurina._id === fig0ToMove._id);
                    if (index0 !== -1) {
                        user0.figurineInVendita.splice(index0, 1);
                    } else {
                        throw new Error('figurina non trovata in figurineInVendita di user0');
                    }

                    user1.markModified('figurinePossedute');
                    user0.markModified('figurineInVendita');

                    // user0 riceve fig1 da figurineInVendita di user1
                    const fig1ToMove = user1.figurineInVendita.id(trade.idFig1Obj);

                    // aggiungi a figurinePossedute di user0
                    user0.figurinePossedute.push(fig1ToMove);

                    // rimuovi da figurineInVendita di user1
                    const index1 = user1.figurineInVendita.findIndex(figurina => figurina._id === fig1ToMove._id);
                    if (index1 !== -1) {
                        user1.figurineInVendita.splice(index1, 1);
                    } else {
                        throw new Error('figurina non trovata in figurineInVendita di user1');
                    }

                    user0.markModified('figurinePossedute');
                    user1.markModified('figurineInVendita');

                    await user0.save({ sessionAccept });
                    await user1.save({ sessionAccept });

                    // cambiare lo stato in 'accettato'
                    trade.status = 'accettato';
                    await trade.save({ sessionAccept });

                    const deletedMarket1 = await Market.findByIdAndDelete(trade.market1, { sessionAccept }); // SI MA NON LO CANCELLA
                    if (!deletedMarket1) {
                        console.error('non ho cancellato l\'elemento market1: ', trade.market1, ' ', deletedMarket1);
                    }

                }
            });

        } catch (error) {
            throw error;

        } finally {
            await sessionAccept.endSession();

        }

        // manda una risposta al frontend con getTradeDetails
        const [tradeDetails] = await getTradeDetails(trade);
        res.json({ tradeDetails });

    } catch (error) {
        console.error('errore durante l\'accettazione del trade:', error);
        res.status(500).json({ error: 'Errore durante l\'accettazione del trade' });
    }
}