const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

class HotelService {
  constructor(db) {
    this.client = db.sequelize;
    this.Hotel = db.Hotel;
  }

  // ✅ Create a hotel using raw SQL
  async create(name, location) {
    return await sequelize
      .query("INSERT INTO Hotels (name, location) VALUES (:name, :location)", { replacements: { name, location } })
      .catch((err) => err);
  }

  // ✅ Get all hotels using raw SQL
  async get() {
    return await sequelize.query("SELECT * FROM Hotels", { type: QueryTypes.SELECT });
  }

  // ✅ Delete a hotel using raw SQL
  async deleteHotel(hotelId) {
    return await sequelize
      .query("DELETE FROM Hotels WHERE id = :hotelId", { replacements: { hotelId } })
      .catch((err) => err);
  }
}

module.exports = HotelService;
