import mongoose from 'mongoose';

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected!');
    } catch (err) {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    }
    mongoose.connection.on('error', (error) => {
        console.error('Errore runtime del database: ', error);
    });
};

export default connectDB;