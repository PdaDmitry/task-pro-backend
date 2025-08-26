const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRoutes");

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://task-pro-front.vercel.app",
    credentials: true,
  })
);

app.use("/auth", authRouter);

// app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGODB_URL, {
    dbName: process.env.MONGODB_DB,
  })
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log("✅ Server started")
    );
  })
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));
