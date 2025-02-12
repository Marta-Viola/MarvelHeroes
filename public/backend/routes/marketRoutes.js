import express from "express";
import { getMarket, addToMarket, removeFromMarket } from "../controllers/marketController.js";
import authMiddleware from "../middlewares/auth.js";

const router = express.Router();

// rotta per ottenere tutte le figurine in vendita
router.get("/", getMarket);

// rotta per aggiungere una figurina al mercato
router.post("/", authMiddleware, addToMarket);

// rotta per rimuovere una figurina dal mercato
router.delete("/:id", authMiddleware, removeFromMarket);

export default router;