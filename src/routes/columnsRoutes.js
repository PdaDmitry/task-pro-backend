const express = require("express");
const router = express.Router();
const userJWT = require("../middlewares/authMiddleware");
const Column = require("../models/Column");

router.get("/getBoardColumns", userJWT, async (req, res) => {
  try {
    const { boardId } = req.query;
    const columns = await Column.find({ boardId });

    res.json({ status: true, columns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/createColumn", userJWT, async (req, res) => {
  try {
    const { title, order, boardId } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ status: false, message: "Title is required" });
    }

    const normalizedTitle = title.toLowerCase();

    const boardColumns = await Column.find({ boardId });

    const duplicateNameCol = boardColumns.find(
      (col) => col.title.toLowerCase() === normalizedTitle
    );

    if (duplicateNameCol) {
      return res.status(400).json({
        status: false,
        message: "A column with this title already exists!",
      });
    }

    const newColumn = new Column({
      title,
      order,
      boardId,
    });

    await newColumn.save();

    res.status(201).json({
      status: true,
      message: "The column has been created successfully.",
      column: {
        _id: newColumn._id,
        title: newColumn.title,
        order: newColumn.order,
        boardId: newColumn.boardId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(error.code ?? 500).json({
      status: false,
      message: "Server error. Try again later...",
    });
  }
});

router.delete("/deleteColumn", userJWT, async (req, res) => {
  try {
    const { columnId } = req.body;

    await Column.findByIdAndDelete(columnId);

    res.json({ status: true, message: "The column has been removed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
