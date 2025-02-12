const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const crypto = require("crypto"); // ✅ Use SHA-256 instead of bcrypt

class UserService {
  constructor(db) {
    this.client = db.sequelize;
    this.User = db.User;
    this.Room = db.Room;
    this.Hotel = db.Hotel;
    this.Reservation = db.Reservation;
  }

  // ✅ SHA-256 Hashing Function
  hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  // ✅ Create a new user with hashed password
  async createUser(username, password, firstName, lastName, email, role = "User") {
    const hashedPassword = this.hashPassword(password);

    try {
      await this.User.create({
        username,
        password: hashedPassword, // ✅ Store SHA-256 hashed password
        firstName,
        lastName,
        email,
        role,
      });
      return { success: true, message: "User created successfully!" };
    } catch (error) {
      console.error("❌ Error creating user:", error);
      return { success: false, message: "User creation failed." };
    }
  }

  // ✅ Find a user by username
  async findUserByUsername(username) {
    return await this.User.findOne({ where: { username } });
  }

  // ✅ Validate password using SHA-256 hashing
  async validatePassword(username, inputPassword) {
    const user = await this.findUserByUsername(username);
    if (!user) return false;

    const hashedInput = this.hashPassword(inputPassword);
    return hashedInput === user.password;
  }

  // ✅ Get user details including reservations
  async getOne(userId) {
    try {
      // ✅ Fetch user details
      const user = await sequelize.query(
        `SELECT id, firstName, lastName, email, role
         FROM Users
         WHERE id = :userId`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT,
        }
      );

      if (!user.length) return null;

      // ✅ Fetch reservations
      const reservations = await sequelize.query(
        `SELECT
          r.id AS reservation_id,
          h.id AS hotel_id,
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
