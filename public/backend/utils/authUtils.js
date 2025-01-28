import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password) => bcrypt.hash(password, 10);

export const comparePassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

export const generateToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });