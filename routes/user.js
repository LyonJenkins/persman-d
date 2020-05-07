const express = require("express"), router = express.Router(), passport = require("passport"),
    User = require("../models/user"), config = require('../settings.json');

router.get("/user/:id", isLoggedIn, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            res.render("userpage", {user: foundUser});
        }
    });
});

router.get("/user/edit/:id", isLoggedIn, function (req, res) {
	if (req.user.role.num < 3) return res.redirect("/");
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            res.render("edit", {user: foundUser});
        }
    });
});

router.post("/user/edit", isLoggedIn, function (req, res) {
    if (req.user.role.num < 3) return res.redirect("/");
    let userCerts = [];
    let userTabs = [];
    let userAwards = [];
    let userSShops = [];
    User.find({_id: req.body.id}, function (err, user) {
        if (err) {
            console.log(err);
        }
		if(typeof req.body.certifications === "string") {
            userCerts.push(req.body.certifications);
        } else {
            userCerts = req.body.certifications;
        }
		if(typeof req.body.tabs === "string") {
            userTabs.push(req.body.tabs);
        } else {
            userTabs = req.body.tabs;
        }
		if(typeof req.body.awards === "string") {
            userAwards.push(req.body.awards);
        } else {
            userAwards = req.body.awards;
        }
		if(typeof req.body.sShops === "string") {
            userSShops.push(req.body.sShops);
        } else {
            userSShops = req.body.sShops;
        }
        let newUnit = {company: req.body.company, platoon: req.body.platoon, squad: req.body.squad, team: req.body.team};
		if(req.body.status === "Reserve") {
			newUnit = {company: req.body.company, platoon: "None", squad: "None", team: "None"};
		}
		if(req.body.status === "Retired") {
			newUnit = {company: "None", platoon: "None", squad: "None", team: "None"};
		}
        let roleNum = 0;
		if(req.body.role !== undefined){
			switch (req.body.role) {
				case config.userGroups[0]:
					roleNum = 0;
					break;
				case config.userGroups[1]:
					roleNum = 1;
					break;
				case config.userGroups[2]:
					roleNum = 2;
					break;
				case config.userGroups[3]:
					roleNum = 3;
					break;
				case config.userGroups[4]:
					roleNum = 4;
					break;
				case config.userGroups[5]:
					roleNum = 5;
					break;
			}
			User.findOneAndUpdate({_id: req.body.id}, {$set: {role: {name: req.body.role, num: roleNum}}
			}, function (err, doc) {
				if (err) {
					console.log(err);
				}
			});
		}
		
        User.findOneAndUpdate({_id: req.body.id}, {
            $set: {
				displayname: req.body.displayname,
				registrationDate: req.body.registrationDate,
                rank: req.body.rank,
                status: req.body.status,
                position: req.body.position,
                sShop: req.body.sShop,
                unit: newUnit,
                certifications: userCerts,
                tabs: userTabs,
                awards: userAwards,
                sShops: userSShops
            }
        }, function (err, doc) {
            if (err) {
                console.log(err);
				req.flash("error",err.message);
				res.redirect("/user/edit/"+req.body.id);
            } else {
				req.flash("success","Successfully edited the user.");
				res.redirect("/user/edit/"+req.body.id);
			}
        });
    });
});

router.post("/user/delete/:id", isLoggedIn, (req, res) => {
    if (req.user.role.num < 4) return res.redirect("/");
    User.findByIdAndDelete(req.params.id, err => {
        if (err) {
            res.redirect("/");
        } else {
            res.redirect("/listusers");
        }
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;