const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  category: {
    type: String,
    default: "general",
    trim: true,
  },
  resultDate: Date,
  postedBy: {
    type: String,
    default: "Admin",
  },
  taggedStudents: {
    type: [
      {
        userId: String,
        name: String,
        email: String,
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Result", resultSchema);
