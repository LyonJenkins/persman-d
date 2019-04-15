const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    registrationDate: Date,
    unit: {type: Object, default: {company: "none", platoon: "none", squad: "none"}},
    status: {type: String, default: "none"},
    rank: {type: String, default: "none"},
    position: {type: String, default: "none"},
    role: {type: Number, default: 0},
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);