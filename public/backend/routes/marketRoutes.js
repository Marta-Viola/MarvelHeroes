import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import { 
    getUserFigurine, 
    getUserFigurineInVendita, 
    addToMarket, 
    removeFromMarket, 
    getMarket,
    getMarket1Element,
    } from '../controllers/marketController.js';

const router = express.Router();

// per mostrare le figurine possedute dall'utente
router.get('/figurine', authMiddleware, getUserFigurine);

// per mostrare le figurine in vendita dall'utente
router.get('/figurineInVendita', authMiddleware, getUserFigurineInVendita);

// per aggiungere le figurine al mercato
router.post('/addToMarket', authMiddleware, addToMarket);

// per rimuovere le figurine dal mercato
router.post('/removeFromMarket', authMiddleware, removeFromMarket);

// per mostrare le figurine sul mercato
router.get('/getMarket', authMiddleware, getMarket);

// *** sezione trade ***
// per creare una proposta di trade
router.post('/trade/getMarket1Element', authMiddleware, getMarket1Element);

// router.post('/trade/create', authMiddleware, createTrade);

export default router;