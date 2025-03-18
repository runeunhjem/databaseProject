const express = require("express");
const router = express.Router();
const HotelService = require("../services/HotelService");
const db = require("../models");

const hotelService = new HotelService(db);

/* ✅ GET /start - Show user details or best-rated hotel */
router.get("/", async (req, res) => {
  /* #swagger.tags = ['Start']
     #swagger.description = "Fetch the welcome page with user details or best-rated hotel."
     #swagger.path = "/start"
     #swagger.produces = ["text/html"]
     #swagger.responses[200] = {
        description: "Successfully retrieved welcome page.",
        content: {
          "text/html": {
            schema: {
              title: "Welcome",
              user: {
                id: 1,
                username: "john_doe",
                role: "User"
              },
              bestHotel: {
                id: 5,
                name: "Luxury Inn",
                avgRating: 4.8
              }
            }
          }
        }
     }
     #swagger.responses[500] = {
        description: "Internal server error - Failed to load start page.",
        content: { "text/html": { schema: { title: "Error", message: "Failed to load start page." } } }
     }
  */
  try {
    const user = req.user;
    let bestHotel = null;

    if (!user) {
      // ✅ Fetch all hotels and find the highest-rated one
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
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to load start page.",
    });
  }
});

module.exports = router;
