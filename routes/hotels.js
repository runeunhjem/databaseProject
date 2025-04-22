const express = require("express");
const router = express.Router();
const HotelService = require("../services/HotelService");
const db = require("../models");
const bodyParser = require("body-parser");
const { checkIfAuthorized, checkIfAdmin } = require("./authMiddleware");
const RoomService = require("../services/RoomService");
const cache = require("../middleware/caching.js");
const client = require("../redis.js");
const { invalidateHotelCache } = require("../utils/cacheInvalidation");

const jsonParser = bodyParser.json();
const hotelService = new HotelService(db);
const roomService = new RoomService(db); // ✅ Initialize it using the database

// ✅ GET all hotels OR search hotels by location
router.get("/", cache, async function (req, res) {
  /* #swagger.tags = ['Hotels']
     #swagger.description = "Retrieve a list of all hotels or filter by location."
     #swagger.produces = ["text/html"]
     #swagger.parameters['location'] = {
        in: 'query',
        description: 'Optional location filter',
        required: false,
        type: 'string'
     }
     #swagger.responses[200] = {
        description: "List of hotels retrieved successfully.",
        content: { "text/html": {} }
     }
  */
  try {
    const { location } = req.query;
    let hotels = location ? await hotelService.searchByLocation(location) : await hotelService.get();

    hotels = hotels.map((hotel) => ({
      ...hotel,
      avgRating: hotel.avgRating !== null ? parseFloat(hotel.avgRating).toFixed(1) : "No ratings yet",
    }));

    // 💾 Save to Redis cache
    await client.set(req.originalUrl, JSON.stringify(hotels), {
      EX: 300, // Expire in 5 minutes
    });

    if (req.xhr) {
      return res.json(hotels);
    }

    res.render("hotels", { title: "Hotels", cssFile: "hotels", hotels });
  } catch (error) {
    console.error("❌ Error fetching hotels:", error);
    res.status(500).send("Error fetching hotels.");
  }
});

// ✅ GET all rooms for a specific hotel
router.get("/:hotelId/rooms", cache, async function (req, res) {
  /* #swagger.tags = ['Hotels']
     #swagger.description = "Retrieve all rooms available for a specific hotel."
     #swagger.produces = ["text/html"]
     #swagger.parameters['hotelId'] = {
        in: 'path',
        description: 'ID of the hotel',
        required: true,
        type: 'integer'
     }
     #swagger.responses[200] = {
        description: "Rooms retrieved successfully.",
        content: { "text/html": {} }
     }
     #swagger.responses[404] = {
        description: "Hotel not found or has no rooms.",
        content: { "text/html": { schema: { title: "Error", message: "Hotel Not Found" } } }
     }
     #swagger.responses[500] = {
        description: "Internal server error.",
        content: { "text/html": { schema: { title: "Error", message: "Internal Server Error" } } }
     }
  */
  try {
    const { hotelId } = req.params;
    const userId = req.user ? req.user.id : null; // ✅ Get user ID if logged in

    // ✅ Find the hotel
    const hotel = await db.Hotel.findOne({ where: { id: hotelId } });
    if (!hotel) {
      return res.status(404).render("error", {
        title: "Hotel Not Found",
        status: 404,
        message: "Hotel Not Found",
        details: `No hotel found with ID ${hotelId}.`,
      });
    }

    // ✅ Fetch rooms correctly with room_type and max_capacity
    const rooms = await roomService.getHotelRooms(hotelId, userId);
    console.log("📌 Debug: Rooms fetched for hotelRooms.ejs", JSON.stringify(rooms, null, 2));

    // 💾 Save to Redis
    await client.set(req.originalUrl, JSON.stringify({ hotel, rooms }), { EX: 300 });

    res.render("hotelRooms", {
      title: `${hotel.name} - Rooms`,
      cssFile: "hotelRooms",
      hotel,
      rooms,
    });
  } catch (error) {
    console.error("❌ Error fetching rooms for hotel:", error);
    res.status(500).render("error", {
      title: "Internal Server Error",
      status: 500,
      message: "An error occurred while fetching rooms for the hotel.",
    });
  }
});

// ✅ GET hotel details
router.get("/:hotelId", cache, async function (req, res) {
  /* #swagger.tags = ['Hotels']
     #swagger.description = "Retrieve details of a specific hotel."
     #swagger.produces = ["text/html"]
     #swagger.parameters['hotelId'] = {
        in: 'path',
        description: 'ID of the hotel',
        required: true,
        type: 'integer'
     }
     #swagger.responses[200] = {
        description: "Hotel details retrieved successfully.",
        content: { "text/html": {} }
     }
     #swagger.responses[404] = { description: "Hotel not found." }
  */
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

    // 💾 Cache the hotel details
    await client.set(req.originalUrl, JSON.stringify(hotel), { EX: 300 });

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
  /* #swagger.tags = ['Hotels']
     #swagger.description = "Creates a new hotel with rooms. Admin access only."
     #swagger.path = "/hotels"
     #swagger.parameters['body'] = {
        in: 'body',
        description: 'Hotel details including name, location, and rooms',
        required: true,
        schema: { $ref: "#/definitions/Hotel" }
     }
     #swagger.responses[201] = {
        description: "Hotel and rooms created successfully.",
        content: { "application/json": {} }
     }
     #swagger.responses[400] = { description: "Missing required fields." }
  */
  try {
    const { name, location, rooms } = req.body;
    if (!name || !location || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ message: "Hotel name, location, and at least one room type are required!" });
    }

    await hotelService.create(name, location, rooms);

    // Invalidate all hotel list cache
    await client.del("/hotels");

    res.status(201).json({ message: "Hotel and rooms created successfully!" });
  } catch (error) {
    console.error("❌ Error creating hotel and rooms:", error);
    res.status(500).json({ message: "Error creating hotel and rooms." });
  }
});

// ✅ DELETE a hotel (Only Admins)
router.delete("/", checkIfAuthorized, checkIfAdmin, jsonParser, async function (req, res) {
  /* #swagger.tags = ['Hotels']
     #swagger.description = "Delete a hotel by ID. Admin access only."
     #swagger.parameters['body'] = {
        in: 'body',
        description: 'Hotel ID to delete',
        required: true,
        schema: { id: 1 }
     }
     #swagger.responses[200] = {
        description: "Hotel deleted successfully.",
        content: { "application/json": {} }
     }
     #swagger.responses[404] = { description: "Hotel not found." }
  */
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Hotel ID is required." });

    const hotelExists = await db.Hotel.findOne({ where: { id } });

    if (!hotelExists) return res.status(404).json({ message: "Hotel not found." });

    await db.Hotel.destroy({ where: { id } });

    // Clean up cached hotel + room details
    await invalidateHotelCache(id);

    res.json({ message: "✅ Hotel deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting hotel:", error);
    res.status(500).json({ message: "Failed to delete hotel." });
  }
});

// ✅ GET all reservations for a specific hotel
router.get("/:hotelId/reservations", async (req, res) => {
  /* #swagger.tags = ['Hotels']
     #swagger.description = "Retrieve all reservations for a specific hotel."
     #swagger.produces = ["text/html"]
     #swagger.parameters['hotelId'] = {
        in: 'path',
        description: 'Hotel ID',
        required: true,
        type: 'integer'
     }
     #swagger.responses[200] = {
        description: "Reservations retrieved successfully.",
        content: { "text/html": {} }
     }
  */
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

// ✅ POST Rate a Hotel
router.post("/:hotelId/rate", checkIfAuthorized, async (req, res) => {
  /* #swagger.tags = ['Hotels']
     #swagger.description = "Allows a user to rate a hotel."
     #swagger.path = "/hotels/{hotelId}/rate"
     #swagger.parameters['hotelId'] = {
        in: 'path',
        description: 'ID of the hotel',
        required: true,
        type: 'integer'
     }
     #swagger.parameters['body'] = {
        in: 'body',
        description: 'Rating from 1 to 5',
        required: true,
        schema: { rating: 5 }
     }
     #swagger.responses[200] = {
        description: "Hotel rated successfully.",
        content: { "application/json": {} }
     }
     #swagger.responses[400] = { description: "Invalid rating." }
  */
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
