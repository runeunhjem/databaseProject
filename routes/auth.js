const express = require("express");
const passport = require("passport");
const UserService = require("../services/UserService");
const db = require("../models");
const router = express.Router();
const userService = new UserService(db);

// ✅ Render Signup Page (Fix: Pass messages properly)
router.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Sign Up",
    cssFile: "signup",
    messages: {
      success: req.flash("success") || null,
      error: req.flash("error") || null,
    },
  });
});

// ✅ Render Login Page
router.get("/login", (req, res) => {
  const username = req.user ? req.user.firstName : null; // ✅ Show first name if logged in
  res.render("login", { title: "Login", cssFile: "login", username });
});

// ✅ Handle Signup Submission with Auto-login
router.post("/signup", async (req, res, next) => {
  try {
    console.log("Received signup payload:", req.body);

    const { username, password, firstName, lastName, email } = req.body;
    if (!username || !password || !firstName || !lastName || !email) {
      req.flash("error", "❌ All fields are required!");
      return res.redirect("/auth/signup");
    }

    const userExists = await userService.findUserByUsername(username);
    if (userExists) {
      req.flash("error", "❌ Username is already taken.");
      return res.redirect("/auth/signup");
    }

    const result = await userService.createUser(username, password, firstName, lastName, email);
    if (!result.success) {
      req.flash("error", "❌ Failed to create an account.");
      return res.redirect("/auth/signup");
    }

    // ✅ Find the newly created user
    const newUser = await userService.findUserByUsername(username);
    if (!newUser) {
      req.flash("error", "❌ Signup successful, but failed to login.");
      return res.redirect("/auth/login");
    }

    // ✅ Auto-login the new user
    req.login(newUser, (err) => {
      if (err) {
        console.error("❌ Auto-login failed:", err);
        req.flash("error", "Signup successful, but login failed. Please login manually.");
        return res.redirect("/auth/login");
      }
      req.flash("success", "✅ Welcome! Your account was created successfully.");
      return res.redirect("/");
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    req.flash("error", "❌ An error occurred while signing up.");
    res.redirect("/auth/signup");
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
