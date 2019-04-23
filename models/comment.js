const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    discussion_id: String,
    posted: Date,
    author: Object,
    text: String,
});

module.exports = mongoose.model("Comment", commentSchema);