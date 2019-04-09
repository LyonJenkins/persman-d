const express = require("express"), router = express.Router(), User = require("../models/user"), Discharge = require("../models/discharge"), Leave = require("../models/loa");;

router.get("/opcenter", isLoggedIn, function(req, res){
    if(req.user.rank === "none") return res.redirect("/");
    res.render("opcenter", {priv: req.user.role});
});

router.get("/opcenter/messages", isLoggedIn, function(req, res){
    if(req.user.rank === "none") return res.redirect("/");
    res.render("messages");
});

router.get("/opcenter/discharge", isLoggedIn, function(req, res){
    if(req.user.rank === "none") return res.redirect("/");
    res.render("discharge", {user:req.user});
});

router.get("/opcenter/loa", isLoggedIn, function(req, res){
    if(req.user.rank === "none") return res.redirect("/");
    res.render("loa", {user:req.user});
});

router.get("/opcenter/yourrequests", isLoggedIn, function(req, res){
   if(req.user.rank === "none") return res.redirect("/");
   Discharge.find({ownerID: req.user.id}, function(err,discharge){
       if(err) {
           console.log(err);
       }
        Leave.find({ownerID: req.user.id}, function(err, leave){
            if(err) {
                console.log(err);
            }
            res.render("userrequests", {leaves: leave, discharges: discharge, user: req.user});
        })
   });
});

router.post("/opcenter/discharge", isLoggedIn, function(req, res){
    if(req.user.rank === "none") return res.redirect("/");
    Discharge.create({reason: req.body.reason, ownerID: req.body.id}, function(err){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/opcenter")
        }
    });
});

router.post("/opcenter/loa", isLoggedIn, function(req, res){
    if(req.user.rank === "none") return res.redirect("/");
    User.findByIdAndUpdate({_id: req.user._id}, {$set:{status: "Leave of Absence"}}, function(err){
        if(err) {
            console.log(err);
        }
    });
    Leave.create({reason: req.body.reason, leaveDate: req.body.begindate, returnDate: req.body.enddate, ownerID: req.body.id}, function(err){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/opcenter")
        }
    });
});


router.get("/opcenter/requests", isLoggedIn, function(req, res){
    if(!req.user.role) return res.redirect("/");
    return res.render("requests", {discharges: [], loas: []});
});

router.post("/opcenter/requests", isLoggedIn, function(req, res){
    if(!req.user.role) return res.redirect("/");
    let foundUsers = [];
    User.find({}, function(err, allUsers){
        if(err) {
            console.log(err);
        }
        foundUsers = allUsers;
    });
    let leaves = [];
    Leave.find({}, function(err, allLeaves){
       if(err) {
           console.log(err);
       }
        if(req.body.type === "All Requests") {
            leaves = allLeaves;
        } else if(req.body.type === "New Requests") {
            for(let i = 0; i < allLeaves.length; i++) {
                if(allLeaves[i].read === false) {
                    leaves.push(allLeaves[i]);
                }
            }
        }
    });
    let filteredDischarges = [];
    Discharge.find({}, function(err, allDischarges){
        if(err) {
            console.log(err);
        }
        if(req.body.type === "All Requests") {
            res.render("requests", {users: foundUsers, discharges:allDischarges, loas:leaves})
        } else if(req.body.type === "New Requests") {
            for(let i = 0; i < allDischarges.length; i++) {
                if(allDischarges[i].read === false) {
                    filteredDischarges.push(allDischarges[i]);
                }
            }
            res.render("requests", {users: foundUsers, discharges:filteredDischarges, loas:leaves});
        }
    });
});

router.post("/opcenter/deleterequest/:id", isLoggedIn, function(req,res){
    if(!req.user.role) return res.redirect("/");
    if(req.body.requestType === "Discharge") {
        Discharge.findByIdAndDelete(req.params.id, function(err){
            if(err) {
                console.log(err);
            }
        });
    } else if(req.body.requestType === "Leave") {
        Leave.findByIdAndDelete(req.params.id, function(err){
            if(err) {
                console.log(err);
            }
        });
    }
    res.redirect("/opcenter/requests");
});

router.post("/opcenter/viewrequest/:id", isLoggedIn, function(req,res){
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

router.post("/opcenter/:id/", isLoggedIn, function(req,res){
    if(!req.user.role) return res.redirect("/");
    if(req.body.requestType === "Leave") {
        if(req.body.approve === "1") {
            Leave.findByIdAndUpdate({_id: req.body.id}, {read: true}, function(err){
                if(err) {
                    console.log(err);
                }
            });
            User.findByIdAndUpdate({_id: req.body.id}, {status: "Leave Of Absence"}, function(err){
                if(err) {
                    console.log(err);
                }
            });
        } else {
            Leave.findByIdAndUpdate({_id: req.body.id}, {read: true}, function(err){
                if(err) {
                    console.log(err);
                }
            });
        }
    } else if(req.body.requestType === "Discharge") {
        if(req.body.approve === "1") {
            Discharge.findById(req.body.id, function(err, foundDischarge){
                if(err) {
                    console.log(err);
                } else {
                    Discharge.findOneAndUpdate({_id: req.body.id}, {$set:{type:req.body.dischargeType, read:true}}, function(err){
                        if(err) {
                            console.log(err);
                        }
                    });
                    User.findOneAndUpdate({_id: foundDischarge.ownerID}, {$set:{status:"Retired", unit: {company: "none", platoon: "none", squad:"none"}, rank:"none"}}, function(err){
                        if(err) {
                            console.log(err);
                        }
                    });
                }
            });
        } else {
            Discharge.findOneAndUpdate({_id: req.body.id}, {$set:{read: true}}, function(err){
                if(err) {
                    console.log(err);
                }
            });
        }
    }
    res.redirect("/opcenter/requests");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
     return next();
    }
    res.redirect("/login");
}

 module.exports = router;