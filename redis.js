const { createClient } = require("redis");
const redisClient = createClient({
  url: "rediss://***REMOVED***:***REMOVED***@***REMOVED***:12753",
});
redisClient.connect().catch(console.error);

module.exports = redisClient;
