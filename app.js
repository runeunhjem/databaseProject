// app.js
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const db = require("./models");
const session = require("express-session");
const passport = require("./config/passport");
const SQLiteStore = require("connect-sqlite3")(session);
const flash = require("connect-flash");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
const bodyParser = require("body-parser");
require("./redis");

const app = express();

const adminRouter = require("./routes/admin");
const startRouter = require("./routes/start");

// Middleware setup
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Session setup
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true, // Ensures session is created before checking first visit
    store: new SQLiteStore({ db: "sessions.sqlite" }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Redirect first-time visitors to `/start`
app.use((req, res, next) => {
  if (!req.session.firstVisit) {
    req.session.firstVisit = true;
    return res.redirect("/start");
  }
  next();
});

// Make `user` available globally in all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Logging
app.use(logger(process.env.NODE_ENV === "development" ? "dev" : "tiny"));
app.use(express.static(path.join(__dirname, "public")));

// Flash messages middleware (After session)
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  next();
});

// Routes
app.use("/", require("./routes/index"));
app.use("/start", startRouter);
app.use("/admin", adminRouter);
app.use("/users", require("./routes/users"));
app.use("/hotels", require("./routes/hotels"));
app.use("/rooms", require("./routes/rooms")); // ✅ Added Manage Rooms Route
app.use("/reservations", require("./routes/reservations"));
app.use("/auth", require("./routes/auth"));

// Swagger middleware (Placed after route declarations)
app.use(bodyParser.json());
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Database sync
db.sequelize
  .sync()
  .then(() => console.log("✅ Database synced successfully!"))
  .catch((err) => console.error("❌ Database sync failed:", err));

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    status: 404,
    message: "Page not found",
    details: `The URL ${req.originalUrl} does not exist.`,
  });
});

// General error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).render("error", {
    title: "Error",
    status: err.status || 500,
    message: err.message || "Something went wrong!",
    details: req.app.get("env") === "development" ? err.stack : "",
  });
});

module.exports = app;

