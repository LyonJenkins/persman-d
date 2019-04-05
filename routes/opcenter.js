const express = require("express"), router = express.Router(), User = require("../models/user"), Discharge = require("../models/discharge"), Leave = require("../models/loa");;

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

router.get("/opcenter/requests", isLoggedIn, function(req, res){
    if(!req.user.role) return res.redirect("/");
    // Discharge.find({}, function(err, allDischarges){
    //     if(err) {
    //        console.log(err);
    //     } else {
    //         User.find({}, function(err, allUsers){
    //             if(err) {
    //                 console.log(err);
    //             } else {
    //                 res.render("newrequests", {discharges: allDischarges, users: allUsers});
    //             }
    //         })
    //     }
    // })
    return res.render("requests", {discharges: []});
});

router.post("/opcenter/requests", isLoggedIn, function(req, res){
    if(!req.user.role) return res.redirect("/");
    let users;
    User.find({}, function(err, allUsers){
        if(err) {
            console.log(err);
        }
        users = allUsers;
    });
    Discharge.find({}, function(err, allDischarges){
        if(err) {
            console.log(err);
        }
        if(req.body.type === "All Requests") {
            res.render("requests", {users: users, discharges:allDischarges})
        } else if(req.body.type === "New Requests") {
            let filteredDischarges = [];
            for(let i = 0; i < allDischarges.length; i++) {
                if(allDischarges[i].read === false) {
                    filteredDischarges.push(allDischarges[i]);
                }
            }
            res.render("requests", {users: users, discharges:filteredDischarges});
        }
    })
});

router.get("/opcenter/viewrequest/:id", isLoggedIn, function(req,res){
    if(!req.user.role) return res.redirect("/");
    if(req.body.requestType === "Discharge") {
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
    } else if(req.body.requestType === "Leave") {
        Leave.findById(req.params.id, function(err, foundLeave){
            if(err) {
                console.log(err);
            } else {
                User.find({}, function(err, allUsers){
                    if(err) {
                        console.log(err);
                    } else {
                        res.render("viewloa", {loa: foundLeave, users: allUsers});
                    }
                })
            }
        });
    }

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
            res.redirect("/opcenter/requests")
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
                    res.redirect("/opcenter/requests");
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