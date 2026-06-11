const User = require("../models/userModel");

exports.listUsers = async (req, res) => {
  try {
    const filter = {};

    if (typeof req.query.role === "string" && req.query.role.trim()) {
      const requestedRole = req.query.role.trim();

      if (requestedRole === "student") {
        filter.$or = [
          { role: "student" },
          { role: { $exists: false } },
          { role: null },
          { role: "" },
        ];
      } else {
        filter.role = requestedRole;
      }
    }

    const users = await User.find(filter)
      .select("name email role dept year")
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, dept, year, isMentor, skills, achievements, personalCalendar } = req.body;

    user.name = typeof name === "string" ? name : user.name;
    user.dept = typeof dept === "string" ? dept : user.dept;
    user.year = typeof year === "string" ? year : user.year;
    user.isMentor = typeof isMentor === "boolean" ? isMentor : user.isMentor;
    user.skills = Array.isArray(skills) ? skills : user.skills;
    user.achievements = Array.isArray(achievements) ? achievements : user.achievements;
    user.personalCalendar = Array.isArray(personalCalendar) ? personalCalendar : user.personalCalendar;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isMentor: user.isMentor,
      dept: user.dept,
      year: user.year,
      skills: user.skills,
      achievements: user.achievements,
      personalCalendar: user.personalCalendar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isMentor: user.isMentor,
      dept: user.dept,
      year: user.year,
      skills: user.skills,
      achievements: user.achievements,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
