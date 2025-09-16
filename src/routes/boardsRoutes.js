const express = require("express");
const router = express.Router();
const userJWT = require("../middlewares/authMiddleware");
const Board = require("../models/Board");

router.post("/createBoard", userJWT, async (req, res) => {
  try {
    const { title, icon, background } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const newBoard = new Board({
      title,
      icon,
      background,
      userId,
      columns: [],
    });

    await newBoard.save();

    res.status(201).json({
      status: true,
      message: "Board created successfully",
      board: {
        _id: newBoard._id,
        title: newBoard.title,
        icon: newBoard.icon,
        background: newBoard.background,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
