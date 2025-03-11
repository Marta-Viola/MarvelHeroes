import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import { getProfile, updateProfile, deleteProfile } from '../controllers/profileController.js';

const router = express.Router();

// Rotta per ottenere il profilo utente
router.get('/profile', authMiddleware, getProfile);

// Rotta per aggiornare il profilo utente
router.put('/profile', authMiddleware, updateProfile);

// rotta per cancellare il profilo utente
router.delete('/profile', authMiddleware, deleteProfile);

export default router;