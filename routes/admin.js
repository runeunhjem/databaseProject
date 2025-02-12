const express = require("express");
const router = express.Router();
const db = require("../models");
const UserService = require("../services/UserService");
const HotelService = require("../services/HotelService");
const RoomService = require("../services/RoomService");
const { checkIfAdmin } = require("./authMiddleware");

const userService = new UserService(db);
const hotelService = new HotelService(db);
const roomService = new RoomService(db);

// ✅ GET Admin Panel - Fetch all necessary data
router.get("/", checkIfAdmin, async (req, res) => {
  try {
    const users = await userService.getAll();
    const hotels = await hotelService.get();
    const reservations = await roomService.getAllReservations();

    res.render("admin", {
      title: "Admin Panel",
      cssFile: "admin",
      users,
      hotels,
      reservations,
    });
  } catch (error) {
    console.error("❌ Error fetching admin data:", error);
    res.status(500).send("Error loading admin panel.");
  }
});

module.exports = router;
