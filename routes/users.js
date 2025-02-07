const express = require("express");
const router = express.Router();
const UserService = require("../services/UserService");
const db = require("../models");

const userService = new UserService(db);

// ✅ GET user details
router.get("/:userId", async function (req, res, next) {
  try {
    const user = await userService.getOne(req.params.userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("userDetails", { title: "User Details", cssFile: "userDetails", user });
  } catch (error) {
    res.status(500).send("Error fetching user details.");
  }
});

module.exports = router;

