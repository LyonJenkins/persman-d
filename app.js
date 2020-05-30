const express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user"),
    authRoutes = require("./routes/index"),
    listUsersRoutes = require("./routes/listusers"),
    opCenterRoutes = require("./routes/opcenter"),
    userRoutes = require("./routes/user.js"),
    calendarRoutes = require("./routes/calendar.js"),
    flash = require("connect-flash"),
    session = require('express-session'),
    cookieParser = require("cookie-parser"),
    favicon = require('serve-favicon'),
    path = require('path'),
    config = require('./settings.json');

const NODE_PORT = process.env.NODE_PORT || 3000;
const MONGO_IP = process.env.MONGO_IP || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || '27017';

mongoose.connect("mongodb://" + MONGO_IP + ':' + MONGO_PORT + "/persman", {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(cookieParser('secret'));
app.use(favicon(path.join(__dirname, '.', 'public', 'favicon.ico')));

//PASSPORT
app.use(require("express-session")({
   secret: "Motta sucks",
   resave: false,
   saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.config = config;
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use(authRoutes);
app.use(listUsersRoutes);
app.use(opCenterRoutes);
app.use(userRoutes);
app.use(calendarRoutes);

app.listen(NODE_PORT, function(){
   console.log("PERSMAN: ONLINE") ;
});
