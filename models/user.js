const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),
	uniqueValidator = require('mongoose-unique-validator'),
	config = require('../settings.json');

const UserSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: [true, "Email can't be blank."], match: [/\S+@\S+\.\S+/, 'Email is invalid.']},
    username: {type: String, unique: true, required: true},
	displayname: {type: String, unique: true, required: [true, "Display name can't be blank."]},
    password: String,
    registrationDate: Date,
    steamProfile: String,
    discordUsername: String,
    country: String,
    age: Number,
    certifications: Array,
    tabs: Array,
    awards: Array,
    preferredTheme: {type: String, default: "Dark"},
    unit: {type: Object, default: {company: "none", platoon: "none", squad: "none", team: "none"}},
    status: {type: String, default: "None"},
    rank: {type: String, default: "None"},
    position: {type: String, default: "None"},
    sShops: Array,
    role: {type: Object, default: {name: config.userGroups[0], num: 0}},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(uniqueValidator, {message: 'A user with the given {PATH} of {VALUE} already exists.'});

module.exports = mongoose.model("User", UserSchema);