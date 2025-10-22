const express = require("express");
const router = express.Router();
const userJWT = require("../middlewares/authMiddleware");
const Card = require("../models/Card");

router.post("/createCard", userJWT, async (req, res) => {
  try {
    const { title, description, priority, deadline, boardId, columnId, order } =
      req.body;

    if (!title || !columnId) {
      return res.status(400).json({
        status: false,
        message: "Title and columnId are required",
      });
    }

    const normalizedTitle = title.toLowerCase();

    const columnCards = await Card.find({ columnId });

    const duplicateCard = columnCards.find(
      (card) => card.title.toLowerCase() === normalizedTitle
    );

    if (duplicateCard) {
      return res.status(400).json({
        status: false,
        message: "A card with this title already exists in this column!",
      });
    }

    const newCard = new Card({
      title,
      description,
      priority,
      deadline,
      boardId,
      columnId,
      order,
    });

    await newCard.save();

    res.status(201).json({
      status: true,
      message: "The card has been created successfully.",
      card: {
        _id: newCard._id,
        title: newCard.title,
        description: newCard.description,
        priority: newCard.priority,
        deadline: newCard.deadline,
        boardId: newCard.boardId,
        columnId: newCard.columnId,
        order: newCard.order,
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

module.exports = router;
