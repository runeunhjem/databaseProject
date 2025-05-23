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
  /* #swagger.tags = ['Admin']
     #swagger.description = "Retrieves all necessary data for the admin panel. Admin access only."
     #swagger.path = "/admin"
     #swagger.produces = ["text/html"]
     #swagger.responses[200] = {
        description: "Admin panel rendered successfully.",
        content: { "text/html": {} }
     }
     #swagger.responses[403] = {
        description: "Forbidden - Admin access required.",
        content: { "application/json": { schema: { message: "Forbidden - Admin access required." } } }
     }
     #swagger.responses[500] = {
        description: "Internal Server Error - Failed to load admin panel.",
        content: { "application/json": { schema: { message: "Failed to load the admin panel." } } }
     }
  */
  try {
    const users = await userService.getAll();
    const hotels = await hotelService.get();
    const reservations = await roomService.getAllReservations();

    // ✅ Fetch all rooms with hotel name included and sort by hotel name
    const rooms = await db.sequelize.query(
      `SELECT r.id, r.capacity, r.price,
              CASE
                WHEN r.capacity = 2 THEN 'Double Room'
                WHEN r.capacity = 4 THEN 'Family Room'
                WHEN r.capacity = 5 THEN 'Junior Suite'
                WHEN r.capacity > 5 THEN 'Suite'
                ELSE CONCAT('Room for ', r.capacity, ' people')
              END AS room_type,
              h.id AS hotel_id, h.name AS hotel_name
      FROM Rooms r
      JOIN Hotels h ON r.hotel_id = h.id
      ORDER BY h.name ASC, r.id ASC`,
      { type: db.Sequelize.QueryTypes.SELECT }
    );

    res.render("admin", {
      title: "Admin Panel",
      cssFile: "admin",
      users,
      hotels,
      rooms,
      reservations,
    });
  } catch (error) {
    console.error("❌ Error fetching admin data:", error);
    res.status(500).render("error", {
      title: "Admin Panel Error",
      status: 500,
      message: "Failed to load the admin panel.",
    });
  }
});

module.exports = router;
