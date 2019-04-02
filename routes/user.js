const express = require("express"), router = express.Router(), passport = require("passport"), User = require("../models/user");

router.get("/user/:id", isLoggedIn, function(req,res){
    User.findById(req.params.id, function(err, foundUser){
        if(err) {
            console.log(err);
        } else {
            res.render("userpage", {user: foundUser});
        }
    });
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

 module.exports = router;