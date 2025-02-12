import mongoose from "mongoose";

const MarketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },  // ID dell'utente che ha messo in vendita la figurina
    
    figurinaId: {
        type: String,
        required: true
    },  // ID della figurina messa sul mercato

    dateAdded: {
        type: Date,
        default: Date.now
    },  // Data di inserimento nel mercato
});

const Market = mongoose.model("Market", MarketSchema);
export default Market;