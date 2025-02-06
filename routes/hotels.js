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

module.exports = router;
