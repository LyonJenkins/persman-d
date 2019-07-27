const express = require("express"), router = express.Router(), passport = require("passport"), User = require("../models/user"), config = require('../settings.json');
const admin = 5, recruiter = 4, officer = 3, nco = 2, enlisted = 1, guest = 0;

router.get("/listusers", isLoggedIn, function(req, res){
    let platoons = [];
    const sortingSquads = ["Platoon HQ", "First Squad", "Second Squad", "Third Squad", "Fourth Squad"];
    let squads = [];
    User.find({}, function(err, allUsers){
       if(err) {
          console.log(err);
       } else {
           allUsers.forEach(function(user){
              const platoon = user.unit.platoon;
              const squad = user.unit.squad;
              if(platoons.indexOf(platoon) === -1 && platoon !== "none") platoons.push(platoon);
              if(squads.indexOf(squad) === -1 && squad !== "none") squads.push(squad);
              squads.sort(function(a, b){
                 return sortingSquads.indexOf(a) - sortingSquads.indexOf(b);
              });
           });
          res.render("listusers", {users: allUsers, platoons: platoons, squads: squads, config: config});
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