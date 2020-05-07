const express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    Calendar = require("../models/calendar"),
    User = require("../models/user"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    crypto = require("crypto"),
    config = require('../settings.json');

router.get("/", function(req, res){
    Calendar.find({}, function(err, allEvents){
        if(err) {
            console.log(err);
        }
        let newEvents = [];
        let place = allEvents.length;
        while(place > allEvents.length-4) {
            if(allEvents[place] !== undefined) newEvents.push(allEvents[place]);
            place--;
        }
        res.render("landing", {events: newEvents});
    });
 });

router.get("/forgot", function(req,res){
    res.render("forgot");
});

router.get("/faq", function(req,res){
    res.render("faq");
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: config.mailerEmail,
                    pass: config.mailerPassword
                }
            });
            var mailOptions = {
                to: user.email,
                from: config.mailerEmail,
                subject: config.websiteName + ' - Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            console.log("password token invalid");
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: config.mailerEmail,
                    pass: config.mailerPassword
                }
            });
            var mailOptions = {
                to: user.email,
                from: config.mailerEmail,
                subject: config.websiteName + ' - Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});
 
 router.get("/register", function(req,res){
     res.render("register", {email: "", username: "", displayname: "", password: "", error: ""});
 });
 
 router.post("/register", function(req, res){
     let role = {name:config.userGroups[0], num:0};
     if(req.body.username === "admin") role = {name: config.userGroups[5], num:5};
     const newUser = new User({
         email: req.body.email,
         username: req.body.username,
		 displayname: req.body.displayname,
         role: role,
		 registrationDate: Date.now()
     });
     User.register(newUser, req.body.password, function(err,user){
         if(err) {
             console.log(err.name);
			 let errMessage = err.message;
			 errMessage = errMessage.replace("User validation failed: ", "");
			 errMessage = errMessage.replace("email: ", " - ");
			 errMessage = errMessage.replace(", ", "<br>");
			 errMessage = errMessage.replace("displayname: ", " - ");
			 errMessage = errMessage.replace("displayname", "display name");
             return res.render("register", {email: req.body.email, username: req.body.username, displayname: req.body.displayname, password: req.body.password, error: errMessage});
         }
         passport.authenticate("local")(req,res,function(){
             res.redirect("/opcenter/");
         })
     });
 });
 
 router.get("/login", function(req, res){
     res.render("login");
 });
 
 router.post("/login", passport.authenticate("local", 
     {
         successRedirect:"/", 
         failureRedirect:"/login",
         failureFlash: true
     }), function(req, res){
 });
 
 router.get("/logout", function(req, res){
     req.logout();
     res.redirect("/");
 });

 module.exports = router;