const db = require("./models");

async function testAssociations() {
  try {
    // Sync database (WARNING: force=true will reset all data)
    await db.sequelize.sync({ force: true });
    console.log("✅ Database synced successfully!");

    // Create test user
    const user = await db.User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "securepassword",
    });


    // Create test hotel
    const hotel = await db.Hotel.create({
      name: "Grand Hotel",
      location: "New York",
      avg_rating: 4.5,
    });

    // Create test room
    const room = await db.Room.create({
      hotel_id: hotel.id,
      capacity: 2,
      price: 100.0,
    });

    // Create a reservation
    const reservation = await db.Reservation.create({
      user_id: user.id,
      room_id: room.id,
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2-day reservation
    });

    // Create a hotel rating
    const rating = await db.Rating.create({
      user_id: user.id,
      hotel_id: hotel.id,
      rating: 5,
    });

    // Fetch and log results to verify associations
    const fetchedUser = await db.User.findOne({
      where: { id: user.id },
      include: [db.Reservation, db.Rating],
    });

    console.log("🧑‍💻 User Data with Associations:");
    console.log(JSON.stringify(fetchedUser, null, 2));
  } catch (error) {
    console.error("❌ Error testing associations:", error);
  } finally {
    db.sequelize.close(); // Close connection after test
  }
}

testAssociations();
