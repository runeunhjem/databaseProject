const express = require("express");
const router = express.Router();
const RoomService = require("../services/RoomService");
const db = require("../models");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const roomService = new RoomService(db);

// ✅ GET all rooms
router.get("/", async function (req, res, next) {
  try {
    const rooms = await roomService.get();
    res.render("rooms", { title: "Rooms", cssFile: "rooms", rooms });
  } catch (error) {
    res.status(500).send("Error fetching rooms.");
  }
});

// ✅ GET rooms for a specific hotel
router.get("/:hotelId", async function (req, res, next) {
  try {
    const rooms = await roomService.getHotelRooms(req.params.hotelId);
    res.render("rooms", { title: "Rooms", cssFile: "rooms", rooms });
  } catch (error) {
    res.status(500).send("Error fetching rooms.");
  }
});


// ✅ POST create a new room
router.post("/", jsonParser, async function (req, res, next) {
  let capacity = req.body.capacity;
  let pricePerDay = req.body.pricePerDay;
  let hotelId = req.body.hotelId;
  await roomService.create(capacity, pricePerDay, hotelId);
  res.end();
});

// ✅ DELETE remove a room
router.delete("/", jsonParser, async function (req, res, next) {
  let id = req.body.id;
  await roomService.deleteRoom(id);
  res.end();
});

// ✅ POST rent a room (reservation)
router.post("/reservation", jsonParser, async function (req, res, next) {
  let userId = req.body.userId;
  let roomId = req.body.roomId;
  let startDate = req.body.startDate;
  let endDate = req.body.endDate;

  console.log("Received reservation request:", { userId, roomId, startDate, endDate });

  const result = await roomService.rentARoom(userId, roomId, startDate, endDate);

  if (result.success) {
    res.json({ success: true, message: result.message });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});



module.exports = router;
