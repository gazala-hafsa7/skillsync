const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  role: {
    type: String,
    default: "student"
  },
  dept: {
    type: String,
    default: ""
  },
  year: {
    type: String,
    default: ""
  },
  isMentor: {
    type: Boolean,
    default: false
  },
  skills: {
    type: [String],
    default: []
  },
  achievements: {
    type: [String],
    default: []
  },
  personalCalendar: {
    type: [
      {
        title: String,
        description: {
          type: String,
          default: ""
        },
        eventDate: Date,
        sourceType: {
          type: String,
          default: "custom"
        },
        sourceId: String,
        sourceLabel: String,
        projectId: String,
        projectTitle: String,
        link: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  }
});

module.exports = mongoose.model("User", userSchema);
