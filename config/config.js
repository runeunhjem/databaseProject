const fs = require("fs"); // Comment out when not using SSL (e.g., in development)
require("dotenv").config();

// Comment out the following line when not using SSL (e.g., in development)
const sslConfig = {
  ssl: {
    require: true,
    rejectUnauthorized: true,
    ca: fs.readFileSync(__dirname + "/ca.pem").toString(),
  },
};

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || "database_development",
    port: process.env.DB_PORT || 3306,
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "mysql",
    dialectOptions: sslConfig, // Comment out when not using SSL (e.g., in development)
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || "database_test",
    port: process.env.DB_PORT || 3306,
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "mysql",
    dialectOptions: sslConfig, // Comment out when not using SSL (e.g., in development)
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || null,
    database: process.env.DB_NAME || "database_production",
    port: process.env.DB_PORT || 3306,
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "mysql",
    dialectOptions: sslConfig, // Comment out when not using SSL (e.g., in development)
  },
};

