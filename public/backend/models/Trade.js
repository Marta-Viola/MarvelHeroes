// modello della collezione Trade: conterrà tutti i trade (nati, vivi e morti)
// di ogni trade voglio salvare:
//      - id dell'utente che lo propone (user0)
//      - id della figurina dell'utente che lo propone (fig0)
//      - id della figurina entrante (fig1)
//      - id dell'utente che lo riceve (user1)
//      - data di ultima modifica del trade
//      - stato del trade, che può essere:
//          - pendente
//          - accettato
//          - rifiutato

// più che l'id della figurina, sarebbe meglio usare l'_id dell'oggetto market...

import mongoose from 'mongoose';
import Market from './Market.js';

const TradeSchema = new mongoose.Schema({
    market0: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
    market1: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
    idUser0: { type: String, required: true },
    idFig0: { type: Number, required: true },
    idFig1: { type: Number, required: true },
    idUser1: { type: String, required: true },
    dataModifica: {type: Date, default: Date.now },
    status: { 
        type: String, 
        required: true,
        enum: ['pendente', 'accettato', 'rifiutato']
    }
});

const Trade = mongoose.model('Trade', TradeSchema);
export default Trade;