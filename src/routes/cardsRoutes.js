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

    const boardCards = await Card.find({ boardId });

    const duplicateCard = boardCards.find(
      (card) => card.title.toLowerCase() === normalizedTitle
    );

    if (duplicateCard) {
      return res.status(400).json({
        status: false,
        message: "A card with this title already exists in this board!",
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

router.put("/updateCard/:id", userJWT, async (req, res) => {
  try {
    const { title, description, priority, deadline } = req.body;
    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ status: false, message: "Card not found" });
    }

    const duplicateCard = await Card.findOne({
      boardId: card.boardId,
      title: title.trim(),
      _id: { $ne: cardId },
    });

    if (duplicateCard) {
      return res.status(400).json({
        status: false,
        message: "A card with this title already exists in this board!",
      });
    }

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { title: title.trim(), description, priority, deadline },
      { new: true }
    );

    res.json({
      status: true,
      message: "The card has been updated successfully.",
      card: updatedCard,
    });
  } catch (error) {
    console.error(error);
    res.status(error.code ?? 500).json({
      status: false,
      message: "Server error. Try again later...",
    });
  }
});

router.delete("/deleteCard", userJWT, async (req, res) => {
  const { cardId } = req.body;

  try {
    await Card.findByIdAndDelete(cardId);

    res.json({ status: true, message: "The card has been removed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
