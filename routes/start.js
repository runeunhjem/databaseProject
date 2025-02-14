const express = require("express");
const router = express.Router();
const HotelService = require("../services/HotelService");
const db = require("../models");

const hotelService = new HotelService(db);

// ✅ GET /start - Show user details or best-rated hotel
router.get("/", async (req, res) => {
  try {
    const user = req.user; // Get logged-in user
    let bestHotel = null;

    if (!user) {
      // Get the highest-rated hotel
      const hotels = await hotelService.get();
      bestHotel = hotels.length > 0 ? hotels.sort((a, b) => b.avgRating - a.avgRating)[0] : null;
    }

    res.render("start", {
      title: "Welcome",
      cssFile: "start",
      user,
      bestHotel,
    });
  } catch (error) {
    console.error("❌ Error loading start page:", error);
    res.status(500).render("error", { message: "Failed to load start page." });
  }
});

module.exports = router;
