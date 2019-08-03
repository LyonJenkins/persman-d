const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    username: {type: String, unique: true, required: true},
    password: String,
    registrationDate: Date,
    steamProfile: String,
    preferredTheme: {type: String, default: "Dark"},
    unit: {type: Object, default: {company: "none", platoon: "none", squad: "none"}},
    status: {type: String, default: "none"},
    rank: {type: String, default: "none"},
    position: {type: String, default: "none"},
    role: {type: Object, default: {name: "Guest", num: 0}},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);