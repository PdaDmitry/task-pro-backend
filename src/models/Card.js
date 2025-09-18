const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "without"],
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    columnId: {
      type: ObjectId,
      ref: "Column",
    },
    boardId: {
      type: ObjectId,
      ref: "Board",
    },
    deadline: {
      type: Date,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const Card = mongoose.model("card", cardSchema);
module.exports = Card;
