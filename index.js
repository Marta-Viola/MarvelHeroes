const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const port = 5500;

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//Connessione a MongoDB
mongoose.connect('mongodb+srv://smarta:Grace11@cluster0.utcyj.mongodb.net/MarvelHeroes'
    ).then(() => {
        console.log('Connected to MongoDB');
    }).catch(err => {
        console.error('Error connecting to MongoDB', err);
    });

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    hero: {type: String, required: true}
});

const User = mongoose.model('User', UserSchema);

/*
const test = new User({
    username: 'testuser',
    password: '12345',
    email: 'teest@example.com',
    hero: 'Iron MAn'
});
test.save().then(() => {
    console.log('User saved');
}).catch(err => {
    console.error('Error saving user', err);
});
*/

//Signup
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

//route di registrazione
app.post('/signup', async (req, res) => {
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
        console.log('Hashed Password: ', hashedPassword);
        
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
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
/*
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).send('Credenziali non valide');
    }
    const token = jwt.sign({ username: user.username }, 'segreto', {expiresIn: '1h' });
    res.json({ token });
});
*/  
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

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});