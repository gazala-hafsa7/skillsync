const Project = require("../models/projectModel");

const normalizeMembers = (members = []) =>
  members.map(member =>
    typeof member === "string"
      ? { userId: member, name: "Member", email: "" }
      : member
  );

const canAccessProject = (project, userId) => {
  if (project.teamLeadId.toString() === userId) return true;
  return normalizeMembers(project.members).some(member => member.userId === userId);
};

const normalizeCalendarItems = (items = []) =>
  items.map(item => ({
    ...item,
    id: item._id ? item._id.toString() : item.id,
  }));

const normalizeMentorRequests = (items = []) =>
  items.map(item => ({
    ...item,
    mentorId: item.mentorId?.toString?.() || item.mentorId,
  }));

exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.teamLeadId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the team lead can edit this project" });
    }

    const title = (req.body.title || "").trim();
    const description = (req.body.description || "").trim();
    const domain = (req.body.domain || "").trim();
    const maxTeamSize = Number(req.body.maxTeamSize);
    const tags = Array.isArray(req.body.tags) ? req.body.tags : project.tags;
    const needsMentor = typeof req.body.needsMentor === "boolean" ? req.body.needsMentor : project.needsMentor;

    if (!title) {
      return res.status(400).json({ message: "Project title is required" });
    }

    if (!description) {
      return res.status(400).json({ message: "Project description is required" });
    }

    if (!domain) {
      return res.status(400).json({ message: "Project domain is required" });
    }

    if (Number.isNaN(maxTeamSize) || maxTeamSize < 2) {
      return res.status(400).json({ message: "Max team size must be at least 2" });
    }

    project.title = title;
    project.description = description;
    project.domain = domain;
    project.maxTeamSize = maxTeamSize;
    project.tags = tags;
    project.needsMentor = needsMentor;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMentorRequest = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.needsMentor) {
      return res.status(400).json({ message: "This project is not requesting a mentor" });
    }

    if (!req.user.isMentor) {
      return res.status(403).json({ message: "Only mentor-enabled users can send mentor requests" });
    }

    const userId = req.user._id.toString();
    const message = (req.body.message || "").trim();

    if (project.teamLeadId?.toString() === userId) {
      return res.status(400).json({ message: "Team lead cannot send a mentor request to their own project" });
    }

    const existingRequest = normalizeMentorRequests(project.mentorRequests || []).some(item => item.mentorId === userId);
    if (existingRequest) {
      return res.status(400).json({ message: "You already sent a mentor request for this project" });
    }

    project.mentorRequests.push({
      mentorId: userId,
      mentorName: req.user.name,
      mentorEmail: req.user.email,
      message,
      requestedAt: new Date(),
    });

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.acceptMentorRequest = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.teamLeadId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the team lead can accept mentor requests" });
    }

    const requestItem = (project.mentorRequests || []).find(item => item.mentorId?.toString?.() === req.params.mentorId || item.mentorId === req.params.mentorId);

    if (!requestItem) {
      return res.status(404).json({ message: "Mentor request not found" });
    }

    requestItem.accepted = true;
    requestItem.acceptedAt = new Date();

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.replyToMentorRequest = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.teamLeadId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the team lead can reply to mentor requests" });
    }

    const reply = (req.body.reply || "").trim();
    if (!reply) {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const requestItem = (project.mentorRequests || []).find(item => item.mentorId?.toString?.() === req.params.mentorId || item.mentorId === req.params.mentorId);

    if (!requestItem) {
      return res.status(404).json({ message: "Mentor request not found" });
    }

    requestItem.reply = reply;
    requestItem.repliedAt = new Date();

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.joinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userId = req.user._id.toString();
    project.members = normalizeMembers(project.members || []);

    if (project.members.some(member => member.userId === userId)) {
      return res.status(400).json({ message: "You already joined this project" });
    }

    if (project.teamLeadId.toString() === userId) {
      return res.status(400).json({ message: "Team lead cannot join their own project" });
    }

    if (project.members.length + 1 >= project.maxTeamSize) {
      return res.status(400).json({ message: "Team is full" });
    }

    project.members.push({
      userId,
      name: req.user.name,
      email: req.user.email,
    });
    await project.save();

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectMessages = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userId = req.user._id.toString();

    if (!canAccessProject(project, userId)) {
      return res.status(403).json({ message: "Not authorized to access project chat" });
    }

    res.json(project.messages || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendProjectMessage = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userId = req.user._id.toString();

    if (!canAccessProject(project, userId)) {
      return res.status(403).json({ message: "Not authorized to send messages in this project chat" });
    }

    const text = (req.body.text || "").trim();

    if (!text) {
      return res.status(400).json({ message: "Message text is required" });
    }

    project.messages.push({
      senderId: userId,
      senderName: req.user.name,
      text,
      createdAt: new Date(),
    });

    await project.save();

    res.json(project.messages || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectCalendar = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userId = req.user._id.toString();

    if (!canAccessProject(project, userId)) {
      return res.status(403).json({ message: "Not authorized to access project calendar" });
    }

    res.json(normalizeCalendarItems(project.calendarItems || []));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addProjectCalendarItem = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const userId = req.user._id.toString();

    if (!canAccessProject(project, userId)) {
      return res.status(403).json({ message: "Not authorized to update project calendar" });
    }

    const title = (req.body.title || "").trim();
    const description = (req.body.description || "").trim();
    const eventDate = req.body.eventDate;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    if (!eventDate) {
      return res.status(400).json({ message: "Event date is required" });
    }

    project.calendarItems.push({
      title,
      description,
      eventDate: new Date(eventDate),
      createdById: userId,
      createdByName: req.user.name,
      createdAt: new Date(),
    });

    await project.save();

    res.json(normalizeCalendarItems(project.calendarItems || []));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.teamLeadId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await project.deleteOne();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
