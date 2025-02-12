const express = require("express");
const router = express.Router();
const RoomService = require("../services/RoomService");
const db = require("../models");
const bodyParser = require("body-parser");
const { checkIfAuthorized, checkIfAdmin } = require("./authMiddleware");

const jsonParser = bodyParser.json();
const roomService = new RoomService(db);

// ✅ GET all rooms (Accessible to everyone)
router.get("/", async function (req, res, next) {
  try {
    const userId = req.user ? req.user.id : null; // ✅ Ensure userId is correctly passed
    const rooms = await roomService.getAllRooms(userId);
    console.log("Fetching rooms for user ID:", userId);
    res.render("rooms", { title: "Rooms", cssFile: "rooms", rooms });
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).send("Error fetching rooms.");
  }
});


// ✅ GET rooms for a specific hotel (Accessible to everyone)
router.get("/:hotelId", async function (req, res, next) {
  try {
    const rooms = await roomService.getHotelRooms(req.params.hotelId);
    res.render("rooms", { title: "Rooms", cssFile: "rooms", rooms });
  } catch (error) {
    res.status(500).send("Error fetching rooms.");
  }
});

// ✅ POST create a new room (Only Admins)
router.post("/add", checkIfAdmin, jsonParser, async function (req, res, next) {
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

// ✅ DELETE remove a room (Only Admins)
router.delete("/", checkIfAdmin, jsonParser, async function (req, res, next) {
  let id = req.body.id;
  await roomService.deleteRoom(id);
  res.end();
});

// ✅ POST rent a room (Only Users & Admins)
router.post("/reservation", checkIfAuthorized, jsonParser, async function (req, res, next) {
  let userId = req.user.id;
  let roomId = req.body.roomId;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  const result = await roomService.rentARoom(userId, roomId, startDate, endDate);

  if (result.success) {
    res.json({ success: true, message: result.message });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

module.exports = router;
