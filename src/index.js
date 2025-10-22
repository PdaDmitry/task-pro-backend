const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRoutes");
const usersRouter = require("./routes/usersRoutes");
const boardsRouter = require("./routes/boardsRoutes");
const columnsRouter = require("./routes/columnsRoutes");
const cardsRouter = require("./routes/cardsRoutes");

dotenv.config();
const app = express();

app.use(express.json());

// Settings CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://task-pro-front.vercel.app",
    ];

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/boards", boardsRouter);
app.use("/columns", columnsRouter);
app.use("/cards", cardsRouter);

mongoose
  .connect(process.env.MONGODB_URL, {
    dbName: process.env.MONGODB_DB,
  })
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log("✅ Server started on port", process.env.PORT || 5000)
    );
  })
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));
