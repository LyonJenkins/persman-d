const mongoose = require("mongoose");

const LOASchema = new mongoose.Schema({
    actionType: {type: String, default: "Leave"},
    reason: String,
    leaveDate: Date,
    returnDate: Date,
    read: {type: Boolean, default: false},
});

module.exports = mongoose.model("Leave", LOASchema);