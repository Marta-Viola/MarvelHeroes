import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import connectDB from './public/backend/config/db.js';
import authRoutes from './public/backend/routes/authRoutes.js';
import dotenv from 'dotenv';
import authMiddleware from './public/backend/middlewares/auth.js';
import md5 from 'md5';
import profileRoutes from './public/backend/routes/profileRoutes.js';
import fetch from 'node-fetch';
import crypto from 'crypto';
import figurineRoutes from './public/backend/routes/figurineRoutes.js';
import creditsRoutes from './public/backend/routes/creditsRoutes.js';
import packsRoutes from './public/backend/routes/packsRoutes.js';
import albumRoutes from './public/backend/routes/albumRoutes.js';
import marketRoutes from "./public/backend/routes/marketRoutes.js";

//configurazioni
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = process.env.CORS_ORIGIN;

//Connessione al database
connectDB();

//Middleware
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allpwed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],   //permessi per i metodi
    allowedHeaders: ['Content-Type'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());

//routes
app.use('/api/auth', authRoutes);
app.use('/api/user', creditsRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/packs', authMiddleware, packsRoutes);
app.use('/api/album', albumRoutes);
app.use('/api/market', authMiddleware, marketRoutes);

//get
app.get('/api/landing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'landing.html'));
});
app.get('/api/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'signup.html'));
});
app.get('/api/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'login.html'));
});
app.get('/api/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'homepage.html'));
});
app.get('/api/myalbum', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'myalbum.html'));
});
app.get('/api/myprofile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'myprofile.html'));
});
app.get('/api/baratto', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'baratto.html'));
});
app.get('/api/compra_pac', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'compra_pac.html'));
});
app.get('/api/compra_cre', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'compra_cre.html'));
});

//avvio del server
app.listen(port, () => {
    console.log('Server is running at http://127.0.0.1:', port);
});

//percorso assoluto
// const __filename = fileURLToPatch(import.meta.url);
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

//Handler per le richieste OPTIONS (Preflight)
app.options('*', cors({
    origin: 'http://127.0.0.1:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

//API home figurine
function getHash(ts, publicKey, privateKey) {
    return crypto.createHash('md5').update(ts + privateKey + publicKey).digest('hex');
}

app.use('/api/figurine', figurineRoutes);

// app.get('/api/figurine', async (req, res) => {
//     try{
//         //Parametri di query per paginazione
//         const page = parseInt(req.query.page) || 1; //Pagina richiesta (default: 1)
//         const limit = parseInt(req.query.limit) || 10;  //Elementi per pagina (default: 10)
//         const offset = (page - 1) * limit;  //Calcola l'offset

//         //fai una richiesta alle API Marvel
//         const marvel_ts = process.env.MARVEL_TS || '1';
//         const marvel_private = process.env.MARVEL_PRIVATE;
//         const marvel_public = process.env.MARVEL_PUBLIC;
        
//         if (!marvel_private || !marvel_public) {
//             return res.status(500).json({ error: 'Chiavi API mancanti' });
//         }
        
//         //genera l'hash
//         const marvel_hash = getHash(marvel_ts, marvel_public, marvel_private);
        
//         //costruisce l'URL dell'API con limit e offset
//         const url = `${process.env.MARVEL_URL || 'http://gateway.marvel.com/v1/public/characters'}?ts=${marvel_ts}&apikey=${marvel_public}&hash=${marvel_hash}&limit=${limit}&offset=${offset}`;    
        
//         //esegue la richiesta dell'API Marvel
//         const response = await fetch(url);

//         if (!response.ok) {
//             throw new Error('Errore API: ${response.statusText}');
//         }

//         const data = await response.json();

//         //invia i dati al client
//         res.json({
//             data: {
//                 results: data.data.results,
//                 total: data.data.total, //numero totale di personaggi
//             },
//             page,
//             totalPages: Math.ceil(data.data.total / limit), //numero totale di pagine
//         });
//     } catch (error) {
//         console.error('Errore durante il recupero delle figurine:', error);
//         res.status(500).json({ error: 'Errore durante il recupero delle figurine' });
//     }
// });