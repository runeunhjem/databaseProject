const express = require("express");
const router = express.Router();
const HotelService = require("../services/HotelService");
const db = require("../models");
const bodyParser = require("body-parser");
const { checkIfAuthorized, checkIfAdmin } = require("./authMiddleware");

const jsonParser = bodyParser.json();
const hotelService = new HotelService(db);

// ✅ GET all hotels (Accessible to everyone)
router.get("/", async function (req, res, next) {
  try {
    const hotels = await hotelService.get();
    res.render("hotels", { title: "Hotels", cssFile: "hotels", hotels });
  } catch (error) {
    res.status(500).send("Error fetching hotels.");
  }
});

// ✅ GET hotel details (Accessible to everyone)
router.get("/:hotelId", async function (req, res, next) {
  try {
    const userId = req.user?.id ?? 0;
    const hotel = await hotelService.getHotelDetails(req.params.hotelId, userId);

    if (!hotel) {
      return res.status(404).send("Hotel not found");
    }

    res.render("hotelDetails", { title: hotel.name, cssFile: "hotelDetails", hotel });
  } catch (error) {
    res.status(500).send("Error fetching hotel details.");
  }
});

// ✅ POST create a new hotel (Only Admins)
router.post("/", checkIfAuthorized, checkIfAdmin, jsonParser, async function (req, res, next) {
  try {
    let { name, location, rooms } = req.body;

    if (!name || !location || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ message: "Hotel name, location, and at least one room type are required!" });
    }

    await hotelService.create(name, location, rooms);
    res.status(201).json({ message: "Hotel and rooms created successfully!" });
  } catch (error) {
    console.error("Error creating hotel and rooms:", error);
    res.status(500).json({ message: "Error creating hotel and rooms." });
  }
});

// ✅ DELETE remove a hotel (Only Admins)
router.delete("/", checkIfAuthorized, checkIfAdmin, jsonParser, async function (req, res, next) {
  try {
    let id = req.body.id;
    await hotelService.deleteHotel(id);
    res.send("Hotel deleted successfully.");
  } catch (error) {
    res.status(500).send("Error deleting hotel.");
  }
});

module.exports = router;
