const express = require("express"), router = express.Router(), User = require("../models/user"), Discharge = require("../models/discharge"), Leave = require("../models/loa"), async = require("async"), Application = require("../models/application");;
const admin = 5, recruiter = 4, officer = 3, nco = 2, enlisted = 1, guest = 0;

router.get("/opcenter", isLoggedIn, function(req, res){

    // // Counts all unread requests
    // if(req.user.role.num === admin) {
    //     let unreadRequests = 0;
    //     Discharge.find({}, function(err,discharges){
    //         if(err) {
    //             console.log(err);
    //         }
    //         async.forEachOf(discharges, (discharge, key, callback) => {
    //             if(discharge.read === false) {
    //                 unreadRequests++;
    //             }
    //         }, err => {
    //             if(err) console.log(err);
    //         });
    //     });
    //     Leave.find({}, function(err, leaves){
    //        if(err) {
    //            console.log(err);
    //        }
    //         async.forEachOf(leaves, (leave, key, callback) => {
    //             if(leave.read === false) {
    //                 unreadRequests++;
    //             }
    //         }, err => {
    //             if(err) console.log(err);
    //         });
    //        Application.find({}, function(err, apps){
    //            async.forEachOf(apps, (app, key, callback) => {
    //                if(app.read === false) {
    //                    unreadRequests++;
    //                }
    //            }, err => {
    //                if(err) console.log(err);
    //            });
    //        });
    //        setTimeout(function(){
    //            return res.render("opcenter", {count: unreadRequests});
    //        }, 250);
    //     });
    // }
    res.render("opcenter");
});

router.get("/opcenter/messages", isLoggedIn, function(req, res){
    if(req.user.role.num !== admin) return res.redirect("/");
    res.render("messages");
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


// router.get("/opcenter/requests", isLoggedIn, function(req, res){
//     if(req.user.role.num !== admin) return res.redirect("/");
//     return res.render("requests", {discharges: [], loas: [], applications: []});
// });

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
    // let users = [];
    // let leaves = [];
    // let filtereddischarges = [];
    // let allApps = [];
    //
    // function getRequests(_callback) {
    //     User.find({}, function(err, allUsers){
    //         if(err) {
    //             console.log(err);
    //         }
    //         users = allUsers;
    //     });
    //     Leave.find({}, function(err, allLeaves){
    //         if(err) {
    //             console.log(err);
    //         }
    //         if(req.body.type === "New Requests") {
    //             for(let i = 0; i < allLeaves.length; i++) {
    //                 if(allLeaves[i].read === false) {
    //                     leaves.push(allLeaves[i]);
    //                 }
    //             }
    //         } else {
    //             leaves = allLeaves;
    //         }
    //     });
    //     Discharge.find({}, function(err, allDischarges){
    //         if(err) {
    //             console.log(err);
    //         }
    //         if(req.body.type === "New Requests") {
    //             for(let i = 0; i < allDischarges.length; i++) {
    //                 if(allDischarges[i].read === false) {
    //                     filtereddischarges.push(allDischarges[i]);
    //                 }
    //             }
    //         } else {
    //             filtereddischarges = allDischarges;
    //         }
    //     });
    //     Application.find({}, function(err, allApplications){
    //         if(err) {
    //             console.log(err);
    //         }
    //         if(req.body.type === "New Requests") {
    //             for(let i = 0; i < allApplications.length; i++) {
    //                 if(allApplications[i].read === false) {
    //                     allApps.push(allApplications[i]);
    //                 }
    //             }
    //             console.log(allApps);
    //         } else {
    //             allApps = allApplications;
    //         }
    //         console.log(allApps);
    //     });
    // }
    // getRequests(() => res.render("requests", {users: users, discharges:filtereddischarges, loas:leaves, applications:allApps}));
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
    // if(req.user.role.num !== guest) return res.redirect("/");
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
        read: false,
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