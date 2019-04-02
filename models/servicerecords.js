const mongoose = require("mongoose");

const serviceRecord = new mongoose.Schema({});

module.exports = mongoose.model("Service", serviceRecord);