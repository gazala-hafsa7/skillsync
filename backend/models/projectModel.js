const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  domain: String,
  teamLead: String,
  teamLeadId: String,
  maxTeamSize: Number,
  members: [
    {
      id: String,
      name: String
    }
  ],
  tags: [String],
  status: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Project", projectSchema);