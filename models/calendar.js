const mongoose = require("mongoose");

const CalendarSchema = new mongoose.Schema({
    title: String,
    start: String,
    description: String,
    eventType: {type: Object, default: {type: "", color: "blue"}},
    startTime: String,
    imageName: String,
});

module.exports = mongoose.model("Calendar", CalendarSchema);