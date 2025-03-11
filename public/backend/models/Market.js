// modello della collezione Market: contiene tutte le figurine messe a mercato
// di ogni elemento salva:
//      - id dell'utente che ha messo la figurina a mercato
//      - id del personaggio
//      - data di creazione della proposta
//      - id dell'oggetto figurina

import mongoose from 'mongoose';

const MarketSchema = new mongoose.Schema({
    idUtente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idPersonaggio: { type: Number, required: true },
    data: { type: Date, default: Date.now },
    idFigurinaObj: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Market = mongoose.model('Market', MarketSchema);
export default Market;