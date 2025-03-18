const express = require("express");
const router = express.Router();
const RoomService = require("../services/RoomService");
const db = require("../models");
const bodyParser = require("body-parser");
const { checkIfAuthorized, checkIfAdmin } = require("./authMiddleware");

const jsonParser = bodyParser.json();
const roomService = new RoomService(db);

/* ✅ GET all rooms (Accessible to everyone) */
router.get("/", async function (req, res, next) {
  /* #swagger.tags = ['Rooms']
     #swagger.description = "Retrieve a list of all available rooms."
     #swagger.produces = ["text/html"]
     #swagger.responses[200] = {
        description: "List of available rooms retrieved successfully.",
        content: { "text/html": {} }
     }
     #swagger.responses[500] = { description: "Internal server error - Failed to fetch rooms." }
  */
  try {
    const userId = req.user ? req.user.id : null;
    const rooms = await roomService.getAllRooms(userId);
    console.log("Fetching rooms for user ID:", userId);
    res.render("rooms", { title: "Rooms", cssFile: "rooms", rooms });
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).send("Error fetching rooms.");
  }
});

/* ✅ GET room details */
router.get("/:roomId", async function (req, res, next) {
  /* #swagger.tags = ['Rooms']
     #swagger.description = "Retrieve details of a specific room."
     #swagger.produces = ["text/html"]
     #swagger.parameters['roomId'] = {
        in: 'path',
        description: 'ID of the room to retrieve.',
        required: true,
        type: 'integer'
     }
     #swagger.responses[200] = {
        description: "Room details retrieved successfully.",
        content: { "text/html": {} }
     }
     #swagger.responses[404] = { description: "Room not found." }
     #swagger.responses[500] = { description: "Internal server error - Failed to fetch room details." }
  */
  try {
    const userId = req.user ? req.user.id : null;
    const room = await roomService.getRoomDetails(req.params.roomId, userId);

    if (!room) {
      return res.status(404).render("error", {
        title: "Room Not Found",
        status: 404,
        message: "Room Not Found",
        details: `The room with ID ${req.params.roomId} does not exist.`,
      });
    }

    res.render("roomDetails", { title: "Room Details", cssFile: "roomDetails", room });
  } catch (error) {
    console.error("❌ Error fetching room details:", error);
    res.status(500).render("error", {
      title: "Internal Server Error",
      status: 500,
      message: "An error occurred while fetching the room details.",
    });
  }
});

/* ✅ POST create a new room (Only Admins) */
router.post("/add", checkIfAuthorized, checkIfAdmin, jsonParser, async function (req, res, next) {
  /* #swagger.tags = ['Rooms']
     #swagger.description = "Create a new room (Admin Only)."
     #swagger.path = "/rooms/add"
     #swagger.consumes = ["application/json"]
     #swagger.parameters['body'] = {
        in: 'body',
        description: 'Room details to create.',
        required: true,
        schema: { $ref: "#/definitions/Room" }
     }
     #swagger.responses[201] = {
        description: "Room added successfully.",
        content: {
          "application/json": {
            schema: { message: "✅ Room added successfully!" }
          }
        }
     }
     #swagger.responses[400] = {
        description: "Bad request - Missing required fields.",
        content: {
          "application/json": {
            schema: { message: "❌ Capacity, price, and hotelId are required!" }
          }
        }
     }
     #swagger.responses[500] = {
        description: "Internal server error - Failed to add room.",
        content: {
          "application/json": {
            schema: { message: "❌ Internal server error." }
          }
        }
     }
  */
  try {
    const { capacity, price, hotelId } = req.body;

    if (!capacity || !price || !hotelId) {
      return res.status(400).json({ message: "❌ Capacity, price, and hotelId are required!" });
    }

    await roomService.create(capacity, price, hotelId);
    res.status(201).json({ message: "✅ Room added successfully!" });
  } catch (error) {
    console.error("❌ Error adding room:", error);
    res.status(500).json({ message: "❌ Internal server error." });
  }
});

/* ✅ DELETE remove a room (Only Admins) */
router.delete("/", checkIfAuthorized, checkIfAdmin, jsonParser, async function (req, res, next) {
  /* #swagger.tags = ['Rooms']
     #swagger.description = "Delete a room (Admin Only)."
     #swagger.consumes = ["application/json"]
     #swagger.parameters['body'] = {
        in: 'body',
        description: 'Room ID to delete.',
        required: true,
        schema: { id: 1 }
     }
     #swagger.responses[200] = {
        description: "Room deleted successfully.",
        content: { "application/json": {} }
     }
     #swagger.responses[400] = {
        description: "Bad request - Missing room ID.",
        content: { "application/json": {} }
     }
     #swagger.responses[500] = {
        description: "Internal server error - Failed to delete room.",
        content: { "application/json": {} }
     }
  */
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Room ID is required!" });

    await roomService.deleteRoom(id);
    res.json({ message: "✅ Room deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting room:", error);
    res.status(500).json({ message: "❌ Failed to delete room." });
  }
});

module.exports = router;
