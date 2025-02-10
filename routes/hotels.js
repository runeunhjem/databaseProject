const express = require("express");
const router = express.Router();
const HotelService = require("../services/HotelService");
const db = require("../models");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const hotelService = new HotelService(db);

// ✅ GET all hotels
router.get("/", async function (req, res, next) {
  try {
    const hotels = await hotelService.get();
    res.render("hotels", { title: "Hotels", cssFile: "hotels", hotels });
  } catch (error) {
    res.status(500).send("Error fetching hotels.");
  }
});

// ✅ GET hotel details
router.get("/:hotelId", async function (req, res, next) {
  try {
    const userId = 1; // Static user ID (Replace with actual logged-in user ID if needed)
    const hotel = await hotelService.getHotelDetails(req.params.hotelId, userId);

    if (!hotel) {
      return res.status(404).send("Hotel not found");
    }

    res.render("hotelDetails", { title: hotel.name, cssFile: "hotelDetails", hotel });
  } catch (error) {
    res.status(500).send("Error fetching hotel details.");
  }
});



// ✅ POST create a new hotel with room types
router.post("/", jsonParser, async function (req, res, next) {
  try {
    let { name, location, rooms } = req.body;

    if (!name || !location || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ message: "Hotel name, location, and at least one room type are required!" });
    }

    // ✅ Use db.sequelize instead of sequelize
    const [hotelResult, metadata] = await db.sequelize.query(
      "INSERT INTO Hotels (name, location) VALUES (:name, :location)",
      { replacements: { name, location } }
    );

    // ✅ Get the newly created hotel ID
    const hotelId = metadata.insertId || hotelResult; // Some MySQL versions return `metadata.insertId`

    // ✅ Insert rooms for this hotel
    for (const room of rooms) {
      await db.sequelize.query(
        "INSERT INTO Rooms (hotel_id, capacity, price) VALUES (:hotelId, :capacity, :price)",
        { replacements: { hotelId, capacity: room.capacity, price: room.price } }
      );
    }

    res.status(201).json({ message: "Hotel and rooms created successfully!" });
  } catch (error) {
    console.error("Error creating hotel and rooms:", error);
    res.status(500).json({ message: "Error creating hotel and rooms." });
  }
});


// ✅ DELETE remove a hotel
router.delete("/", jsonParser, async function (req, res, next) {
  try {
    let id = req.body.id;
    await hotelService.deleteHotel(id);
    res.send("Hotel deleted successfully.");
  } catch (error) {
    res.status(500).send("Error deleting hotel.");
  }
});

// ✅ POST rate a hotel
router.post("/:hotelId/rate", jsonParser, async function (req, res, next) {
  try {
    const { value } = req.body;
    if (value < 1 || value > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    await hotelService.makeARate(1, req.params.hotelId, value);
    res.json({ message: "Rating submitted successfully!" });
  } catch (error) {
    res.status(500).send("Error rating hotel.");
  }
});

module.exports = router;
