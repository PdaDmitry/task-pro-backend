const { ObjectId } = require("mongodb");

const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "",
    },
    background: {
      type: String,
      default: "",
    },
    userId: {
      type: ObjectId,
      ref: "client",
    },
    columns: {
      type: Array,
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const Board = mongoose.model("board", boardSchema);

module.exports = Board;
