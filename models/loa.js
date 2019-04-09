const mongoose = require("mongoose");

const LOASchema = new mongoose.Schema({
    requestType: {type: String, default: "Leave"},
    reason: String,
    ownerID: String,
    leaveDate: String,
    returnDate: String,
    read: {type: Boolean, default: false},
    dateCreated: Date,
});

module.exports = mongoose.model("Leave", LOASchema);