const express = require("express");
const router = express.Router();
const db = require("../models");
const { checkIfAuthorized } = require("./authMiddleware");

/* ✅ DELETE: Cancel reservation */
router.delete("/:reservationId", async (req, res) => {
  /* #swagger.tags = ['Reservations']
     #swagger.description = "Cancel an existing reservation by its ID."
     #swagger.path = "/reservations/{reservationId}"
     #swagger.produces = ["application/json"]
     #swagger.parameters['reservationId'] = {
        in: 'path',
        description: 'ID of the reservation to be deleted.',
        required: true,
        type: 'integer'
     }
     #swagger.responses[200] = {
        description: "Reservation canceled successfully.",
        content: {
          "application/json": {
            schema: { message: "✅ Reservation canceled successfully!" }
          }
        }
     }
     #swagger.responses[400] = {
        description: "Bad request - Reservation ID is required.",
        content: { "application/json": { schema: { message: "Reservation ID is required." } } }
     }
     #swagger.responses[404] = {
        description: "Reservation not found.",
        content: { "application/json": { schema: { message: "Reservation not found." } } }
     }
     #swagger.responses[500] = {
        description: "Internal server error - Failed to cancel reservation.",
        content: { "application/json": { schema: { message: "Failed to cancel reservation." } } }
     }
  */
  try {
    const { reservationId } = req.params;

    if (!reservationId) {
      return res.status(400).json({ message: "Reservation ID is required." });
    }

    // ✅ Attempt to delete reservation by `id`
    const result = await db.Reservation.destroy({ where: { id: reservationId } });

    if (result === 0) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res.json({ message: "✅ Reservation canceled successfully!" });
  } catch (error) {
    console.error("❌ Error deleting reservation:", error);
    res.status(500).json({ message: "Failed to cancel reservation." });
  }
});

/* ✅ GET Reservation Details */
router.get("/:reservationId", async function (req, res, next) {
  /* #swagger.tags = ['Reservations']
     #swagger.description = "Retrieve details of a specific reservation."
     #swagger.path = "/reservations/{reservationId}"
     #swagger.produces = ["text/html"]
     #swagger.parameters['reservationId'] = {
        in: 'path',
        description: 'ID of the reservation to retrieve.',
        required: true,
        type: 'integer'
     }
     #swagger.responses[200] = {
        description: "Reservation details retrieved successfully.",
        content: {
          "text/html": {
            schema: {
              title: "Reservation Details",
              reservation: {
                id: 1,
                user: { id: 3, name: "John Doe", email: "john@example.com" },
                hotel: { id: 2, name: "Grand Hotel", location: "New York" },
                room: { id: 5, type: "Suite", price: 200 },
                startDate: "2025-03-20",
                endDate: "2025-03-25"
              }
            }
          }
        }
     }
     #swagger.responses[404] = {
        description: "Reservation not found.",
        content: { "text/html": { schema: { title: "Error", message: "Reservation Not Found" } } }
     }
     #swagger.responses[500] = {
        description: "Internal server error - Failed to fetch reservation details.",
        content: { "text/html": { schema: { title: "Error", message: "Internal Server Error" } } }
     }
  */
  try {
    const reservation = await db.Reservation.findOne({
      where: { id: req.params.reservationId },
      include: [
        { model: db.User, attributes: ["id", "name", "email"] },
        { model: db.Hotel, attributes: ["id", "name", "location"] },
        { model: db.Room, attributes: ["id", "type", "price"] },
      ],
    });

    if (!reservation) {
      return res.status(404).render("error", {
        title: "Reservation Not Found",
        status: 404,
        message: "Reservation Not Found",
        details: `The reservation with ID ${req.params.reservationId} does not exist.`,
      });
    }

    res.render("reservationDetails", {
      title: "Reservation Details",
      cssFile: "reservationDetails",
      reservation,
    });
  } catch (error) {
    console.error("❌ Error fetching reservation details:", error);
    res.status(500).render("error", {
      title: "Internal Server Error",
      status: 500,
      message: "An error occurred while fetching the reservation details.",
    });
  }
});

/* ✅ POST create a new reservation (Only Authorized Users) */
router.post("/", checkIfAuthorized, async (req, res) => {
  console.log("📩 Incoming reservation request:", req.body);

  /* #swagger.tags = ['Reservations']
     #swagger.description = "Create a new reservation (Only authorized users)."
     #swagger.path = "/reservations"
     #swagger.consumes = ["application/json"]
     #swagger.parameters['body'] = {
        in: 'body',
        description: 'Room reservation details.',
        required: true,
        schema: {
          userId: 1,
          roomId: 5,
          startDate: "2025-03-20",
          endDate: "2025-03-25"
        }
     }
     #swagger.responses[200] = {
        description: "Room reserved successfully.",
        content: {
          "application/json": {
            schema: {
              success: true,
              message: "✅ Room reserved successfully!"
            }
          }
        }
     }
     #swagger.responses[400] = {
        description: "Bad request - Invalid reservation data.",
        content: {
          "application/json": {
            schema: { message: "❌ Invalid request data." }
          }
        }
     }
     #swagger.responses[401] = {
        description: "Unauthorized - User must be logged in."
     }
     #swagger.responses[500] = {
        description: "Internal server error - Failed to reserve room.",
        content: {
          "application/json": {
            schema: { message: "❌ Failed to reserve room." }
          }
        }
     }
  */

  try {
    const { userId, roomId, startDate, endDate } = req.body;

    if (!userId || !roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "❌ Missing required fields!" });
    }

    const user = await db.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ message: "❌ Unauthorized - User not found." });
    }

    await db.Reservation.create({
      user_id: userId,
      room_id: roomId,
      start_date: startDate,
      end_date: endDate,
    });

    res.status(200).json({ success: true, message: "✅ Room reserved successfully!" });
  } catch (error) {
    console.error("❌ Error reserving room:", error);

    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => err.message);
      return res.status(400).json({ message: "❌ Validation failed.", errors: validationErrors });
    }

    res.status(500).json({ message: "❌ Failed to reserve room.", error: error.message });
  }
});

module.exports = router;
