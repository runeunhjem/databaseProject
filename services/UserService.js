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

  // ✅ Get user details along with reservations
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

      // ✅ Fetch reservations with correct date format
      const reservations = await sequelize.query(
        `SELECT
            h.name AS hotelName,
            h.location AS hotelLocation,
            ro.capacity,
            ro.price,
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
