const express = require("express");
const passport = require("passport");
const UserService = require("../services/UserService");
const db = require("../models");
const router = express.Router();
const userService = new UserService(db);

// ✅ Render Signup Page
router.get("/signup", (req, res) => {
  /* #swagger.tags = ['Authentication']
     #swagger.description = "Render the signup page."
     #swagger.produces = ["text/html"]
     #swagger.responses[200] = {
        description: "Signup page rendered successfully.",
        content: { "text/html": {} }
     }
  */
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
  /* #swagger.tags = ['Authentication']
     #swagger.description = "Render the login page."
     #swagger.produces = ["text/html"]
     #swagger.responses[200] = {
        description: "Login page rendered successfully.",
        content: { "text/html": {} }
     }
  */
  const username = req.user ? req.user.firstName : null;
  res.render("login", { title: "Login", cssFile: "login", username });
});

// ✅ Handle Signup Submission with Auto-login
router.post("/signup", async (req, res, next) => {
  /* #swagger.tags = ['Authentication']
     #swagger.description = "User signup and auto-login."
     #swagger.consumes = ["application/json"]
     #swagger.parameters['body'] = {
        in: 'body',
        description: 'User registration details',
        required: true,
        schema: { $ref: "#/definitions/User" }
     }
     #swagger.responses[201] = {
        description: "User created successfully and logged in.",
        content: { "application/json": { schema: { message: "User created successfully and logged in." } } }
     }
     #swagger.responses[400] = { description: "Validation error - Missing required fields or username taken." }
     #swagger.responses[500] = { description: "Internal server error during signup." }
  */
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
    successRedirect: "/start",
    failureRedirect: "/auth/login",
    failureFlash: true,
  })
  /* #swagger.tags = ['Authentication']
     #swagger.description = "User login using local authentication strategy."
     #swagger.consumes = ["application/json"]
     #swagger.parameters['body'] = {
        in: 'body',
        description: 'User login credentials',
        required: true,
        schema: { $ref: "#/definitions/User" }
     }
     #swagger.responses[200] = {
        description: "User logged in successfully.",
        content: { "application/json": { schema: { message: "User logged in successfully." } } }
     }
     #swagger.responses[401] = { description: "Invalid credentials." }
  */
);

// ✅ Handle Logout (GET)
router.get("/logout", (req, res, next) => {
  /* #swagger.tags = ['Authentication']
     #swagger.description = "User logout and session termination."
     #swagger.produces = ["text/html"]
     #swagger.responses[200] = {
        description: "User logged out successfully.",
        content: { "text/html": {} }
     }
  */
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login");
  });
});

// ✅ Handle Logout (POST)
router.post("/logout", (req, res, next) => {
  /* #swagger.tags = ['Authentication']
     #swagger.description = "Logout endpoint using POST request."
     #swagger.consumes = ["application/json"]
     #swagger.responses[200] = {
        description: "User logged out successfully.",
        content: { "application/json": { schema: { message: "User logged out successfully." } } }
     }
  */
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.json({ message: "User logged out successfully." });
    });
  });
});

// ✅ Admin Access Route
router.get("/admin", (req, res) => {
  /* #swagger.tags = ['Authentication']
     #swagger.description = "Admin access verification."
     #swagger.produces = ["text/html"]
     #swagger.responses[200] = {
        description: "Welcome Admin.",
        content: { "text/html": {} }
     }
     #swagger.responses[403] = { description: "Access Denied - Only Admins Allowed." }
  */
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).send("Access Denied!");
  }
  res.send("Welcome, Admin!");
});

module.exports = router;
