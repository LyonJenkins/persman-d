const express = require("express"),
    router = express.Router(),
    User = require("../models/user"),
    Discharge = require("../models/discharge"),
    Leave = require("../models/loa"),
    async = require("async"),
    Application = require("../models/application"),
    Comment = require("../models/comment"),
    fs = require("fs"),
    configName = '../settings.json',
    config = require('../settings.json');

router.get("/opcenter", isLoggedIn, function(req, res){
   res.render("opcenter/opcenter", {submitted: 0});
});

router.get("/opcenter/discharge", isLoggedIn, function(req, res){
    if(req.user.role.num === 0) return res.redirect("/");
    res.render("opcenter/discharge", {user:req.user});
});

router.get("/opcenter/loa", isLoggedIn, function(req, res){
    if(req.user.role.num === 0) return res.redirect("/");
    res.render("opcenter/loa", {user:req.user});
});

router.get("/opcenter/yourrequests", isLoggedIn, function(req, res){
   //if(req.user.role.num === 0) return res.redirect("/");
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
                res.render("opcenter/userrequests", {leaves: leave, discharges: discharge, applications: app, user: req.user});
            });
        });
   });
});

router.post("/opcenter/discharge", isLoggedIn, function(req, res){
    if(req.user.role.num === 0) return res.redirect("/");
    Discharge.create({reason: req.body.reason, ownerID: req.body.id, dateCreated: Date.now()}, function(err){
        if(err) {
            console.log(err);
        } else {
			res.render("opcenter/opcenter", {submitted: 1});
        }
    });
});

router.post("/opcenter/loa", isLoggedIn, function(req, res){
    if(req.user.role.num === 0) return res.redirect("/");
    /*User.findByIdAndUpdate({_id: req.user._id}, {$set:{status: "Leave of Absence"}}, function(err){ // Moved action from "creation of LOA" to "approval of LOA"
        if(err) {
            console.log(err);
        }
    });*/
    Leave.create({reason: req.body.reason, leaveDate: req.body.begindate, returnDate: req.body.enddate, ownerID: req.body.id, dateCreated: Date.now()}, function(err){
        if(err) {
            console.log(err);
        } else {
			res.render("opcenter/opcenter", {submitted: 1});
        }
    });
});

router.get("/opcenter/requests", isLoggedIn, function(req, res){
    if(req.user.role.num < 3) return res.redirect("/");
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
                   res.render("opcenter/requests", {users: users, discharges:discharges, loas:leaves, applications:apps})
               })
           })
       });
    });
});

router.post("/opcenter/deleterequest/:id", isLoggedIn, function(req,res){
    if(req.user.role.num < 3) return res.redirect("/");
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
    //if(req.user.role.num < 3) return res.redirect("/");
    if(req.body.requestType === "Discharge" && req.user.role.num >= 3) {
        Discharge.findById(req.params.id, function(err, foundDischarge){
            if(err) {
                console.log(err);
            } else {
                User.find({}, function(err, allUsers){
                    if(err) {
                        console.log(err);
                    } else {
                        res.render("opcenter/viewdischarge", {discharge: foundDischarge, users: allUsers});
                    }
                })
            }
        });
    } else if(req.body.requestType === "Leave" && req.user.role.num >= 3) {
        Leave.findById(req.params.id, function(err, foundLeave){
            if(err) {
                console.log(err);
            } else {
                User.find({}, function(err, allUsers){
                    if(err) {
                        console.log(err);
                    } else {
                        res.render("opcenter/viewloa", {loa: foundLeave, users: allUsers});
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
              res.render("opcenter/viewapplication", {app: foundApp, users: allUsers})
           });
        });
    } else {
		return res.redirect("/");
	}
});

router.get("/opcenter/application", isLoggedIn, function(req,res){
    if(req.user.role.num === 5 || req.user.role.num === 0) {
        res.render("opcenter/createapplication", {user: req.user});
    } else {
        return res.redirect("/");
    }
});

router.post("/opcenter/application", isLoggedIn, function(req,res){
    const newApplication = new Application({
        requestType: "Application",
        country: req.body.country,
        age: req.body.age,
        hours: req.body.hours,
        reason: req.body.reason,
        position: req.body.position,
        positionReason: req.body.positionReason,
        findUs: req.body.findUs,
        steamProfile: req.body.steamProfile,
        arma3: req.body.arma3,
        mic: req.body.mic,
        ts3: req.body.ts3,
        tfar: req.body.tfar,
        discord: req.body.discord,
        discordUsername: req.body.discordUsername,
        language: req.body.language,
        ace: req.body.ace,
        youngLeadership: req.body.youngLeadership,
        milsim: req.body.milsim,
        ownerID: req.user._id,
        read: "Pending",
        dateCreated: Date.now(),
    });
    Application.create(newApplication, function(err,app){
        if(err) {
            console.log(err);
        }
        res.render("opcenter/opcenter", {submitted: 2});
    });
});

router.post("/opcenter/:id/", isLoggedIn, function(req,res){
    //if(req.user.role.num < 3) return res.redirect("/");
    if(req.body.requestType === "Leave") {
        if(req.body.approve === "1") {
            Leave.findByIdAndUpdate({_id: req.body.id}, {read: "Approved"}, function(err, doc){
                if(err) {
                    console.log(err);
                }
				User.findByIdAndUpdate({_id: doc.ownerID}, {$set:{status: "Leave of Absence"}}, function(err){
					if(err) {
						console.log(err);
					}
				});
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
                    Discharge.findOneAndUpdate({_id: req.body.id}, {$set:{type:req.body.dischargeType, read:"Approved"}}, function(err){
                        if(err) {
                            console.log(err);
                        }
                    });
                    User.findOneAndUpdate({_id: foundDischarge.ownerID}, {$set:{status:"Retired", unit: {company: "none", platoon: "none", squad:"none", team:"none"}, rank:"none"}}, function(err){
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
				User.findByIdAndUpdate({_id: doc.ownerID}, {$set:{status: "Active Duty", rank: config.ranks[1], role: {name: config.userGroups[1], num: 1}, steamProfile: doc.steamProfile, discordUsername: doc.discordUsername, age: doc.age, country: doc.country}}, function(err){
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

router.get("/settings", isLoggedIn, function(req,res){
    if(req.user.role.num !== 5) return res.redirect("/");
    res.render("opcenter/settings");
});

router.post("/settings", isLoggedIn, function(req,res){
    if(req.user.role.num < 5) return res.redirect("/");

    let enableApplication = req.body.enableApplication;
    let websiteName = req.body.websiteName;
    let websiteSubtitle = req.body.websiteSubtitle;
    let websiteLogo = req.body.websiteLogo;
    let landingText = req.body.landingText;
    let faq = req.body.faq;
    let mailerEmail = req.body.mailerEmail;
    let mailerPassword = req.body.mailerPassword;
    let discordURL = req.body.discordURL;
    let ts3URL = req.body.ts3URL;
    let modlistURL = req.body.modlistURL;
    let youtubeURL = req.body.youtubeURL;
    let instagramURL = req.body.instagramURL;
    let a3unitsURL = req.body.a3unitsURL;
    let steamgroupURL = req.body.steamgroupURL;
    let donateURL = req.body.donateURL;
    let enableRetiredMembers = req.body.enableRetiredMembers;
    let enableVisibility = req.body.enableVisibility;
    let enableCallToAction = req.body.enableCallToAction;
    let certifications = req.body.certifications.split(",");
    let carouselImages = req.body.carouselImages.split(",");
    let carouselTitles = req.body.carouselTitles.split(",");
    let resourceLinks = req.body.resourceLinks.split(",");
    let resourceTitles = req.body.resourceTitles.split(",");
    let tabs = req.body.tabs.split(",");
    let tabDesc = req.body.tabDesc.split(",");
    let awards = req.body.awards.split(",");
    let awardDesc = req.body.awardDesc.split(",");
    let roles = req.body.roles.split(",");
    let companies = req.body.companies.split(",");
    let platoons = req.body.platoons.split(",");
    let squads = req.body.squads.split(",");
    let teams = req.body.teams.split(",");
    let sShops = req.body.sShops.split(",");
    let ranks = req.body.ranks.split(",");
	let userGroups = [req.body.userGroup0, req.body.userGroup1, req.body.userGroup2, req.body.userGroup3, req.body.userGroup4, req.body.userGroup5];
    if(req.body.enableApplication === undefined) enableApplication = "off";
    if(req.body.enableRetiredMembers === undefined) enableRetiredMembers = "off";
    if(req.body.enableVisibility === undefined) enableVisibility = "off";
    if(req.body.enableCallToAction === undefined) enableCallToAction = "off";
	
	if((tabs.length !== tabDesc.length) || (awards.length !== awardDesc.length) || (carouselImages.length !== carouselTitles.length) || (resourceLinks.length !== resourceTitles.length)) {
        req.flash('error', 'Operations Center Error: Number of descriptions do not match their parent.');
        return res.redirect("/settings");
	}		
	
    if((enableApplication === config.enableApplication)
		&& (websiteName === config.websiteName)
		&& (websiteSubtitle === config.websiteSubtitle)
		&& (websiteLogo === config.websiteLogo)
		&& (landingText === config.landingText)
		&& (faq === config.faq)
		&& (mailerEmail === config.mailerEmail)
		&& (mailerPassword === config.mailerPassword)
		&& (discordURL === config.discordURL)
		&& (ts3URL === config.ts3URL)
		&& (modlistURL === config.modlistURL)
		&& (youtubeURL === config.youtubeURL)
		&& (instagramURL === config.instagramURL)
		&& (a3unitsURL === config.a3unitsURL)
		&& (steamgroupURL === config.steamgroupURL)
		&& (donateURL === config.donateURL)
		&& (enableRetiredMembers === config.enableRetiredMembers)
		&& (enableVisibility === config.enableVisibility)
		&& (enableCallToAction === config.enableCallToAction)
		&& (JSON.stringify(certifications) === JSON.stringify(config.certifications))
		&& (JSON.stringify(carouselImages) === JSON.stringify(config.carouselImages))
		&& (JSON.stringify(carouselTitles) === JSON.stringify(config.carouselTitles))
		&& (JSON.stringify(resourceLinks) === JSON.stringify(config.resourceLinks))
		&& (JSON.stringify(resourceTitles) === JSON.stringify(config.resourceTitles))
		&& (JSON.stringify(tabs) === JSON.stringify(config.tabs))
		&& (JSON.stringify(tabDesc) === JSON.stringify(config.tabDesc))
		&& (JSON.stringify(awards) === JSON.stringify(config.awards))
		&& (JSON.stringify(awardDesc) === JSON.stringify(config.awardDesc))
		&& (JSON.stringify(roles) === JSON.stringify(config.roles))
		&& (JSON.stringify(companies) === JSON.stringify(config.companies))
		&& (JSON.stringify(squads) === JSON.stringify(config.squads))
		&& (JSON.stringify(teams) === JSON.stringify(config.teams))
		&& (JSON.stringify(sShops) === JSON.stringify(config.sShops))
		&& (JSON.stringify(userGroups) === JSON.stringify(config.userGroups))
		&& (JSON.stringify(ranks) === JSON.stringify(config.ranks))
		&& (JSON.stringify(platoons) === JSON.stringify(config.platoons))) {
        req.flash('error', 'No changes to the settings have been made.');
        return res.redirect("/settings");
    }

    config.enableApplication = enableApplication;
    config.websiteName = websiteName;
    config.websiteSubtitle = websiteSubtitle;
    config.websiteLogo = websiteLogo;
    config.landingText = landingText;
    config.faq = faq;
    config.mailerEmail = mailerEmail;
    config.mailerPassword = mailerPassword;
    config.discordURL = discordURL;
    config.ts3URL = ts3URL;
    config.modlistURL = modlistURL;
    config.youtubeURL = youtubeURL;
    config.instagramURL = instagramURL;
    config.a3unitsURL = a3unitsURL;
    config.steamgroupURL = steamgroupURL;
    config.donateURL = donateURL;
    config.enableRetiredMembers = enableRetiredMembers;
    config.enableVisibility = enableVisibility;
    config.enableCallToAction = enableCallToAction;
    config.certifications = certifications;
    config.carouselImages = carouselImages;
    config.carouselTitles = carouselTitles;
    config.resourceLinks = resourceLinks;
    config.resourceTitles = resourceTitles;
    config.tabs = tabs;
    config.tabDesc = tabDesc;
    config.awards = awards;
    config.awardDesc = awardDesc;
    config.roles = roles;
    config.companies = companies;
    config.platoons = platoons;
    config.squads = squads;
    config.teams = teams;
    config.sShops = sShops;
    config.ranks = ranks;
    config.userGroups = userGroups;

    fs.writeFile("./settings.json", JSON.stringify(config), function (err) {
        if (err) return console.log(err);
        console.log('writing to ' + configName);
    });

    req.flash('success', 'Settings have been successfully updated.');
    res.redirect("/settings");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;