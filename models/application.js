const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
    requestType: {type: String, default: "Application"},
    age: String,
    hours: String,
    reason: String,
    findUs: String,
    game: String,
    microphone: String,
    position: String,
    ownerID: String,
    read: {type: String, default: "pending"},
    dateCreated: Date,
    comments: Array,
    steamProfile: String,
});

module.exports = mongoose.model("Application", ApplicationSchema);