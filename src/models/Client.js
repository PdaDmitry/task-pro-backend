const { ObjectId } = require("mongodb");

const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    theme: {
      type: String,
      enum: ["Light", "Dark", "Violet"],
      default: "Light",
    },

    password: {
      type: String,
      required: true,
    },

    photo: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  { versionKey: false }
);

const Client = mongoose.model("client", clientSchema);

module.exports = Client;
