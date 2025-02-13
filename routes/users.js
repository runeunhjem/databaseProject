const express = require("express");
const router = express.Router();
const db = require("../models");
const UserService = require("../services/UserService");
const bodyParser = require("body-parser");

// ✅ Import middleware functions
const { canSeeUserList, canSeeUserDetails, checkIfAuthorized, checkIfAdmin } = require("./authMiddleware");

const jsonParser = bodyParser.json();
const userService = new UserService(db);

// ✅ GET user details (Only for Admins or the user themselves)
router.get("/:userId", canSeeUserDetails, async function (req, res, next) {
  try {
    const user = await userService.getOne(req.params.userId);

    if (!user) {
      return res.status(404).render("error", {
        title: "User Not Found",
        status: 404,
        message: "User Not Found",
        details: "The requested user does not exist in our database.",
      });
    }

    res.render("userDetails", { title: "User Details", cssFile: "userDetails", user });
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
    res.status(500).render("error", {
      title: "Internal Error",
      status: 500,
      message: "An error occurred while retrieving the user.",
      details: "",
    });
  }
});

// ✅ GET all users (Only for Admins)
router.get("/", canSeeUserList, async function (req, res, next) {
  try {
    const users = await userService.getAll();
    res.render("users", { title: "Users", cssFile: "users", users });
  } catch (error) {
    res.status(500).send("Error fetching users.");
  }
});

// ✅ DELETE remove a user (Only Admins)
router.delete("/", checkIfAuthorized, checkIfAdmin, jsonParser, async function (req, res, next) {
  try {
    let id = req.body.id;
    await userService.deleteUser(id);
    res.send("User deleted successfully.");
  } catch (error) {
    res.status(500).send("Error deleting user.");
  }
});

module.exports = router;




