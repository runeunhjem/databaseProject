const express = require("express");
const router = express.Router();
const HotelService = require("../services/HotelService");
const db = require("../models");
const bodyParser = require("body-parser");
const { checkIfAuthorized, checkIfAdmin } = require("./authMiddleware");
const RoomService = require("../services/RoomService");

const jsonParser = bodyParser.json();
const hotelService = new HotelService(db);
const roomService = new RoomService(db); // ✅ Initialize it using the database

// ✅ GET all hotels OR search hotels by location
router.get("/", async function (req, res) {
  try {
    const { location } = req.query;
    let hotels = location ? await hotelService.searchByLocation(location) : await hotelService.get();

    // Ensure avgRating is properly formatted
    hotels = hotels.map((hotel) => ({
      ...hotel,
      avgRating: hotel.avgRating !== null ? parseFloat(hotel.avgRating).toFixed(1) : "No ratings yet",
    }));

    if (req.xhr) {
      return res.json(hotels); // ✅ AJAX response for live search
    }

    res.render("hotels", { title: "Hotels", cssFile: "hotels", hotels });
  } catch (error) {
    console.error("❌ Error fetching hotels:", error);
    res.status(500).send("Error fetching hotels.");
  }
});

// ✅ GET hotel details
router.get("/:hotelId", async function (req, res) {
  try {
    const userId = req.user?.id ?? 0;
    const hotel = await hotelService.getHotelDetails(req.params.hotelId, userId);

    if (!hotel) {
      return res.status(404).render("error", {
        title: "Hotel Not Found",
        status: 404,
        message: "Hotel Not Found",
        details: `The hotel with ID ${req.params.hotelId} does not exist.`,
      });
    }

    res.render("hotelDetails", { title: hotel.name, cssFile: "hotelDetails", hotel });
  } catch (error) {
    console.error("❌ Error fetching hotel details:", error);
    res.status(500).render("error", {
      title: "Internal Server Error",
      status: 500,
      message: "An error occurred while retrieving the hotel.",
    });
  }
});

// ✅ POST create a new hotel (Only Admins)
router.post("/", checkIfAuthorized, checkIfAdmin, jsonParser, async function (req, res) {
  try {
    const { name, location, rooms } = req.body;
    if (!name || !location || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ message: "Hotel name, location, and at least one room type are required!" });
    }

    await hotelService.create(name, location, rooms);
    res.status(201).json({ message: "Hotel and rooms created successfully!" });
  } catch (error) {
    console.error("❌ Error creating hotel and rooms:", error);
    res.status(500).json({ message: "Error creating hotel and rooms." });
  }
});

// ✅ DELETE a hotel (Only Admins)
router.delete("/", checkIfAuthorized, checkIfAdmin, jsonParser, async function (req, res) {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Hotel ID is required." });

    console.log("Deleting hotel with ID:", id);
    const hotelExists = await db.Hotel.findOne({ where: { id } });

    if (!hotelExists) return res.status(404).json({ message: "Hotel not found." });

    await db.Hotel.destroy({ where: { id } });
    res.json({ message: "✅ Hotel deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting hotel:", error);
    res.status(500).json({ message: "Failed to delete hotel." });
  }
});

// ✅ GET all reservations for a specific hotel
router.get("/:hotelId/reservations", async (req, res) => {
  try {
    const { hotelId } = req.params;
    const reservations = await roomService.getReservationsByHotel(hotelId);

    res.render("hotelReservations", {
      title: "Hotel Reservations",
      cssFile: "hotelReservations",
      reservations,
      message: reservations.length ? null : "No reservations found for this hotel.",
    });
  } catch (error) {
    console.error("❌ Error fetching hotel reservations:", error);
    res.status(500).render("error", { message: "Error fetching hotel reservations." });
  }
});

// ✅ GET all rooms for a specific hotel
router.get("/:hotelId/rooms", async function (req, res) {
  try {
    const userId = req.user?.id ?? 0;
    const hotelId = req.params.hotelId;

    const hotel = await hotelService.getHotelDetails(hotelId, userId);
    if (!hotel) {
      return res.status(404).render("error", { message: "Hotel not found" });
    }

    const rooms = await roomService.getHotelRooms(hotelId, userId);

    res.render("hotelRooms", {
      title: `${hotel.name} - Rooms`,
      cssFile: "hotelRooms",
      hotel,
      rooms,
    });
  } catch (error) {
    console.error("❌ Error fetching hotel rooms:", error);
    res.status(500).render("error", { message: "Failed to retrieve rooms." });
  }
});

// ✅ POST Rate a Hotel
router.post("/:hotelId/rate", checkIfAuthorized, async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { rating } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "You must be logged in to rate a hotel." });
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Invalid rating. Please provide a rating between 1 and 5." });

    await hotelService.makeARate(userId, hotelId, rating);
    res.status(200).json({ message: "✅ Hotel rated successfully!" });
  } catch (error) {
    console.error("❌ Error rating hotel:", error);
    res.status(500).json({ message: "Failed to rate hotel." });
  }
});

module.exports = router;
