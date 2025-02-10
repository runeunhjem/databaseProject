const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

class HotelService {
  constructor(db) {
    this.client = db.sequelize;
    this.Hotel = db.Hotel;
    this.Rating = db.Rating;
    this.User = db.User;
    this.Room = db.Room;
  }

  // ✅ Create a hotel using raw SQL
  async create(name, location) {
    try {
      return await sequelize.query("INSERT INTO Hotels (name, location) VALUES (:name, :location)", {
        replacements: { name, location },
      });
    } catch (err) {
      console.error("Error creating hotel:", err);
      return err;
    }
  }

  // ✅ Get all hotels using raw SQL
  async get() {
    try {
      return await sequelize.query("SELECT * FROM Hotels", {
        type: QueryTypes.SELECT,
      });
    } catch (err) {
      console.error("Error fetching hotels:", err);
      return [];
    }
  }

  // ✅ Delete a hotel using raw SQL
  async deleteHotel(hotelId) {
    try {
      return await sequelize.query("DELETE FROM Hotels WHERE id = :hotelId", {
        replacements: { hotelId },
      });
    } catch (err) {
      console.error("Error deleting hotel:", err);
      return err;
    }
  }

  // ✅ Get hotel details with rooms
  async getHotelDetails(hotelId, userId) {
    try {
      const hotel = await sequelize.query(
        `SELECT h.id, h.name, h.location,
        IFNULL(ROUND(AVG(r.rating), 1), 'No ratings yet') AS avgRating
        FROM Hotels h
        LEFT JOIN Ratings r ON h.id = r.hotel_id
        WHERE h.id = :hotelId
        GROUP BY h.id`,
        {
          replacements: { hotelId },
          type: QueryTypes.SELECT,
        }
      );

      if (!hotel[0]) return null;

      const rooms = await sequelize.query(
        `SELECT ro.id, ro.capacity AS max_capacity, ro.price,
        CASE
          WHEN ro.capacity = 2 THEN 'Double Room'
          WHEN ro.capacity = 4 THEN 'Family Room'
          WHEN ro.capacity = 5 THEN 'Junior Suite'
          WHEN ro.capacity > 5 THEN 'Suite'
          ELSE CONCAT('Room for ', ro.capacity, ' people')
        END AS room_type,
        (SELECT COUNT(*) FROM Reservations r WHERE r.room_id = ro.id AND r.user_id = :userId) > 0 AS is_reserved
        FROM Rooms ro
        WHERE ro.hotel_id = :hotelId`,
        {
          replacements: { hotelId, userId },
          type: QueryTypes.SELECT,
        }
      );

      const userRateCount = await sequelize.query(
        `SELECT COUNT(*) as rated FROM Ratings
        WHERE hotel_id = :hotelId AND user_id = :userId`,
        {
          replacements: { hotelId, userId },
          type: QueryTypes.SELECT,
        }
      );

      hotel[0].rated = userRateCount[0].rated > 0;
      hotel[0].avgRating = hotel[0].avgRating === "No ratings yet" ? "No ratings yet" : parseFloat(hotel[0].avgRating);
      hotel[0].Rooms = rooms;

      return hotel[0];
    } catch (err) {
      console.error("Error fetching hotel details:", err);
      return null;
    }
  }

  // ✅ Rate a hotel using raw SQL
  async makeARate(userId, hotelId, value) {
    try {
      return await sequelize.query(
        `INSERT INTO Ratings (rating, hotel_id, user_id)
          VALUES (:value, :hotelId, :userId)`,
        {
          replacements: { userId, hotelId, value },
        }
      );
    } catch (err) {
      console.error("Error rating hotel:", err);
      return err;
    }
  }

  // ✅ Add Room to a Hotel (INSIDE CLASS NOW!)
  async addRoom(hotelId, capacity, price) {
    try {
      return await sequelize.query("INSERT INTO Rooms (hotel_id, capacity, price) VALUES (:hotelId, :capacity, :price)", {
        replacements: { hotelId, capacity, price },
      });
    } catch (err) {
      console.error("Error adding room:", err);
      return err;
    }
  }
}

module.exports = HotelService;
