const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

class RoomService {
  constructor(db) {
    this.client = db.sequelize;
    this.Room = db.Room;
    this.Reservation = db.Reservation;
  }

  // ✅ Get all rooms with hotel info, updated room labels
  async getAllRooms(userId = 1) {
    try {
      return await sequelize.query(
        `SELECT r.*, h.name AS hotel_name, h.location AS hotel_location, h.id AS hotel_id,
          CASE
            WHEN r.capacity = 2 THEN 'Double Room'
            WHEN r.capacity = 4 THEN 'Family Room'
            WHEN r.capacity = 5 THEN 'Junior Suite'
            WHEN r.capacity > 5 THEN 'Suite'
            ELSE CONCAT('Room for ', r.capacity, ' people')
          END AS room_type,
          r.capacity AS max_capacity,
          CASE
            WHEN EXISTS (SELECT 1 FROM Reservations WHERE room_id = r.id AND user_id = :userId)
            THEN 1 ELSE 0
          END AS is_reserved
         FROM Rooms r
         JOIN Hotels h ON r.hotel_id = h.id`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("Error fetching rooms:", err);
      return [];
    }
  }

  // ✅ Get rooms for a specific hotel
  async getHotelRooms(hotelId, userId = 1) {
    try {
      return await sequelize.query(
        `SELECT r.*, h.name AS hotel_name, h.location AS hotel_location, h.id AS hotel_id,
          CASE
            WHEN r.capacity = 2 THEN 'Double Room'
            WHEN r.capacity = 4 THEN 'Family Room'
            WHEN r.capacity = 5 THEN 'Junior Suite'
            WHEN r.capacity > 5 THEN 'Suite'
            ELSE CONCAT('Room for ', r.capacity, ' people')
          END AS room_type,
          r.capacity AS max_capacity,
          CASE
            WHEN EXISTS (SELECT 1 FROM Reservations WHERE room_id = r.id AND user_id = :userId)
            THEN 1 ELSE 0
          END AS is_reserved
          FROM Rooms r
          JOIN Hotels h ON r.hotel_id = h.id
          WHERE r.hotel_id = :hotelId`,
        {
          replacements: { hotelId, userId },
          type: QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("Error fetching hotel rooms:", err);
      return [];
    }
  }

  // ✅ Create a room
  async create(capacity, price, hotelId) {
    try {
      return await sequelize.query("INSERT INTO Rooms (capacity, price, hotel_id) VALUES (:capacity, :price, :hotelId)", {
        replacements: { capacity, price, hotelId },
        type: QueryTypes.INSERT,
      });
    } catch (err) {
      console.error("❌ Error adding room:", err);
      throw err;
    }
  }

  // ✅ Delete a room
  async deleteRoom(roomId) {
    try {
      return await sequelize.query("DELETE FROM Rooms WHERE id = :roomId", {
        replacements: { roomId },
      });
    } catch (err) {
      console.error("Error deleting room:", err);
      return err;
    }
  }

  // ✅ Rent a room (create reservation)
  async rentARoom(userId, roomId, startDate, endDate) {
    try {
      await sequelize.query(
        "INSERT INTO Reservations (user_id, room_id, start_date, end_date) VALUES (:userId, :roomId, :startDate, :endDate)",
        {
          replacements: { userId, roomId, startDate, endDate },
        }
      );
      return { success: true, message: "Reservation created successfully!" };
    } catch (err) {
      console.error("❌ Error renting a room:", err);
      return { success: false, message: "An error occurred during reservation." };
    }
  }
}

module.exports = RoomService;
