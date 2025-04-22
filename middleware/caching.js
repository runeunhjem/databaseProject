const client = require("../redis.js");

async function cache(req, res, next) {
  try {
    const data = await client.get(req.originalUrl);
    if (data !== null) {
      console.log("♻️ Redis cache hit for", req.originalUrl);

      const parsed = JSON.parse(data);

      // Match "/hotels" or filtered hotel list
      if (req.originalUrl === "/hotels" || req.originalUrl.startsWith("/hotels?")) {
        return res.render("hotels", {
          title: "Hotels",
          cssFile: "hotels",
          hotels: Array.isArray(parsed) ? parsed : [], // safety check
        });
      }

      // Match "/hotels/123" (hotel detail)
      if (/^\/hotels\/\d+$/.test(req.originalUrl)) {
        return res.render("hotelDetails", {
          title: parsed.name || "Hotel",
          cssFile: "hotelDetails",
          hotel: parsed,
        });
      }

      // Optionally support more cache types here...

      // Fallback: skip to DB if unknown route
      console.log("🚧 Cache middleware skipping unhandled route:", req.originalUrl);
    }

    console.log("📡 Redis cache miss – fetching from DB");
    next();
  } catch (error) {
    console.error("❌ Redis cache error:", error);
    next(); // Fail-safe
  }
}

module.exports = cache;
