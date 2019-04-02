const express = require("express"), app = express(), bodyParser = require("body-parser"),
    mongoose = require("mongoose"), passport = require("passport"), LocalStrategy = require("passport-local"),
    User = require("./models/user"), authRoutes = require("./routes/index"),
    listUsersRoutes = require("./routes/listusers"), opCenterRoutes = require("./routes/opcenter"),
    userRoutes = require("./routes/user.js"), calendarRoutes = require("./routes/calendar.js");

mongoose.connect("mongodb://localhost:27017/persman", {useNewUrlParser: true})
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('public'));

//PASSPORT
app.use(require("express-session")({
   secret: "Motta sucks",
   resave: false,
   saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.use(authRoutes);
app.use(listUsersRoutes);
app.use(opCenterRoutes);
app.use(userRoutes);
app.use(calendarRoutes);

app.listen(3000, function(){
   console.log("PERSMAN: ONLINE") ;
});
