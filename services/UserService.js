const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

class UserService {
  constructor(db) {
    this.client = db.sequelize;
    this.User = db.User;
    this.Room = db.Room;
    this.Hotel = db.Hotel;
    this.Reservation = db.Reservation;
  }

  // ✅ Get user details along with reservations, including `reservation_id`, `room_type`, and `max_capacity`
  async getOne(userId) {
    try {
      // Fetch user details
      const user = await sequelize.query(
        `SELECT id, firstName, lastName, email
         FROM Users
         WHERE id = :userId`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT,
        }
      );

      if (!user.length) return null; // Handle missing user

      // ✅ Fetch reservations with correct date format and missing fields
      const reservations = await sequelize.query(
        `SELECT
        r.id AS reservation_id,
        h.id AS hotel_id, /* ✅ Ensure hotel_id is selected */
        h.name AS hotelName,
        h.location AS hotelLocation,
        ro.id AS room_id,
        ro.capacity AS max_capacity,
        ro.price,
        CASE
          WHEN ro.capacity = 2 THEN 'Double Room'
          WHEN ro.capacity = 4 THEN 'Family Room'
          WHEN ro.capacity > 4 THEN 'Suite'
          ELSE CONCAT('Room for ', ro.capacity, ' people')
        END AS room_type,
        DATE_FORMAT(r.start_date, '%Y-%m-%d %H:%i') AS rentFrom,
        DATE_FORMAT(r.end_date, '%Y-%m-%d %H:%i') AS rentTo
      FROM Reservations r
      JOIN Rooms ro ON r.room_id = ro.id
      JOIN Hotels h ON ro.hotel_id = h.id
      WHERE r.user_id = :userId`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT,
        }
      );

      console.log("✅ User details retrieved:", { ...user[0], reservations });

      return { ...user[0], reservations };
    } catch (error) {
      console.error("❌ Error fetching user details:", error);
      throw error;
    }
  }
}

module.exports = UserService;
