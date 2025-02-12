const express = require("express");
const passport = require("passport");
const UserService = require("../services/UserService");
const db = require("../models");
const router = express.Router();
const userService = new UserService(db);

// ✅ Render Signup Page
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up", cssFile: "signup" });
});

// ✅ Render Login Page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", cssFile: "login" });
});

// ✅ Handle Signup Submission
router.post("/signup", async (req, res) => {
  try {
    console.log("🔍 Received payload:", req.body);

    const { username, password, firstName, lastName, email } = req.body;

    if (!username || !password || !firstName || !lastName || !email) {
      return res.status(400).json({ message: "❌ All fields are required!" });
    }

    const userExists = await userService.findUserByUsername(username);
    if (userExists) {
      return res.status(400).json({ message: "❌ Username already taken." });
    }

    const result = await userService.createUser(username, password, firstName, lastName, email);

    if (result.success) {
      res.redirect("/auth/login");
    } else {
      res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "❌ Internal Server Error." });
  }
});

// ✅ Handle Login Submission
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
);

// ✅ Handle Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login");
  });
});

// ✅ Admin Route
router.get("/admin", (req, res) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).send("Access Denied!");
  }
  res.send("Welcome, Admin!");
});

module.exports = router;
