// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');
const routes = require('./routes/index');
engine = require('ejs-mate')
const app = express();
const path=require('path')
const methodOverride = require('method-override');

// Enable method override
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');

// Specify the views directory if it's not the default (i.e., './views')
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/passport_example', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(express.urlencoded({ extended: true }));

// Express Session configuration
app.use(session({
    secret: 'mysecret', // Replace this with your own secret
    resave: false,
    saveUninitialized: false,
}));
// npm i express-session
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.use('/', routes);

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
