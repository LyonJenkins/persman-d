const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    eventID: String,
    attendingList: Object,
});

module.exports = mongoose.model("Event", EventSchema);