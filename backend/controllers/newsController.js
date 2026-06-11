const News = require("../models/News");

const parseEventDate = (eventDate) => {
  if (!eventDate) {
    return null;
  }

  const parsedEventDate = new Date(eventDate);
  if (Number.isNaN(parsedEventDate.getTime())) {
    return "invalid";
  }

  return parsedEventDate;
};

exports.getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createNews = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can post news" });
    }

    const { type, title, description, hot, link, eventDate } = req.body;
    const parsedEventDate = parseEventDate(eventDate);

    if (parsedEventDate === "invalid") {
      return res.status(400).json({ message: "Invalid event date" });
    }

    const item = await News.create({
      type,
      title,
      description,
      hot: Boolean(hot),
      link: link || "",
      eventDate: parsedEventDate,
      postedBy: req.user.name,
    });

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateNews = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can edit news" });
    }

    const { type, title, description, hot, link, eventDate } = req.body;
    const parsedEventDate = parseEventDate(eventDate);

    if (parsedEventDate === "invalid") {
      return res.status(400).json({ message: "Invalid event date" });
    }

    const item = await News.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "News item not found" });
    }

    item.type = type;
    item.title = title;
    item.description = description;
    item.hot = Boolean(hot);
    item.link = link || "";
    item.eventDate = parsedEventDate || undefined;

    await item.save();
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete news" });
    }

    const item = await News.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "News item not found" });
    }

    await item.deleteOne();
    res.json({ message: "News deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
