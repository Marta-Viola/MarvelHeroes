const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5500;

//Middleware
app.use(bodyParser.json());

//Connessione a MongoDB
mongoose.connect('mongodb+srv://smarta:Grace11@cluster0.utcyj.mongodb.net/MarvelHeroes', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    hero: String
});

const User = mongoose.model('User', UserSchema);

//Signup
app.post('/sigup', async (req, res) => {
    const { username, password, email, hero} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, hero});
    await user.save();
    res.status(201).send('Utente creato');
});

//Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).send('Credenziali non valide');
    }
    const token = jwt.sign({ username: user.username }, 'segreto', {expiresIn: '1h' });
    res.json({ token });
});

//Middleware di autenticazione
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

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});