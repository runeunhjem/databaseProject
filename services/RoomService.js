const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

class RoomService {
  constructor(db) {
    this.client = db.sequelize;
    this.Room = db.Room;
    this.Reservation = db.Reservation;
  }

  // ✅ Get all rooms with hotel info
  async getAllRooms(userId = null) {
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
      console.error("❌ Error fetching rooms:", err);
      return [];
    }
  }

  // ✅ Get all reservations for the admin panel
  async getAllReservations() {
    try {
      return await sequelize.query(
        `SELECT r.id AS id,
          u.id AS userId, CONCAT(u.firstName, ' ', u.lastName) AS userName, u.email,
          h.id AS hotelId, h.name AS hotelName, h.location AS hotelLocation,
          ro.id AS roomId,
          CASE
            WHEN ro.capacity = 2 THEN 'Double Room'
            WHEN ro.capacity = 4 THEN 'Family Room'
            WHEN ro.capacity = 5 THEN 'Junior Suite'
            WHEN ro.capacity > 5 THEN 'Suite'
            ELSE CONCAT('Room for ', ro.capacity, ' people')
          END AS roomType,
          ro.price AS roomPrice,
          DATE_FORMAT(r.start_date, '%d-%m-%Y') AS startDate,
          DATE_FORMAT(r.end_date, '%d-%m-%Y') AS endDate,
          (DATEDIFF(r.end_date, r.start_date) * ro.price) AS totalPrice
        FROM Reservations r
        JOIN Users u ON r.user_id = u.id
        JOIN Rooms ro ON r.room_id = ro.id
        JOIN Hotels h ON ro.hotel_id = h.id
        ORDER BY u.firstName ASC, u.lastName ASC, h.name ASC, r.start_date ASC`,
        {
          type: QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("❌ Error fetching reservations:", err);
      return [];
    }
  }

  // ✅ Get rooms for a specific hotel
  async getHotelRooms(hotelId, userId = null) {
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
        WHERE r.hotel_id = :hotelId
        ORDER BY r.capacity ASC, r.price ASC`,
        {
          replacements: { hotelId, userId },
          type: QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("❌ Error fetching hotel rooms:", err);
      return [];
    }
  }

  // ✅ Create a new room
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
      console.error("❌ Error deleting room:", err);
      return err;
    }
  }

  // ✅ Rent a room using the stored procedure
  async rentARoom(userId, roomId, startDate, endDate) {
    try {
      const result = await sequelize.query("CALL insert_reservation(:UserId, :RoomId, :StartDate, :EndDate)", {
        replacements: {
          UserId: userId,
          RoomId: roomId,
          StartDate: startDate,
          EndDate: endDate,
        },
      });
      return { success: true, message: "Reservation created successfully!", result };
    } catch (err) {
      console.error("❌ Error reserving room:", err);
      return { success: false, message: "Failed to create reservation. Please try again later." };
    }
  }

  // ✅ Get specific room details (including reservation status)
  async getRoomDetails(roomId, userId = null) {
    try {
      const room = await sequelize.query(
        `SELECT r.id, r.capacity, r.price, h.id AS hotelId, h.name AS hotelName, h.location,
        CASE
          WHEN r.capacity = 2 THEN 'Double Room'
          WHEN r.capacity = 4 THEN 'Family Room'
          WHEN r.capacity = 5 THEN 'Junior Suite'
          WHEN r.capacity > 5 THEN 'Suite'
          ELSE CONCAT('Room for ', r.capacity, ' people')
        END AS room_type,
        CASE
          WHEN EXISTS (SELECT 1 FROM Reservations WHERE room_id = r.id AND user_id = :userId)
          THEN 1 ELSE 0
        END AS is_reserved
      FROM Rooms r
      JOIN Hotels h ON r.hotel_id = h.id
      WHERE r.id = :roomId`,
        {
          replacements: { roomId, userId },
          type: QueryTypes.SELECT,
        }
      );

      if (!room.length) return null;

      return room[0]; // ✅ Ensure it returns an object
    } catch (err) {
      console.error("❌ Error fetching room details:", err);
      throw err;
    }
  }

  async getReservationsByHotel(hotelId) {
    try {
      return await sequelize.query(
        `SELECT r.id AS reservationId,
          u.firstName, u.lastName, u.email,
          ro.id AS roomId, ro.capacity AS roomCapacity, ro.price AS roomPrice,
          DATE_FORMAT(r.start_date, '%d-%m-%Y') AS startDate,
          DATE_FORMAT(r.end_date, '%d-%m-%Y') AS endDate,
          (DATEDIFF(r.end_date, r.start_date) * ro.price) AS totalPrice
        FROM Reservations r
        JOIN Users u ON r.user_id = u.id
        JOIN Rooms ro ON r.room_id = ro.id
        WHERE ro.hotel_id = :hotelId
        ORDER BY r.start_date DESC`,
        {
          replacements: { hotelId },
          type: QueryTypes.SELECT,
        }
      );
    } catch (err) {
      console.error("❌ Error fetching reservations for hotel:", err);
      return [];
    }
  }
}

module.exports = RoomService;
