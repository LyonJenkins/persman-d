const express = require("express"), router = express.Router(), passport = require("passport"), User = require("../models/user");
const admin = 5, recruiter = 4, officer = 3, nco = 2, enlisted = 1, guest = 0;

router.get("/listusers", isLoggedIn, function(req, res){
    User.find({}, function(err, allUsers){
       if(err) {
          console.log(err);
       } else {
          res.render("listusers", {users: allUsers});
       }
    })
 });

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

 module.exports = router;