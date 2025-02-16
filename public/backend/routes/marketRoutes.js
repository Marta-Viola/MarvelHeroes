import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import { getUserFigurine, getUserFigurineInVendita, addToMarket } from '../controllers/marketController.js';

const router = express.Router();

// per mostrare le figurine possedute dall'utente
router.get('/figurine', authMiddleware, getUserFigurine);

// per mostrare le figurine in vendita dall'utente
router.get('/figurineInVendita', authMiddleware, getUserFigurineInVendita);

// per aggiungere le figurine al mercato
router.post('/addToMarket', authMiddleware, addToMarket);

export default router;