import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middlewares/auth.js';
import { signnup, login, getUserData } from '../controller/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/user', getUserData);

export default router;