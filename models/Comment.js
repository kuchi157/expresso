const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },

  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  commentusername: {
    type: String,
    default: "Anonymous",
  },
  reported: {
    type: Boolean,
    default: false,
  },
  reporteduser: {
    type: String,
    default: "NA",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
