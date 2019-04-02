const mongoose = require("mongoose");

const LOASchema = new mongoose.Schema({
    actionType: String,
    reason: String,
    read: {type: Boolean, default: false},
});

module.exports = mongoose.model("Leave", LOASchema);