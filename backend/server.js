console.log("MY SERVER IS RUNNING");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use((req, res, next) => {
  console.log("REQUEST HIT:", req.method, req.url);
  next();
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});