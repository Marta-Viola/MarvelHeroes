import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import connectDB from './public/backend/config/db.js';
import authRoutes from './public/backend/routes/authRoutes.js';
import dotenv from 'dotenv';
import authMiddleware from './public/backend/middlewares/auth.js';

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
app.use('/api', authRoutes);

//get
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'landing.html'));
});
app.get('/api/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'signup.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'login.html'));
});
app.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'frontend', 'homepage.html'));
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

//app.use(bodyParser.urlencoded({ extended: true }));

// //Serve i file statici
// app.use(express.static(path.join(__dirname, '/public')));
// //app.use(express.static(__dirname)); //rende pubblica la cartella locale

// 
// /*
// //Connessione a MongoDB
// mongoose.connect(process.env.Mongo_URI)
//     .then(() => {
//         console.log('Connected to MongoDB');
//     }).catch(err => {
//         console.error('Error connecting to MongoDB', err);
//     });


// //Schema e modello per gli utenti
// const UserSchema = new mongoose.Schema({
//     username: {type: String, required: true, unique: true},
//     password: {type: String, required: true},
//     email: {type: String, required: true, unique: true},
//     hero: {type: String, required: true}
// });

// const User = mongoose.model('User', UserSchema);
// /*
// /*
// const test = new User({
//     username: 'testuser',
//     password: '12345',
//     email: 'teest@example.com',
//     hero: 'Iron MAn'
// });
// test.save().then(() => {
//     console.log('User saved');
// }).catch(err => {
//     console.error('Error saving user', err);
// });
// */

// //endpoint in app.js in backend folder, con controller, middleware, models, routes
// //
// //TODO: file .env per variabili d'ambiente npm install dotenv, import dotenv from 'dotenv', 
// //Es6 versione di JS in .json

// //Signup
// app.get('/signup', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'signup.html'));
// });
// /*
// //route di registrazione
// app.post('/signup', async (req, res) => {
//     console.log('ricevuta richesta POST to /signup');
//     try {
//         const { username, password, email, hero} = req.body;
//         console.log('User Data: ', req.body);

//         //controlla se l'utente esiste già
//         const existingUser = await User.findOne({ username });
//         if (existingUser) {
//             console.log('Username already exists');
//             return res.status(400).json({ error: 'Username già utilizzato' });
//         }

//         //cripta la password
//         const hashedPassword = await bcrypt.hash(password, 10);
//         //console.log('Hashed Password: ', hashedPassword);
        
//         //crea un nuovo utente
//         const newUser = new User({ 
//             username, 
//             password: hashedPassword, 
//             email, 
//             hero
//         });

//         //salva l'utente nel database
//         await newUser.save();
//         console.log('User saved succesfully');

//         //reindirizza alla pagina di login
//         res.status(201).json({ message: 'Utente creato con successo', redirect: '/login' });
//     } catch(err) {
//         console.error('Errore nella registrazione', err);
//         res.status(500).json({ error: 'Errore interno del server' });
//     }
// });
// */
// //Login
// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });
// /*
// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user || !await bcrypt.compare(password, user.password)) {
//         return res.status(401).send('Credenziali non valide');
//     }
//     const token = jwt.sign({ username: user.username }, jwtSecret, {expiresIn: '1h' });
//     res.json({ token });
// });

//Homepage
// app.get('/homepage', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
// });
  
//Middleware di autenticazione
/*
const auth = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, 'segreto');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send('Autenticazione fallita');
    }
};
*/
// */