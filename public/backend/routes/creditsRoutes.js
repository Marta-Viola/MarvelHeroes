import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import { buyCredits } from '../controllers/creditsController.js';

const router = express.Router();

// Rotta POST per acquistare crediti
router.post('/credits', authMiddleware, buyCredits);

export default router;