import User from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../utils/authUtils.js';

export const signup = async (req, res) => {
    try {
        const { username, password, email, hero} = req.body;
        if (!username || !password || !email || !hero) {
            return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
        }

        //controlla se l'utente esiste già
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists');
            return res.status(400).json({ error: 'Username già utilizzato' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email già utilizzata' });
        }

        //cripta la password
        const hashedPassword = await hashPassword(password);
        
        //crea un nuovo utente
        const newUser = new User({ 
            username, 
            password: hashedPassword, 
            email, 
            hero,
            credits: 0,
            figurinePossedute: [],
            figurineInVendita: []
        });
        //salva l'utente nel database
        await newUser.save();

        //reindirizza alla pagina di login
        res.status(201).json({ message: 'Utente creato con successo', redirect: '/api/login' });
    } catch(err) {
        console.error('Errore nella registrazione', err);
        res.status(500).json({ error: 'Errore interno del server' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email e password sono obbligatori' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        //Genera il token JWT
        const token = generateToken({ id: user._id, email: user.email });
        res.json({ 
            message: 'Login effettuato con successo', 
            redirect: '/api/homepage', 
            token,
            user: { username: user.username, email: user.email, hero: user.hero, credits: user.credits }
         });
    } catch (err) {
        console.error('Errore durante il login:', err);
        res.status(500).json({ error: 'Errore interno del server' });
    }
};

export const getUserData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Token mancante o non valido' });
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }
        res.json(user);
    } catch (error) {
        console.error('Errore durante il recupero dell\'utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
};