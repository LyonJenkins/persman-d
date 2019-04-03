const express = require("express"), router = express.Router(), passport = require("passport"), User = require("../models/user");

router.get("/listusers", isLoggedIn, function(req, res){
    User.find({}, function(err, allUsers){
       if(err) {
          console.log(err);
       } else {
          res.render("listusers", {users: allUsers, priv: req.user.role});
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