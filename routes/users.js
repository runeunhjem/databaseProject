const express = require("express");
const router = express.Router();
const db = require("../models");
const UserService = require("../services/UserService");
const bodyParser = require("body-parser");

// ✅ Import middleware functions
const { canSeeUserList, canSeeUserDetails, checkIfAuthorized, checkIfAdmin } = require("./authMiddleware");

const jsonParser = bodyParser.json();
const userService = new UserService(db);

/* ✅ GET all users (Only for Admins) */
router.get("/", canSeeUserList, async function (req, res, next) {
  /* #swagger.tags = ['Users']
     #swagger.description = "Retrieve a list of all users (Admin access required)."
     #swagger.path = "/users"
     #swagger.produces = ["text/html"]
     #swagger.responses[200] = {
        description: "Successfully retrieved users list.",
        content: {
          "text/html": {
            schema: {
              title: "Users",
              users: [
                { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", role: "User" },
                { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "Admin" }
              ]
            }
          }
        }
     }
     #swagger.responses[500] = { description: "Internal server error - Unable to fetch users." }
  */
  try {
    const users = await userService.getAll();
    res.render("users", { title: "Users", cssFile: "users", users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).send("Error fetching users.");
  }
});

/* ✅ GET user details (Only for Admins or the user themselves) */
router.get("/:userId", canSeeUserDetails, async function (req, res, next) {
  /* #swagger.tags = ['Users']
     #swagger.description = "Retrieve details of a specific user (Admin or the user themselves)."
     #swagger.path = "/users/{userId}"
     #swagger.produces = ["text/html"]
     #swagger.parameters['userId'] = {
        in: "path",
        description: "User ID",
        required: true,
        type: "integer"
     }
     #swagger.responses[200] = {
        description: "Successfully retrieved user details.",
        content: {
          "text/html": {
            schema: {
              title: "User Details",
              user: {
                id: 1,
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                role: "User"
              }
            }
          }
        }
     }
     #swagger.responses[404] = {
        description: "User not found.",
        content: { "text/html": { schema: { title: "Error", message: "User Not Found" } } }
     }
     #swagger.responses[500] = {
        description: "Internal server error - Failed to retrieve user details.",
        content: { "text/html": { schema: { title: "Error", message: "Internal Server Error" } } }
     }
  */
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

/* ✅ DELETE a user (Only Admins can delete) */
router.delete("/:id", checkIfAdmin, async (req, res) => {
  /* #swagger.tags = ['Users']
     #swagger.description = "Delete a user (Admin access required)."
     #swagger.path = "/users/{id}"
     #swagger.parameters['id'] = {
        in: "path",
        description: "User ID",
        required: true,
        type: "integer"
     }
     #swagger.responses[200] = {
        description: "User deleted successfully.",
        content: { "application/json": { schema: { message: "✅ User deleted successfully!" } } }
     }
     #swagger.responses[400] = {
        description: "User ID is required.",
        content: { "application/json": { schema: { message: "User ID is required." } } }
     }
     #swagger.responses[403] = {
        description: "Admins cannot be deleted.",
        content: { "application/json": { schema: { message: "Admins cannot be deleted!" } } }
     }
     #swagger.responses[404] = {
        description: "User not found.",
        content: { "application/json": { schema: { message: "User not found." } } }
     }
     #swagger.responses[500] = {
        description: "Internal server error - Failed to delete user.",
        content: { "application/json": { schema: { message: "Failed to delete user." } } }
     }
  */
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

