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
    res.render("hotels", { title: "Hotels", hotels });
  } catch (error) {
    res.status(500).send("Error fetching hotels.");
  }
});

// ✅ GET hotel details
router.get("/:hotelId", async function (req, res, next) {
  try {
    const hotel = await hotelService.getHotelDetails(req.params.hotelId);
    if (!hotel) {
      return res.status(404).send("Hotel not found");
    }
    res.render("hotelDetails", { hotel });
  } catch (error) {
    res.status(500).send("Error fetching hotel details.");
  }
});

// ✅ POST create a new hotel
router.post("/", jsonParser, async function (req, res, next) {
  try {
    let name = req.body.name;
    let location = req.body.location;
    await hotelService.create(name, location);
    res.status(201).send("Hotel created successfully.");
  } catch (error) {
    res.status(500).send("Error creating hotel.");
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
