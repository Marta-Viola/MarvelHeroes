import express from 'express';
import { getUserFigurine } from '../controllers/userFigurineController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

router.get("/figurine", authMiddleware, getUserFigurine);

export default router;