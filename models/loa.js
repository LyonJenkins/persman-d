const mongoose = require("mongoose");

const LOASchema = new mongoose.Schema({
    requestType: {type: String, default: "Leave"},
    reason: String,
    ownerID: String,
    leaveDate: Date,
    returnDate: Date,
    read: {type: Boolean, default: false},
});

module.exports = mongoose.model("Leave", LOASchema);