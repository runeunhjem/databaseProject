module.exports = {
  // ✅ Ensure user is logged in (for User & Admin access)
  checkIfAuthorized: function (req, res, next) {
    if (!req.user) {
      return res.status(401).send("Unauthorized Access");
    }
    if (req.user.role === "Admin" || req.user.role === "User") {
      return next();
    }
    return res.status(403).send("Forbidden");
  },

  // ✅ Ensure only Admins can access this route
  checkIfAdmin: function (req, res, next) {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).send("Forbidden: Admin access only.");
    }
    return next();
  },

  // ✅ Allow users to view their own details, or Admins to view all users
  canSeeUserDetails: function (req, res, next) {
    if (req.user) {
      if (req.user.role === "Admin" || req.user.id == req.params.userId) {
        return next();
      }
    }
    return res.redirect("/auth/login");
  },

  // ✅ Allow Admins to view the list of all users
  canSeeUserList: function (req, res, next) {
    if (req.user && req.user.role === "Admin") {
      next();
      return;
    }
    res.redirect("/auth/login");
  },
};
