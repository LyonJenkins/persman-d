const express = require("express"), router = express.Router(), User = require("../models/user"), Calendar = require("../models/calendar"), Event = require("../models/eventspecifics"), async = require("async");
const admin = 5, recruiter = 4, officer = 3, nco = 2, enlisted = 1, guest = 0;

router.get("/calendar", isLoggedIn, function(req, res){
    Calendar.find({}, function(err, allEvents){
        if(err) {
            console.log(err);
        } else {
            res.render("calendar/calendar", {allEvents: allEvents});
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
                res.render("calendar/viewevent",{event: foundEvent, list: foundSpecifics[0].attendingList, user:req.user})
            }
        });
    });
});

router.get("/calendar/event", isLoggedIn, function(req,res){
    if(req.user.role.num < recruiter) return res.redirect("/");
    res.render("calendar/newevent");
});

router.post("/calendar/event", isLoggedIn, function(req,res){
    if(req.user.role.num < recruiter) return res.redirect("/");
    let event = {};
    if(req.body.eventtype === "Basic Training") {
        event = {type: "Basic Training", color : "green"};
    } else if(req.body.eventtype === "Operation") {
        event = {type: "Operation", color : "blue"};
    }
    const body = req.body;
    const newEvent = new Calendar({
        title: body.eventname,
        start: body.eventstart,
        description: body.desc,
        startTime: body.eventtime,
        imageName: body.imagename,
        eventType: event,
    });
    Calendar.create(newEvent, function(err, doc){
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
    if(req.user.role.num < enlisted) return res.redirect("/");
    if(req.body.type === "register") {
        Event.find({eventID: req.params.id}, function(err,foundEvent){
            if(err) {
                console.log(err);
            }
            foundEvent = foundEvent[0];
            const attendingList = foundEvent.attendingList;
            for(let i = 0; i < attendingList.length; i++) {
                if(attendingList[i].username === req.user.username) return res.redirect(`/calendar/event/${req.params.id}`);
            }
            let newList = foundEvent.attendingList;
            newList.push(req.user);
            Event.findByIdAndUpdate(foundEvent._id, {$set:{attendingList: newList}}, function(err,event){
               if(err) {
                   console.log(err);
               }
            });
            return res.redirect(`/calendar/event/${req.params.id}`);
        });
    } else if(req.body.type === "unregister"){
        Event.find({eventID: req.params.id}, function(err,foundEvent){
            if(err) {
                console.log(err);
            }
            foundEvent = foundEvent[0];
            const attendingList = foundEvent.attendingList;
            let val = false;
            for(let i = 0; i < attendingList.length; i++) {
                if(attendingList[i].username === req.user.username) val = true;
            }
            if(!val) return res.redirect(`/calendar/event/${req.params.id}`);
            let newList = foundEvent.attendingList;
            const username = req.user.username;
            const index = attendingList.findIndex(user => user.username === username);
            newList.splice(index,1);
            Event.findByIdAndUpdate(foundEvent._id, {$set:{attendingList: newList}}, function(err,event){
               if(err) {
                   console.log(err);
               }
            });
            return res.redirect(`/calendar/event/${req.params.id}`);
        });
    }
});

router.get("/calendar/events", isLoggedIn, function(req,res){
    if(req.user.role.num < recruiter) return res.redirect("/");
    Calendar.find({}, function(err, foundEvents){
       if(err) {
           console.log(err);
       }
       res.render("calendar/allevents", {events : foundEvents});
    });
});

router.get("/calendar/event/edit/:id", isLoggedIn, function(req,res){
   if(req.user.role.num < recruiter) return res.redirect("/");
});

router.post("/calendar/events/:id", isLoggedIn, function(req, res){
    if(req.user.role.num < recruiter) return res.redirect("/");
    Calendar.findByIdAndDelete(req.params.id, err => {
        if(err) {
            console.log(err);
        }
    });
    Event.findOneAndDelete({eventID: req.params.id}, err => {
       if(err) {
           console.log(err);
       }
    });
    res.redirect("/calendar/events");
});

 function isLoggedIn(req,res,next){
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/login");
 }

 module.exports = router;