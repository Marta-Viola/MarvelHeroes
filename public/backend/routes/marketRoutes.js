import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import { 
    getUsername,
    getUserFigurine, 
    getUserFigurineInVendita, 
    addToMarket, 
    removeFromMarket, 
    getMarket,
    getMarket1Element,
    getMarket0Element,
    createTrade,
    getTradeUscita,
    getTradeEntrata
    } from '../controllers/marketController.js';

const router = express.Router();

// per mostrare l'username
router.get('/username', authMiddleware, getUsername);

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
router.post('/trade/getMarket0Element', authMiddleware, getMarket0Element);
router.post('/trade/getMarket1Element', authMiddleware, getMarket1Element);

router.post('/trade/create', authMiddleware, createTrade);

// per mostrare le proposte di trade
router.get('/trade/getTradeUscita', authMiddleware, getTradeUscita);
router.get('/trade/getTradeEntrata', authMiddleware, getTradeEntrata);

export default router;