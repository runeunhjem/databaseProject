const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserService = require("../services/UserService");
const db = require("../models");

const userService = new UserService(db);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await userService.findUserByUsername(username);
    if (!user) return done(null, false, { message: "Incorrect username." });

    const isValid = await userService.validatePassword(username, password);
    if (!isValid) return done(null, false, { message: "Incorrect password." });

    return done(null, user);
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await db.User.findByPk(id);
  done(null, user);
});

module.exports = passport;
