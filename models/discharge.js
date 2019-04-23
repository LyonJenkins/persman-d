const mongoose = require("mongoose");

const DischargeSchema = new mongoose.Schema({
    requestType: {type: String, default: "Discharge"},
    reason: String,
    ownerID: String,
    type: {type: String, default: "Honorable"},
    read: {type: String, default: "Pending"},
    dateCreated: Date,
});

module.exports = mongoose.model("Discharge", DischargeSchema);