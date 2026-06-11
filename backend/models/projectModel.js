const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  domain: String,
  teamLead: String,
  teamLeadId: String,
  needsMentor: {
    type: Boolean,
    default: false
  },
  maxTeamSize: Number,
  members: {
    type: [
      {
        userId: String,
        name: String,
        email: String,
      }
    ],
    default: []
  },
  mentorRequests: {
    type: [
      {
        mentorId: String,
        mentorName: String,
        mentorEmail: String,
        message: String,
        accepted: {
          type: Boolean,
          default: false
        },
        reply: {
          type: String,
          default: ""
        },
        requestedAt: {
          type: Date,
          default: Date.now
        },
        acceptedAt: Date,
        repliedAt: Date
      }
    ],
    default: []
  },
  tags: [String],
  status: String,
  messages: {
    type: [
      {
        senderId: String,
        senderName: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },
  calendarItems: {
    type: [
      {
        title: String,
        description: {
          type: String,
          default: ""
        },
        eventDate: Date,
        createdById: String,
        createdByName: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Project", projectSchema);
