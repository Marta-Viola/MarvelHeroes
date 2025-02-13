import express from "express";
import { getUserMarketFigurine,getMarket, addToMarket, removeFromMarket } from "../controllers/marketController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// rotta per ottenere tutte le figurine in vendita
router.get("/", getMarket);

// rotta per ottenere le figurine possedute dall'utente in vendita
router.get("/user", authMiddleware, getUserMarketFigurine);

// rotta per aggiungere una figurina al mercato
router.post("/add", authMiddleware, addToMarket);

// rotta per rimuovere una figurina dal mercato
router.post("/remove", authMiddleware, removeFromMarket);

export default router;

// GET /market restituisce tutte le figurine in vendita
// POST /market aggiunge una figurina al mercato
// DELETE /market/:id rimuove una figurina dal mercato