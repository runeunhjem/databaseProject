const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

class HotelService {
  constructor(db) {
    this.client = db.sequelize;
    this.Hotel = db.Hotel;
    this.Rating = db.Rating;
    this.User = db.User;
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

  // ✅ Get hotel details using raw SQL (Including Average Rating)
  async getHotelDetails(hotelId) {
    try {
      // Retrieve hotel data with correct rating calculation
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

      // Check if the logged-in user has already rated this hotel
      const userRateCount = await sequelize.query(
        `SELECT COUNT(*) as rated FROM Ratings
          WHERE hotel_id = :hotelId AND user_id = :userId`,
        {
          replacements: { hotelId, userId: 1 },
          type: QueryTypes.SELECT,
        }
      );

      // ✅ Assign correct rating and check if user has rated
      hotel[0].rated = userRateCount[0].rated > 0;
      hotel[0].avgRating = hotel[0].avgRating === "No ratings yet" ? "No ratings yet" : parseFloat(hotel[0].avgRating);

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
}

module.exports = HotelService;
