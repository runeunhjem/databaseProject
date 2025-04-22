// utils/cacheInvalidation.js
const client = require("../redis");

/**
 * Invalidates all cached Redis keys related to a specific hotel.
 * Call this after creating, updating, or deleting a hotel or its rooms.
 * @param {number|string} hotelId - The hotel ID to invalidate cache for.
 */
async function invalidateHotelCache(hotelId) {
  try {
    await Promise.all([client.del("/hotels"), client.del(`/hotels/${hotelId}`), client.del(`/hotels/${hotelId}/rooms`)]);
    console.log(`♻️ Redis cache invalidated for hotel ${hotelId}`);
  } catch (error) {
    console.error("❌ Failed to invalidate Redis cache:", error);
  }
}

module.exports = { invalidateHotelCache };
