const client = require("../redis.js");

async function cache(req, res, next) {
  try {
    const data = await client.get(req.originalUrl);
    if (data !== null) {
      console.log("♻️ Redis cache hit for", req.originalUrl);
      return res.render("hotels", {
        title: "Hotels",
        cssFile: "hotels",
        hotels: JSON.parse(data),
      });
    }
    console.log("📡 Redis cache miss – fetching from DB");
    next();
  } catch (error) {
    console.error("❌ Redis cache error:", error);
    next(); // Dont stop the request if there's an error with Redis
  }
}

module.exports = cache;
