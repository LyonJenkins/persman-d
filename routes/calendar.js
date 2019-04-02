const express = require("express"), router = express.Router(), User = require("../models/user"), Calendar = require("../models/calendar"), Event = require("../models/eventspecifics");

router.get("/calendar", isLoggedIn, function(req, res){
    Calendar.find({}, function(err, allEvents){
        if(err) {
            console.log(err);
        } else {
            res.render("calendar", {allEvents: allEvents});
        }
    })
 });

router.get("/calendar/event/:id", isLoggedIn, function(req, res){
    Calendar.findById(req.params.id, function(err, foundEvent){
        if(err) {
            console.log(err);
        }
        Event.find({eventID: foundEvent._id}, function(err, foundSpecifics){
            if(err) {
                console.log(err);
            } else {
                res.render("viewevent",{event: foundEvent, list: foundSpecifics[0].attendingList, user:req.user})
            }
        });
    });
});

router.get("/calendar/event", isLoggedIn, function(req,res){
    if(!req.user.role) return res.redirect("/");
    res.render("newevent");
});

router.post("/calendar/event", isLoggedIn, function(req,res){
    if(!req.user.role) return res.redirect("/");
    Calendar.create({title: req.body.eventname, start:req.body.eventstart, description:req.body.desc}, function(err, doc){
        if(err) {
            console.log(err);
        }
        Event.create({eventID:doc._id, attendingList: []}, function(err,doc){
            if(err) {
                console.log(err);
            }
        });
    });
    res.redirect("/calendar/");
});

router.post("/calendar/event/:id/users", isLoggedIn, function(req,res){
    if(req.user.rank === "none") return res.redirect("/");
    if(req.body.type === "register") {
        Event.find({eventID: req.params.id}, function(err,foundEvent){
            if(err) {
                console.log(err);
            }
            foundEvent = foundEvent[0];
            let userList = foundEvent.attendingList;
            userList.push(req.user);
            Event.findOneAndUpdate({_id:foundEvent._id}, {$set:{attendingList: userList}}, function(err, event){
                if(err) {
                    console.log(err);
                }
            })
        });
    } else if(req.body.type === "unregister"){
        Event.find({eventID: req.params.id}, function(err,foundEvent){
            if(err) {
                console.log(err);
            }
            foundEvent = foundEvent[0];
            let userList = [];
            foundEvent.attendingList.forEach(function(attendee){
                if(attendee.username !== req.user.username) {
                    userList.push(attendee);
                }
            });
            Event.findOneAndUpdate({_id:foundEvent._id}, {$set:{attendingList: userList}}, function(err, event){
                if(err) {
                    console.log(err);
                }
            })
        });
    }
    res.redirect(`/calendar/event/${req.params.id}`)
});

 function isLoggedIn(req,res,next){
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/login");
 }

 module.exports = router;