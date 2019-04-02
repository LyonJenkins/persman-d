const express = require("express"), router = express.Router(), User = require("../models/user"), Discharge = require("../models/discharge");

router.get("/opcenter", isLoggedIn, function(req, res){
    res.render("opcenter", {priv: req.user.role});
});

router.get("/opcenter/messages", isLoggedIn, function(req, res){
    res.render("messages");
});

router.get("/opcenter/discharge", isLoggedIn, function(req, res){
    res.render("discharge", {user:req.user});
});

router.post("/opcenter/discharge", isLoggedIn, function(req, res){
    Discharge.create({reason: req.body.reason, ownerID: req.body.id}, function(err, doc){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/opcenter")
        }
    });
});

router.get("/opcenter/newrequests", isLoggedIn, function(req, res){
    if(!req.user.role) return res.redirect("/");
    Discharge.find({}, function(err, allDischarges){
        if(err) {
           console.log(err);
        } else {
            User.find({}, function(err, allUsers){
                if(err) {
                    console.log(err);
                } else {
                    res.render("newrequests", {discharges: allDischarges, users: allUsers});
                }
            })
        }
    })
})

router.get("/opcenter/allrequests", isLoggedIn, function(req, res){
    if(!req.user.role) return res.redirect("/");
    Discharge.find({}, function(err, allDischarges){
        if(err) {
           console.log(err);
        } else {
            User.find({}, function(err, allUsers){
                if(err) {
                    console.log(err);
                } else {
                    res.render("allrequests", {discharges: allDischarges, users: allUsers});
                }
            })
        }
    })
})

router.get("/opcenter/viewrequest/:id", isLoggedIn, function(req,res){
    if(!req.user.role) return res.redirect("/");
    Discharge.findById(req.params.id, function(err, foundDischarge){
        if(err) {
            console.log(err);
        } else {
            User.find({}, function(err, allUsers){
                if(err) {
                    console.log(err);
                } else {
                    res.render("viewdischarge", {discharge: foundDischarge, users: allUsers});
                }
            })
        }
    });
});

router.post("/opcenter/discharge/approve", isLoggedIn, function(req,res){
    if(!req.user.role) return res.redirect("/");
    Discharge.findById(req.body.id, function(err, foundDischarge){
        if(err) {
            console.log(err);
        } else {
            Discharge.findOneAndUpdate({_id: req.body.id}, {$set:{type:req.body.dischargeType}}, function(err,doc){
                if(err) {
                    console.log(err);
                }
            });
            Discharge.findOneAndUpdate({_id: req.body.id}, {$set:{read:true}}, function(err,doc){
                if(err) {
                    console.log(err);
                }
            });
            User.findOneAndUpdate({_id: foundDischarge.ownerID}, {$set:{status:"Retired"}}, function(err,doc){
                if(err) {
                    console.log(err);
                }
                User.findOneAndUpdate({_id: foundDischarge.ownerID}, {$set:{unit: {company: "", platoon: "", squad:""}}}, function(err,doc){
                    if(err) {
                        console.log(err);
                    }
                });
            });
            res.redirect("/opcenter/newrequests")
        }
    });
});

router.post("/opcenter/discharge/deny", isLoggedIn, function(req,res){
    if(!req.user.role) return res.redirect("/");
    Discharge.findById(req.body.id, function(err, foundDischarge){
        if(err) {
            console.log(err);
        } else {
            Discharge.findByIdAndDelete(req.body.id, err => {
                if(err) {
                    res.redirect("/");
                } else {
                    res.redirect("/opcenter/newrequests");
                }
            });
        }
    });
});


//  router.get("/listusers", isLoggedIn, function(req, res){
//     User.find({}, function(err, allUsers){
//        if(err) {
//           console.log(err);
//        } else {
//           res.render("listusers", {users: allUsers, priv: req.user.role});
//        }
//     })
//  });
 function isLoggedIn(req,res,next){
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/login");
 }

 module.exports = router;