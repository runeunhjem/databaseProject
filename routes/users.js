const express = require("express");
const router = express.Router();
const db = require("../models");
const UserService = require("../services/UserService");
const { canSeeUserDetails } = require("./authMiddleware");

const userService = new UserService(db);

// ✅ GET user details (Only for Admins or the user themselves)
router.get("/:userId", canSeeUserDetails, async function (req, res, next) {
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

