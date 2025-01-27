import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    hero: {type: String, required: true},
    credits: {type: Number, default: 0}
});

const User = mongoose.model('User', UserSchema);

export default User;