const express = require("express");
const router = express.Router();
const userJWT = require("../middlewares/authMiddleware");
const Client = require("../models/Client");

// router.patch("/updateTheme", userJWT, async (req, res) => {
//   try {
//     const { theme } = req.body;
//     const userId = req.user.id;

//     const updatedUser = await Client.findByIdAndUpdate(
//       userId,
//       { $set: { theme } },
//       { new: true }
//     );

//     res.status(200).json({
//       status: true,
//       message: "Theme updated successfully",
//       user: updatedUser,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: err.message, status: false });
//   }
// });

module.exports = router;
