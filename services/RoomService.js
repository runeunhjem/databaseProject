const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

class RoomService {
  constructor(db) {
    this.client = db.sequelize;
    this.Room = db.Room;
    this.Reservation = db.Reservation; // ✅ Ensures Reservations are accessible
  }

  // ✅ Get all rooms using raw SQL
  async get() {
    try {
      return await sequelize.query("SELECT * FROM Rooms", { type: QueryTypes.SELECT });
    } catch (err) {
      console.error("Error fetching rooms:", err);
      return [];
    }
  }

  // ✅ Get all rooms for a specific hotel, formatted per school guidelines
  async getHotelRooms(hotelId) {
    try {
      return await sequelize.query(
        `SELECT r.*,
         CASE
            WHEN r.capacity = 2 THEN 'Room for 2 people'
            WHEN r.capacity = 4 THEN 'Room for 4 people'
            ELSE CONCAT('Room for ', r.capacity, ' people')
         END AS capacityLabel,
         CASE
            WHEN EXISTS (SELECT 1 FROM Reservations WHERE room_id = r.id AND user_id = 1)
            THEN 1 ELSE 0
         END AS isReserved
         FROM Rooms r WHERE r.hotel_id = :hotelId`,
        {
          replacements: { hotelId },
          type: QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("Error fetching hotel rooms:", err);
      return [];
    }
  }

  // ✅ Create a room using raw SQL
  async create(capacity, price, hotelId) {
    return await sequelize.query("INSERT INTO Rooms (capacity, price, hotel_id) VALUES (:capacity, :price, :hotelId)", {
      replacements: { capacity, price, hotelId },
    });
  }

  // ✅ Delete a room using raw SQL
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

  // ✅ Rent a specified room using raw SQL
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

      // If the error is from the trigger, send a specific response
      if (err.original && err.original.sqlMessage.includes("User already has a reservation")) {
        return { success: false, message: "You already have a reservation for this room at that time." };
      }

      return { success: false, message: "An unexpected error occurred." };
    }
  }
}

module.exports = RoomService;
