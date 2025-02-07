const express = require("express");
const router = express.Router();
const UserService = require("../services/UserService");
const db = require("../models");

const userService = new UserService(db);

// ✅ GET user details along with reservations
router.get("/:userId", async function (req, res, next) {
  try {
    const user = await userService.getOne(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.render("userDetails", { user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Error fetching user details.");
  }
});

module.exports = router;

