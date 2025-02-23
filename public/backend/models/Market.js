// modello della collezione Market: conterrà tutte le figurine messe a mercato
// di ogni elemento voglio salvare:
//      - id dell'utente che ha messo la figurina a mercato
//      - id della figurina
//      - data di creazione della proposta

import mongoose from 'mongoose';
import User from './User.js';

const MarketSchema = new mongoose.Schema({
    idUtente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // riferimento all'utente che ha messo la figurina a mercato
    idPersonaggio: { type: Number, required: true }, // id della figurina
    data: { type: Date, default: Date.now }, // data di creazione della proposta
    idFigurinaObj: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Market = mongoose.model('Market', MarketSchema);
export default Market;