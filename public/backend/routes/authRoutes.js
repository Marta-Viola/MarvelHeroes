import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

//Registrazione
router.post('/signup', async (req, res) => {
    console.log('ricevuta richesta POST to /signup');
    try {
        const { username, password, email, hero} = req.body;
        console.log('User Data: ', req.body);

        //controlla se l'utente esiste già
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists');
            return res.status(400).json({ error: 'Username già utilizzato' });
        }

        //cripta la password
        const hashedPassword = await bcrypt.hash(password, 10);
        //console.log('Hashed Password: ', hashedPassword);
        
        //crea un nuovo utente
        const newUser = new User({ 
            username, 
            password: hashedPassword, 
            email, 
            hero
        });

        //salva l'utente nel database
        await newUser.save();
        console.log('User saved succesfully');

        //reindirizza alla pagina di login
        res.status(201).json({ message: 'Utente creato con successo', redirect: '/login' });
    } catch(err) {
        console.error('Errore nella registrazione', err);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

//Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ message: 'Login effettuato con successo', token });
    } catch (err) {
        console.error('Errore durante il login:', err);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

export default router;