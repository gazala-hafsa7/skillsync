const Project = require("../models/projectModel");



exports.createProject = async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

exports.joinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ensure members array exists
    if (!project.members) {
      project.members = [];
    }

    const userId = req.user._id.toString(); // 🔥 USE TOKEN, NOT BODY

    // prevent duplicate
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: "Already joined" });
    }

    // check team size
    if (project.members.length >= project.maxTeamSize) {
      return res.status(400).json({ message: "Team full" });
    }

    project.members.push(userId);

    await project.save();

    res.json(project);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE PROJECT
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    // ❌ Not found
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔒 Only team lead can delete
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