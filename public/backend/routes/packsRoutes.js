import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import { buyPack } from '../controllers/packsController.js';

const router = express.Router();

// Rotta per acquistare un pacchetto di figurine
router.post('/', authMiddleware, buyPack);

export default router;