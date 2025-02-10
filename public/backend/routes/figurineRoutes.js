import express from 'express';
import authMiddleware from '../middlewares/auth.js';
import { getFigurine } from '../controllers/figurineController.js';

const router = express.Router();

router.get('/', authMiddleware, getFigurine);

export default router;