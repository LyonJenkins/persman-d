const express = require("express"), router = express.Router(), passport = require("passport"),
    User = require("../models/user"), config = require('../settings.json'), _ = require("lodash");
const admin = 5, recruiter = 4, officer = 3, nco = 2, enlisted = 1, guest = 0;

router.get("/listusers", isLoggedIn, function (req, res) {
    let platoons = [];
    // const platoonObj = ({
    //     name: "",
    //     squads: []
    // });
    const sortingPlatoons = ["First Platoon", "Second Platoon", "Third Platoon", "Fourth Platoon"];
    const sortingSquads = ["Platoon HQ", "First Squad", "Second Squad", "Third Squad", "Fourth Squad"];
    // let squads = [];
    User.find({}, function (err, allUsers) {
        if (err) {
            console.log(err);
        } else {
            allUsers.forEach(function (user){
                const platoonName = user.unit.platoon;
                const squadName = user.unit.squad;
                if(platoonName === "none") return;
                if(search(platoons, platoonName) === false) {
                    let newSquads = [];
                    newSquads.push(squadName);
                    let platoon = ({
                        name: platoonName,
                        squads : newSquads
                    });
                    platoons.push(platoon);
                }
                if(searchSquads(platoons, platoonName, squadName) === false) {
                    let platoon = platoons.find(o => o.name === platoonName);
                    let newSquads;
                    if(platoon.squads.length !== 0) newSquads = platoon.squads;
                    newSquads.push(squadName);
                    newSquads.sort(function (a, b) {
                        return sortingSquads.indexOf(a) - sortingSquads.indexOf(b);
                    });
                    for(let i = 0; i < platoons.length; i++) {
                        if(platoons[i].name === platoon) {
                            platoons[i].squads = newSquads;
                            break;
                        }
                    }
                }
            });

            const platoonsByOrder = new Map(sortingPlatoons.map((t, i) => [t, i]));
            const newPlats = _.sortBy(platoons, o => platoonsByOrder.get(o.name));
            res.render("listusers", {users: allUsers, platoons: newPlats, config: config});
        }
    })
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function search(array, key) {
    for(let i = 0; i < array.length; i++) {
        if(array[i].name === key) return true;
    }
    return false;
}

function searchSquads(array, platoon, key) {
    for(let i = 0; i < array.length; i++) {
        if(array[i].name === platoon) {
            for(let j = 0; j < array[i].squads.length; j++) {
                if(array[i].squads[j] === key) {
                    return true;
                }
            }
        }
    }
    return false;
}

module.exports = router;