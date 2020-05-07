const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
    requestType: {type: String, default: "Application"},
	country: String,
	age: String,
	hours: String,
	reason: String,
	position: String,
	positionReason: String,
	findUs: String,
	steamProfile: String,
	arma3: String,
	mic: String,
	ts3: String,
	tfar: String,
	discord: String,
	discordUsername: String,
	language: String,
	ace: String,
	youngLeadership: String,
	milsim: String,
    ownerID: String,
    read: {type: String, default: "pending"},
    dateCreated: Date,
    comments: Array,
});

module.exports = mongoose.model("Application", ApplicationSchema);