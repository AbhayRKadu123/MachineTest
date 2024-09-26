// models/User.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role:{
        type:String,
       default:'admin'
        
    } // Password is handled internally by Passport Local Mongoose
});

// Passport Local Mongoose handles password hashing and authentication methods
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

module.exports = User;
