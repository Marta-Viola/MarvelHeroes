import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import { getUserAlbum } from '../controllers/albumController.js';

const router = express.Router();

// rotta per ottenere le figurine possedute dall'utente
router.get('/', authMiddleware, getUserAlbum);

export default router;