const express = require("express");
const router = express.Router();
const User = require("../models/Client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userJWT = require("../middlewares/authMiddleware");
const Client = require("../models/Client");

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

router.patch("/updateUserProfile", userJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    if (!name && !email && !password) {
      return res.status(400).json({ message: "No data to update" });
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (email) {
      const existingUser = await Client.findOne({ email });

      if (existingUser && existingUser._id.toString() !== userId) {
        return res
          .status(400)
          .json({ message: "A user with this email already exists" });
      }

      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await Client.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(err.code ?? 500).json({ error: err.message, status: false });
  }
});

module.exports = router;
