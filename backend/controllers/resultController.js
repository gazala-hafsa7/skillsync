const Result = require("../models/Result");

const normalizeTaggedStudents = (taggedStudents) => {
  if (!Array.isArray(taggedStudents)) {
    return [];
  }

  return taggedStudents
    .filter(student => student && student.userId && student.name)
    .map(student => ({
      userId: String(student.userId),
      name: String(student.name),
      email: typeof student.email === "string" ? student.email : "",
    }));
};

const parseResultDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "invalid";
  }

  return parsed;
};

exports.getResults = async (_req, res) => {
  try {
    const results = await Result.find().sort({ resultDate: -1, createdAt: -1 });
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createResult = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can add results" });
    }

    const { title, description, category, resultDate, taggedStudents } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Result title is required" });
    }

    const parsedResultDate = parseResultDate(resultDate);
    if (parsedResultDate === "invalid") {
      return res.status(400).json({ message: "Invalid result date" });
    }

    const item = await Result.create({
      title: String(title).trim(),
      description: typeof description === "string" ? description.trim() : "",
      category: typeof category === "string" && category.trim() ? category.trim() : "general",
      resultDate: parsedResultDate || undefined,
      postedBy: req.user.name,
      taggedStudents: normalizeTaggedStudents(taggedStudents),
    });

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteResult = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete results" });
    }

    const item = await Result.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Result not found" });
    }

    await item.deleteOne();
    res.json({ message: "Result deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
