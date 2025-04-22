const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  url: `${process.env.REDIS_PROTOCOL}://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
