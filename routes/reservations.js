const express = require("express");
const router = express.Router();
const db = require("../models");

// ✅ DELETE: Cancel reservation
router.delete("/:reservationId", async (req, res) => {
  try {
    const { reservationId } = req.params; // ✅ Fix: Ensure we extract reservationId

    if (!reservationId) {
      return res.status(400).json({ message: "Reservation ID is required." });
    }

    // ✅ Fix: Ensure we delete by `id` and not an undefined value
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

// ✅ GET Reservation Details
router.get("/:reservationId", async function (req, res, next) {
  try {
    const reservation = await reservationService.getOne(req.params.reservationId);

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


module.exports = router;
