const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserService = require("../services/UserService");
const db = require("../models");

const userService = new UserService(db);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await userService.findUserByUsername(username);

      if (!user) {
        return done(null, false, { message: "Incorrect username or password." });
      }

      const isValid = await userService.validatePassword(username, password);
      if (!isValid) {
        return done(null, false, { message: "Incorrect username or password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// ✅ Serialize user to store in session
passport.serializeUser((user, done) => {
  if (!user || !user.id) {
    return done(new Error("User ID is missing, cannot serialize user"));
  }
  done(null, user.id);
});

// ✅ Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.findUserById(id);
    if (!user) {
      return done(new Error("User not found during deserialization"));
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
