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
  const username = req.user ? req.user.firstName : null; // ✅ Show first name if logged in
  res.render("login", { title: "Login", cssFile: "login", username });
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

// ✅ Handle Logout (POST Request)
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.redirect("/auth/login"); // ✅ Redirect to login after logout
    });
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
