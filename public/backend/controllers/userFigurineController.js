import User from '../models/User.js';

export const getUserFigurine = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("figurinePossedute");
        if (!user) return res.status(404).json({ error: "Utente non trovato" });

        res.json(user.figurinePossedute);   // invia al frontend le figurine possedute

    } catch (error) {
        console.error("Errore nel recupero delle figurine:", error);
        res.status(500).json({ error: "Errore del server" });
    }
};