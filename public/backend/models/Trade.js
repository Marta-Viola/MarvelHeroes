// modello della collezione Trade: conterrà tutti i trade (pendenti, accettati e rifiutati)
// di ogni trade salva:
//      - id dell'utente che lo propone (user0)
//      - id del personaggio dell'utente che lo propone (fig0)
//      - id del personaggio entrante (fig1)
//      - id dell'utente che lo riceve (user1)
//      - data di ultima modifica del trade
//      - stato del trade, che può essere:
//          - pendente
//          - accettato
//          - rifiutato
//      - id dell'oggetto figurina uscente
//      - id dell'oggetto figurina entrante

import mongoose from 'mongoose';

const TradeSchema = new mongoose.Schema({
    market0: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
    market1: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
    idUser0: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idFig0: { type: Number, required: true },
    idFig1: { type: Number, required: true },
    idUser1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dataModifica: {type: Date, default: Date.now },
    status: { 
        type: String, 
        required: true,
        enum: ['pendente', 'accettato', 'rifiutato']
    },
    idFig0Obj: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
    idFig1Obj: { type: mongoose.Schema.Types.ObjectId, ref: 'Market', required: true },
});

const Trade = mongoose.model('Trade', TradeSchema);
export default Trade;