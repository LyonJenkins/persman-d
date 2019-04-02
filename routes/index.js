const express = require("express"), router = express.Router(), passport = require("passport"), User = require("../models/user"), flash = require("connect-flash");

router.get("/", function(req, res){
    res.render("landing");
 });

 
 router.get("/register", function(req,res){
     res.render("register");
 });
 
 router.post("/register", function(req, res){
     let role;
     if(req.body.username === "admin") role = true;
     var newUser = new User({username:req.body.username, role:role, registrationDate:Date.now()});
     User.register(newUser, req.body.password, function(err,user){
         if(err) {
             console.log(err.name);
             return res.render("register");
         }
         passport.authenticate("local")(req,res,function(){
             res.redirect("/");
         })
     });
 });
 
 router.get("/login", function(req, res){
     res.render("login");
 });
 
 router.post("/login", passport.authenticate("local", 
     {
         successRedirect:"/", 
         failureRedirect:"/login"
     }), function(req, res){
 });
 
 router.get("/logout", function(req, res){
     req.logout();
     res.redirect("/");
 });
 
 function isLoggedIn(req,res,next){
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/login");
 }

 module.exports = router;