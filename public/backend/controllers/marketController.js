import Market from "../models/Market.js";
import User from "../models/User.js";

// funzione per ottenere tutte le figurine in vendita
export const getMarket = async (req, res) => {
    try {
        const marketItems = await Market.find().populate("userId", "username"); // popola il nome utente
        res.json(marketItems);

    } catch (error) {
        console.error("Errore nel recupero del mercato:", error);
        res.status(500).json({ error: "Errore nel recupero del mercato." });
    }
};

// funzione per mettere una figurina sul mercato
export const addToMarket = async (req, res) => {
    try {
        const { figurine } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: "Utente non trovato" });

        // sposta le figurine nel mercato
        const addedFigurine = figurine.map(figId => ({
            figurina: figId,
            proprietario: user._id
        }));

        await Market.insertMany(addedFigurine);

        // rimuove le figurine dall'inventario dell'utente
        user.figurinePossedute = user.figurinePossedute.filter(id => !figurine.includes(id.toString()));
        await user.save();

        res.json({ message: "Figurine aggiunte al mercato!" });

    } catch (error) {
        console.error("Errore nell\'aggiunta al mercato:", error);
        res.status(500).json({ error: "Errore del server" });
    }
    
    // try {
    //     const figurinaId = req.body;
    //     const userId = req.user.id; //ID dell'utente autenticato
        
    //     // controlla se l'utente possiede la figurina
    //     const user = await User.findById(userId);
    //     if (!user || !user.figurinePossedute.includes(figurinaId)) {
    //         return res.status(400).json({ error: "Non possiedi questa figurina!" });
    //     }

    //     // crea un nuovo oggetto nel mercato
    //     const newMarketItem = new Market({ userId, figurinaId });
    //     await newMarketItem.save();

    //     res.json({ message: "Figurina aggiunta al mercato con successo!" });

    // } catch (error) {
    //     console.error("Errore nell\'aggiunta al mercato:", error);
    //     res.status(500).json({ error: "Errore nell\'aggiunta al mercato" });
    // }
};

export const getUserMarketFigurine = async (req, res) => {
    try {
        const figurine = await Market.find({ proprietario: req.user.id }).populate("figurina");
        res.json(figurine);

    } catch (error) {
        console.error("Errore nel recupero delle figurine sul mercato:", error);
        res.status(500).json({ error: "Errore del server" });
    }
};

// funzione per rimuovere una figurina dal mercato
export const removeFromMarket = async (req, res) => {
    try {
        const { figurine } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ error: "Utente non trovato" });

        // rimuove le figurine dal mercato
        await Market.deleteMany({ figurina: { $in: figurine }, proprietario: user._id });

        // riaggiunge le figurine all'inventario dell'utente
        user.figurinePossedute.push(...figurine);
        await user.save();

        res.json({ message: "Figurine rimosse dal mercato!" });

    } catch (error) {
        console.error("Errore nella rimozione dal mercato:", error);
        res.status(500).json({ error: "Errore del server" });
    }
    
    // try {
    //     const { id } = req.params;
    //     const userId = req.user.id;

    //     // cerca la figurina nel mercato
    //     const marketItem = await Market.findById(id);
    //     if (!marketItem) {
    //         return res.status(404).json({ error: "Elemento non trovato nel mercato." });
    //     }

    //     // verifica che l'utente sia il proprietario
    //     if (marketItem.userId.toString() !== userId) {
    //         return res.status(403).json({ error: "Non puoi rimuovere una figurina di un altro utente." });
    //     }

    //     // rimuove l'elemento
    //     await marketItem.deleteOne();
    //     res.json({ message: "Figurina rimossa dal mercato con successo!" });

    // } catch (error) {
    //     console.error("Errore nella rimozione dal mercato:", error);
    //     res.status(500).json({ error: "Errore nella rimozione dal mercato." });
    // }
};

// getMarket: recupera tutte le figurine in vendita
// addToMarket: permette di aggiungere una figurina al mercato
// removeFromMarket: permette all'utente di rimuovere la propria figurina dal mercato.