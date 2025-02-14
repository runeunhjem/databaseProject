var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var db = require("./models");
const session = require("express-session");
const passport = require("./config/passport");
const SQLiteStore = require("connect-sqlite3")(session);
const flash = require("connect-flash");

var app = express(); // ✅ Ensure `app` is defined before using it

const adminRouter = require("./routes/admin"); // ✅ Add this at the top

// ✅ Middleware Order Matters!
// 📌 Place these BEFORE route declarations to ensure body parsing works correctly
app.use(express.json()); // ✅ Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // ✅ Parse URL-encoded form data
app.use(cookieParser());

// ✅ Session Setup
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.sqlite" }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Middleware: Make `user` available globally in all views (AFTER session setup)
app.use((req, res, next) => {
  res.locals.user = req.user || null; // ✅ Make `user` available globally in all views
  next();
});

// ✅ View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ✅ After session middleware
app.use(flash());

// ✅ Logging
app.use(logger(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// ✅ Serve Static Files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes (Define AFTER Middleware)
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));
app.use("/hotels", require("./routes/hotels"));
app.use("/rooms", require("./routes/rooms"));
app.use("/reservations", require("./routes/reservations"));
app.use("/auth", require("./routes/auth")); // ✅ Keep auth route last for clarity
app.use("/admin", adminRouter); // ✅ Register the admin route

// ✅ Database Sync
db.sequelize
  .sync()
  .then(() => console.log("✅ Database synced successfully!"))
  .catch((err) => console.error("❌ Database sync failed:", err));

// ✅ Handle 404 Errors
app.use((req, res, next) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    status: 404,
    message: "Page not found",
    details: `The URL ${req.originalUrl} does not exist.`,
  });
});

// ✅ General Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).render("error", {
    title: "Error",
    status: err.status || 500,
    message: err.message || "Something went wrong!",
    details: req.app.get("env") === "development" ? err.stack : "",
  });
});

// ✅ Make flash messages available globally
app.use((req, res, next) => {
  res.locals.messages = {
    success: req.flash("success"),
    error: req.flash("error"),
  };
  next();
});

module.exports = app;








