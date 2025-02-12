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
        const figurinaId = req.body;
        const userId = req.user.id; //ID dell'utente autenticato
        
        // controlla se l'utente possiede la figurina
        const user = await User.findById(userId);
        if (!user || !user.figurinePossedute.includes(figurinaId)) {
            return res.status(400).json({ error: "Non possiedi questa figurina!" });
        }

        // crea un nuovo oggetto nel mercato
        const newMarketItem = new Market({ userId, figurinaId });
        await newMarketItem.save();

        res.json({ message: "Figurina aggiunta al mercato con successo!" });

    } catch (error) {
        console.error("Errore nell\'aggiunta al mercato:", error);
        res.status(500).json({ error: "Errore nell\'aggiunta al mercato" });
    }
};

// funzione per rimuovere una figurina dal mercato
export const removeFromMarket = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // cerca la figurina nel mercato
        const marketItem = await Market.findById(id);
        if (!marketItem) {
            return res.status(404).json({ error: "Elemento non trovato nel mercato." });
        }

        // verifica che l'utente sia il proprietario
        if (marketItem.userId.toString() !== userId) {
            return res.status(403).json({ error: "Non puoi rimuovere una figurina di un altro utente." });
        }

        // rimuove l'elemento
        await marketItem.deleteOne();
        res.json({ message: "Figurina rimossa dal mercato con successo!" });

    } catch (error) {
        console.error("Errore nella rimozione dal mercato:", error);
        res.status(500).json({ error: "Errore nella rimozione dal mercato." });
    }
};