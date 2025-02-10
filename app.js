var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var db = require("./models");

// If you need to force-drop & recreate tables for testing, change:
// db.sequelize.sync({ force: true }); // ⚠️ This will delete ALL data & recreate tables
// Only use { force: true; } if you need a fresh database for testing.

db.sequelize
  .sync()
  .then(() => {
    console.log("✅ Database synced successfully!");
  })
  .catch((err) => {
    console.error("❌ Database sync failed:", err);
  });

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var hotelsRouter = require("./routes/hotels");
var roomsRouter = require("./routes/rooms");
const reservationsRouter = require("./routes/reservations");


var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

if (process.env.NODE_ENV === "development") {
  app.use(logger("dev")); // Detailed logging in dev mode
} else {
  app.use(logger("combined")); // Standard logging in production
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/hotels", hotelsRouter);
app.use("/rooms", roomsRouter);
app.use("/reservations", reservationsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;


