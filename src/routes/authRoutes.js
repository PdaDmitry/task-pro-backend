const express = require("express");
const router = express.Router();
const User = require("../models/Client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userJWT = require("../middlewares/authMiddleware");
const Client = require("../models/Client");
const upload = require("../utils/upload");
// const fs = require("fs");
const fs = require("fs").promises;
const path = require("path");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await Client.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Client({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Client.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Successful login",
      token,
      user: {
        name: user.name,
        email: user.email,
        theme: user.theme,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/updateTheme", userJWT, async (req, res) => {
  try {
    const { theme } = req.body;
    const userId = req.user.id;

    const updatedUser = await Client.findByIdAndUpdate(
      userId,
      { $set: { theme } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: true,
      message: "Theme updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message, status: false });
  }
});

router.patch(
  "/updateUserProfile",
  userJWT,
  upload.single("photo"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email, password } = req.body;

      const user = await Client.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", status: false });
      }

      const updateData = {};

      if (name) updateData.name = name;
      if (email) {
        const existingUser = await Client.findOne({
          email,
          _id: { $ne: userId },
        });
        if (existingUser) {
          return res
            .status(400)
            .json({ message: "A user with this email already exists" });
        }
        updateData.email = email;
      }
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      if (req.file) {
        if (user.photo) {
          const oldPhotoPath = path.join(process.cwd(), user.photo);
          try {
            await fs.unlink(oldPhotoPath);
            console.log("Old photo deleted:", oldPhotoPath);
          } catch (err) {
            if (err.code !== "ENOENT")
              console.log("Error deleting old photo:", err);
          }
        }

        updateData.photo = `/uploads/users/${req.file.filename}`;
      }

      const updatedUser = await Client.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );

      res.status(200).json({
        status: true,
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.log(err);
      res.status(err.code ?? 500).json({ error: err.message, status: false });
    }
  }
);

router.patch("/removeUserPhoto", userJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Client.findById(userId);
    if (!user)
      return res.status(404).json({ status: false, message: "User not found" });

    if (user.photo) {
      try {
        const filePath = path.join(process.cwd(), user.photo);
        await fs.unlink(filePath);
        console.log("Deleted old photo:", filePath);
      } catch (err) {
        if (err.code !== "ENOENT") console.error("Error deleting photo:", err);
      }
    }

    user.photo = "";
    await user.save();

    res.status(200).json({ status: true, message: "Photo removed", user });
  } catch (err) {
    console.log(err);
    res.status(err.code ?? 500).json({ error: err.message, status: false });
  }
});

module.exports = router;
