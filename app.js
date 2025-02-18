import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import connectDB from './public/backend/config/db.js';
import authRoutes from './public/backend/routes/authRoutes.js';
import dotenv from 'dotenv';
import authMiddleware from './public/backend/middlewares/auth.js';
// import md5 from 'md5';
import profileRoutes from './public/backend/routes/profileRoutes.js';
// import fetch from 'node-fetch';
// import crypto from 'crypto';
import figurineRoutes from './public/backend/routes/figurineRoutes.js';
import creditsRoutes from './public/backend/routes/creditsRoutes.js';
import packsRoutes from './public/backend/routes/packsRoutes.js';
import albumRoutes from './public/backend/routes/albumRoutes.js';
import marketRoutes from './public/backend/routes/marketRoutes.js';

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
app.use('/api/user', [creditsRoutes, profileRoutes]);
app.use('/api/user', profileRoutes);
app.use('/api/packs', authMiddleware, packsRoutes);
app.use('/api/album', albumRoutes);
app.use('/api/market', marketRoutes);

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
// function getHash(ts, publicKey, privateKey) {
//     return crypto.createHash('md5').update(ts + privateKey + publicKey).digest('hex');
// }

app.use('/api/figurine', figurineRoutes);