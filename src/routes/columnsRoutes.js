const express = require("express");
const router = express.Router();
const userJWT = require("../middlewares/authMiddleware");
const Column = require("../models/Column");
const Card = require("../models/Card");

router.get("/getBoardColumnsAndCards", userJWT, async (req, res) => {
  try {
    const { boardId } = req.query;
    const columns = await Column.find({ boardId });
    const cards = await Card.find({ boardId });

    res.json({ status: true, columns, cards });
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

router.put("/updateColumn/:id", userJWT, async (req, res) => {
  try {
    const { title } = req.body;
    const columnId = req.params.id;

    const column = await Column.findById(columnId);
    if (!column) {
      return res
        .status(404)
        .json({ status: false, message: "Column not found" });
    }

    const duplicate = await Column.findOne({
      boardId: column.boardId,
      title: title.trim(),
      _id: { $ne: columnId },
    });

    if (duplicate) {
      return res.status(400).json({
        status: false,
        message: "A column with this name already exists in the board!",
      });
    }

    const updatedColumn = await Column.findByIdAndUpdate(
      columnId,
      { title: title.trim() },
      { new: true }
    );

    res.json({
      status: true,
      message: "Column updated successfully",
      column: updatedColumn,
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
  const { columnId } = req.body;

  const session = await Column.startSession();
  session.startTransaction();

  try {
    await Column.findByIdAndDelete(columnId, { session });

    await Card.deleteMany({ columnId }, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ status: true, message: "The column has been removed." });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/reorder", userJWT, async (req, res) => {
  try {
    const { columns, boardId } = req.body;
    if (!Array.isArray(columns)) return res.status(400).send("Invalid payload");

    const columnsUpdateOrder = columns.map((c) => ({
      updateOne: {
        filter: { _id: c._id },
        update: { $set: { order: c.order } },
      },
    }));

    if (columnsUpdateOrder.length) {
      await Column.bulkWrite(columnsUpdateOrder);
    }

    const updatedColumns = await Column.find({ boardId }).sort({
      order: 1,
    });

    // console.log("!!!!!!!!!", updatedColumns);

    res.json({
      ok: true,
      columns: updatedColumns,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
