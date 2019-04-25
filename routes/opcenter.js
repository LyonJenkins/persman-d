const express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Discharge = require("../models/discharge"),
    Leave = require("../models/loa"),
    async = require("async"),
    Application = require("../models/application"),
    Comment = require("../models/comment");
const admin = 5, recruiter = 4, officer = 3, nco = 2, enlisted = 1, guest = 0;

router.get("/opcenter", isLoggedIn, function(req, res){
   res.render("opcenter");
});

router.get("/opcenter/discharge", isLoggedIn, function(req, res){
    if(req.user.role.num === guest) return res.redirect("/");
    res.render("discharge", {user:req.user});
});

router.get("/opcenter/loa", isLoggedIn, function(req, res){
    if(req.user.role.num === guest) return res.redirect("/");
    res.render("loa", {user:req.user});
});

router.get("/opcenter/yourrequests", isLoggedIn, function(req, res){
   if(req.user.role.num === guest) return res.redirect("/");
   Discharge.find({ownerID: req.user.id}, function(err,discharge){
       if(err) {
           console.log(err);
       }
        Leave.find({ownerID: req.user.id}, function(err, leave){
            if(err) {
                console.log(err);
            }
            Application.find({ownerID: req.user.id}, function(err,app){
                if(err) {
                    console.log(err);
                }
                res.render("userrequests", {leaves: leave, discharges: discharge, applications: app, user: req.user});
            });
        });

   });
});

router.post("/opcenter/discharge", isLoggedIn, function(req, res){
    if(req.user.role.num === guest) return res.redirect("/");
    Discharge.create({reason: req.body.reason, ownerID: req.body.id, dateCreated: Date.now()}, function(err){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/opcenter")
        }
    });
});

router.post("/opcenter/loa", isLoggedIn, function(req, res){
    if(req.user.role.num === guest) return res.redirect("/");
    User.findByIdAndUpdate({_id: req.user._id}, {$set:{status: "Leave of Absence"}}, function(err){
        if(err) {
            console.log(err);
        }
    });
    Leave.create({reason: req.body.reason, leaveDate: req.body.begindate, returnDate: req.body.enddate, ownerID: req.body.id, dateCreated: Date.now()}, function(err){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/opcenter")
        }
    });
});

router.get("/opcenter/requests", isLoggedIn, function(req, res){
    if(req.user.role.num !== admin) return res.redirect("/");
    User.find({}, function(err,users){
       if(err) {
           console.log(err);
       }
       Discharge.find({}, function(err, discharges){
           if(err) {
               console.log(err);
           }
           Leave.find({}, function(err, leaves){
               if(err) {
                   console.log(err);
               }
               Application.find({}, function(err, apps){
                   res.render("requests", {users: users, discharges:discharges, loas:leaves, applications:apps})
               })
           })
       });
    });
});

router.post("/opcenter/deleterequest/:id", isLoggedIn, function(req,res){
    if(req.user.role.num !== admin) return res.redirect("/");
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
    } else if(req.body.requestType === "Application") {
        Application.findByIdAndDelete(req.params.id, function(err){
            if(err) {
                console.log(err);
            }
        });
    }
    res.redirect("/opcenter/requests");
});

router.post("/opcenter/viewrequest/:id", isLoggedIn, function(req,res){
    if(req.user.role.num !== admin) return res.redirect("/");
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
    } else if(req.body.requestType === "Application") {
        Application.findById(req.params.id, function(err, foundApp){
           if(err) {
               console.log(err);
           }
           User.find({}, function(err, allUsers){
              if(err) {
                  console.log(err);
              }
              res.render("viewapplication", {app: foundApp, users: allUsers})
           });
        });

    }
});

router.get("/opcenter/application", isLoggedIn, function(req,res){
    if(req.user.role.num !== guest || req.user.role.num !== admin) return res.redirect("/");
    res.render("createapplication", {submitted: false});
});

router.post("/opcenter/application", isLoggedIn, function(req,res){
    const newApplication = new Application({
        requestType: "Application",
        age: req.body.age,
        hours: req.body.length,
        reason: req.body.reason,
        findUs: req.body.findus,
        game: req.body.arma3,
        microphone: req.body.mic,
        position: req.body.mos,
        ownerID: req.user._id,
        steamProfile: req.body.profile,
        read: "Pending",
        dateCreated: Date.now(),
    });
    Application.create(newApplication, function(err,app){
        if(err) {
            console.log(err);
        }
        res.render("createapplication", {submitted: true})
    });
});

router.post("/opcenter/:id/", isLoggedIn, function(req,res){
    if(req.user.role.num !== admin) return res.redirect("/");
    if(req.body.requestType === "Leave") {
        if(req.body.approve === "1") {
            Leave.findByIdAndUpdate({_id: req.body.id}, {read: "Approved"}, function(err){
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
            Leave.findByIdAndUpdate({_id: req.body.id}, {read: "Denied"}, function(err){
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
                    Discharge.findOneAndUpdate({_id: req.body.id}, {$set:{type:req.body.dischargeType, read:"Accepted"}}, function(err){
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
            Discharge.findOneAndUpdate({_id: req.body.id}, {$set:{read: "Denied"}}, function(err){
                if(err) {
                    console.log(err);
                }
            });
        }
    } else if(req.body.requestType === "Application") {
        if(req.body.approve === "1") {
            Application.findByIdAndUpdate(req.body.id, {$set:{read: "Approved"}}, function(err, doc){
                if(err) {
                    console.log(err);
                }
               User.findById(doc.ownerID, {$set:{rank:"PVT", role:{name: "Enlisted", num: 1}}}, function(err, doc){
                  if(err) {
                      console.log(err);
                  }
               });
            });
        } else {
            Application.findByIdAndUpdate(req.body.id, {$set:{read: "Denied"}}, function(err, doc){
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