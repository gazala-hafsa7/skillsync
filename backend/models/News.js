const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  type: String,
  title: String,
  description: String,
  postedBy: String,
  hot: Boolean,
  link: String,
  eventDate: Date,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("News", newsSchema);
