const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    boardId: {
      type: ObjectId,
      ref: "Board",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const Column = mongoose.model("column", columnSchema);

module.exports = Column;
