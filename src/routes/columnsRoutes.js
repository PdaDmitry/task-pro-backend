const express = require("express");
const router = express.Router();
const userJWT = require("../middlewares/authMiddleware");

router.post("/createColumn", userJWT, async (req, res) => {
  try {
    const { title, order, boardId } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ message: "Title required!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
