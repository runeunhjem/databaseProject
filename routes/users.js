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

// ✅ DELETE a user (Only Admins can delete)
router.delete("/:id", checkIfAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await db.User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "Admin") {
      return res.status(403).json({ message: "Admins cannot be deleted!" });
    }

    await db.User.destroy({ where: { id: userId } });

    res.json({ message: "✅ User deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user." });
  }
});

module.exports = router;





